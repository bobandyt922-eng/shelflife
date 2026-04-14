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

  const text = await resp.text();

  if (!resp.ok) {
    return { error: `OAuth failed (${resp.status}): ${text}` };
  }

  try {
    const data = JSON.parse(text);
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return cachedToken;
  } catch (e) {
    return { error: `OAuth parse failed: ${text.substring(0, 200)}` };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "";
  const publisher = searchParams.get("publisher") || "";
  const edition = searchParams.get("edition") || "";

  if (!title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!EBAY_APP_ID || !EBAY_CERT_ID) {
    return NextResponse.json({
      error: "eBay API not configured",
      debug: { hasAppId: !!EBAY_APP_ID, hasCertId: !!EBAY_CERT_ID },
    }, { status: 500 });
  }

  try {
    const tokenResult = await getEbayToken();

    // If token is an error object
    if (typeof tokenResult === "object" && tokenResult.error) {
      return NextResponse.json({
        error: "eBay authentication failed",
        debug: tokenResult.error,
        results: [],
      });
    }

    const token = tokenResult;
    const query = buildSearchQuery(title, publisher, edition);

    // Search eBay Browse API - no category filter for broader results
    const ebayUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    ebayUrl.searchParams.set("q", query);
    ebayUrl.searchParams.set("limit", "25");

    const resp = await fetch(ebayUrl.toString(), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
    });

    const responseText = await resp.text();

    if (!resp.ok) {
      return NextResponse.json({
        error: "eBay search failed",
        debug: { status: resp.status, response: responseText.substring(0, 500) },
        results: [],
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({
        error: "Failed to parse eBay response",
        debug: responseText.substring(0, 500),
        results: [],
      });
    }

    const items = data.itemSummaries || [];

    const scored = items.map(item => {
      const itemTitle = item.title || "";
      const price = parseFloat(item.price?.value || "0");
      const condition = item.condition || "";
      const imageUrl = item.thumbnailImages?.[0]?.imageUrl || item.image?.imageUrl || "";
      const listingUrl = item.itemWebUrl || "";

      const score = calculateMatchScore(itemTitle, title, publisher, edition);

      return { title: itemTitle, price, condition, imageUrl, listingUrl, score, date: "Current" };
    });

    const filtered = scored
      .filter(item => item.score >= 25 && item.price > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return NextResponse.json({
      results: filtered,
      query,
      totalRaw: items.length,
      totalFiltered: filtered.length,
    });

  } catch (error) {
    return NextResponse.json({
      error: "Unexpected error",
      debug: error.message,
      results: [],
    });
  }
}

function buildSearchQuery(title, publisher, edition) {
  let parts = [title];
  if (publisher) {
    const pubMap = {
      "Cemetery Dance": "Cemetery Dance", "Subterranean Press": "Subterranean Press",
      "Suntup Editions": "Suntup", "Centipede Press": "Centipede Press",
      "Gauntlet Press": "Gauntlet", "Borderlands Press": "Borderlands",
      "Thunderstorm Books": "Thunderstorm", "PS Publishing": "PS Publishing",
      "Charnel House": "Charnel House", "Dark Regions Press": "Dark Regions",
      "Delirium Press": "Delirium",
    };
    parts.push(pubMap[publisher] || publisher);
  }
  if (edition) {
    const el = edition.toLowerCase();
    if (el.includes("lettered")) parts.push("lettered");
    else if (el.includes("numbered")) parts.push("numbered");
    else if (el.includes("traycase")) parts.push("traycase");
    else if (el.includes("deluxe")) parts.push("deluxe");
    else if (el.includes("first edition") || el.includes("first printing")) parts.push("first edition");
    else if (el.includes("signed")) parts.push("signed");
  }
  return parts.join(" ");
}

function calculateMatchScore(listingTitle, bookTitle, publisher, edition) {
  const lt = listingTitle.toLowerCase();
  const bt = bookTitle.toLowerCase();
  let score = 0;

  const titleWords = bt.split(/\s+/).filter(w => w.length > 2);
  const matchedWords = titleWords.filter(w => lt.includes(w));
  if (titleWords.length > 0) score += Math.round((matchedWords.length / titleWords.length) * 40);
  if (lt.includes(bt)) score += 10;

  if (publisher) {
    const pubWords = publisher.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (pubWords.some(w => lt.includes(w))) score += 20;
  }

  if (edition) {
    const editionTerms = {
      "lettered": ["lettered", "letter"], "numbered": ["numbered", "limited", "#"],
      "traycased": ["traycase"], "deluxe": ["deluxe"],
      "first edition": ["first edition", "1st edition"], "signed": ["signed", "autograph"],
    };
    const el = edition.toLowerCase();
    for (const [key, terms] of Object.entries(editionTerms)) {
      if (el.includes(key)) { if (terms.some(t => lt.includes(t))) score += 20; break; }
    }
  }

  if (lt.includes("lot of") || lt.includes("book lot")) score -= 30;
  if (lt.includes("dvd") || lt.includes("blu-ray") || lt.includes("audiobook")) score -= 50;

  return Math.max(0, Math.min(100, score));
}
