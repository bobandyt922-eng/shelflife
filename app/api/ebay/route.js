import { NextResponse } from "next/server";

const EBAY_APP_ID = process.env.EBAY_APP_ID;
const EBAY_CERT_ID = process.env.EBAY_CERT_ID;

let cachedToken = null;
let tokenExpiry = 0;

async function getEbayToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const credentials = Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString("base64");
  const resp = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  if (!resp.ok) return null;

  const data = await resp.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function searchEbay(token, query) {
  const ebayUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  ebayUrl.searchParams.set("q", query);
  ebayUrl.searchParams.set("limit", "25");

  const resp = await fetch(ebayUrl.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });

  if (!resp.ok) return [];
  const data = await resp.json();
  return data.itemSummaries || [];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "";
  const author = searchParams.get("author") || "";
  const publisher = searchParams.get("publisher") || "";
  const edition = searchParams.get("edition") || "";

  if (!title.trim()) {
    return NextResponse.json({ error: "Title is required", results: [] });
  }

  if (!EBAY_APP_ID || !EBAY_CERT_ID) {
    return NextResponse.json({ error: "eBay API not configured", results: [] });
  }

  try {
    const token = await getEbayToken();
    if (!token) {
      return NextResponse.json({ error: "eBay auth failed", results: [] });
    }

    // Try multiple search strategies and combine results
    const authorLast = author ? author.split(" ").pop() : "";
    const queries = [
      title + (authorLast ? " " + authorLast : ""),           // "Pines Crouch"
      title + (publisher ? " " + publisher : ""),              // "Pines Gauntlet Press"
      title + " " + (authorLast || "") + " signed limited",   // "Pines Crouch signed limited"
    ].filter(q => q.trim());

    // Run searches in parallel
    const allResults = await Promise.all(queries.map(q => searchEbay(token, q)));

    // Merge and deduplicate by item ID or title
    const seen = new Set();
    const merged = [];
    allResults.flat().forEach(item => {
      const key = item.itemId || item.title;
      if (!seen.has(key)) { seen.add(key); merged.push(item); }
    });

    // Score every result
    const scored = merged.map(item => {
      const itemTitle = item.title || "";
      const price = parseFloat(item.price?.value || "0");
      const condition = item.condition || "";
      const imageUrl = item.thumbnailImages?.[0]?.imageUrl || item.image?.imageUrl || "";
      const listingUrl = item.itemWebUrl || "";

      const score = calculateMatchScore(itemTitle, title, author, publisher, edition);

      return { title: itemTitle, price, condition, imageUrl, listingUrl, score, date: "Active" };
    });

    const filtered = scored
      .filter(item => item.score >= 20 && item.price > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return NextResponse.json({
      results: filtered,
      queries,
      totalRaw: merged.length,
      totalFiltered: filtered.length,
    });

  } catch (error) {
    return NextResponse.json({ error: "Unexpected error: " + error.message, results: [] });
  }
}

function calculateMatchScore(listingTitle, bookTitle, author, publisher, edition) {
  const lt = listingTitle.toLowerCase();
  const bt = bookTitle.toLowerCase();
  let score = 0;

  // Title matching (0-50 points)
  const titleWords = bt.split(/\s+/).filter(w => w.length > 1);
  const matchedWords = titleWords.filter(w => lt.includes(w));
  if (titleWords.length > 0) {
    score += Math.round((matchedWords.length / titleWords.length) * 40);
  }
  if (lt.includes(bt)) score += 10;

  // Author matching (0-10 points)
  if (author) {
    const authorLast = author.split(" ").pop().toLowerCase();
    if (lt.includes(authorLast)) score += 10;
    // Full author name bonus
    if (lt.includes(author.toLowerCase())) score += 5;
  }

  // Publisher matching (0-20 points)
  if (publisher) {
    const pl = publisher.toLowerCase();
    if (lt.includes(pl)) {
      score += 20;
    } else {
      const pubWords = pl.split(/\s+/).filter(w => w.length > 2);
      const matched = pubWords.filter(w => lt.includes(w));
      if (matched.length > 0) score += Math.round((matched.length / pubWords.length) * 15);
    }
  }

  // Edition matching (0-20 points)
  if (edition) {
    const editionTerms = {
      "lettered": ["lettered", "letter ed"],
      "numbered": ["numbered", "limited", "/500", "/750", "/1000", "/250", "/350"],
      "traycased": ["traycase", "traycased"],
      "deluxe": ["deluxe", "dlx"],
      "first edition": ["first edition", "1st edition", "1st ed", "1st/1st", "first printing"],
      "signed": ["signed", "autograph", "autographed"],
    };
    const el = edition.toLowerCase();
    for (const [key, terms] of Object.entries(editionTerms)) {
      if (el.includes(key)) {
        if (terms.some(t => lt.includes(t))) score += 20;
        break;
      }
    }
  }

  // Book-related bonus
  if (lt.includes("hardcover") || lt.includes("paperback") || lt.includes("edition") ||
      lt.includes("press") || lt.includes("signed") || lt.includes("printing")) {
    score += 5;
  }

  // Penalties
  if (lt.includes("dvd") || lt.includes("blu-ray") || lt.includes("vhs") ||
      lt.includes("audiobook") || lt.includes("board game") || lt.includes("video game") ||
      lt.includes("funko") || lt.includes("poster") || lt.includes("t-shirt") ||
      lt.includes("vinyl") || lt.includes("soundtrack") || lt.includes("cd ")) {
    score -= 50;
  }
  if (lt.includes("lot of") || lt.includes("book lot") || lt.includes("bundle of")) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}
