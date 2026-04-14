import { NextResponse } from "next/server";

const EBAY_APP_ID = process.env.EBAY_APP_ID;
const EBAY_CERT_ID = process.env.EBAY_CERT_ID;

let cachedToken = null;
let tokenExpiry = 0;
const EDITION_CLASS_RULES = [
  { key: "lettered", terms: ["lettered", "letter ed", "roman numeral"] },
  { key: "numbered", terms: ["numbered", "numbered edition", "limited numbered"] },
  { key: "traycased", terms: ["traycased", "traycase", "slipcased", "slipcase"] },
  { key: "deluxe", terms: ["deluxe", "ultra deluxe", "artist edition"] },
  { key: "gift", terms: ["gift edition"] },
  { key: "first", terms: ["first edition", "first printing", "1st edition", "1st printing"] },
  { key: "arc-proof", terms: ["arc", "proof", "galley", "uncorrected proof"] },
  { key: "paperback", terms: ["paperback", "mass market", "trade paperback"] },
  { key: "hardcover", terms: ["hardcover"] },
];

async function getEbayToken() {
  if (!EBAY_APP_ID || !EBAY_CERT_ID) return null;
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
  ebayUrl.searchParams.set("limit", "40");

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

async function searchEbaySold(query) {
  const ebayUrl = new URL("https://svcs.ebay.com/services/search/FindingService/v1");
  ebayUrl.searchParams.set("OPERATION-NAME", "findCompletedItems");
  ebayUrl.searchParams.set("SERVICE-VERSION", "1.13.0");
  ebayUrl.searchParams.set("SECURITY-APPNAME", EBAY_APP_ID);
  ebayUrl.searchParams.set("RESPONSE-DATA-FORMAT", "JSON");
  ebayUrl.searchParams.set("REST-PAYLOAD", "");
  ebayUrl.searchParams.set("GLOBAL-ID", "EBAY-US");
  ebayUrl.searchParams.set("keywords", query);
  ebayUrl.searchParams.set("paginationInput.entriesPerPage", "40");
  ebayUrl.searchParams.set("itemFilter(0).name", "SoldItemsOnly");
  ebayUrl.searchParams.set("itemFilter(0).value", "true");

  const resp = await fetch(ebayUrl.toString());
  if (!resp.ok) return [];
  const data = await resp.json();
  const items = data?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];
  return items.map(item => ({
    itemId: item?.itemId?.[0] || item?.title?.[0] || "",
    title: item?.title?.[0] || "",
    price: { value: item?.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || "0" },
    condition: item?.condition?.[0]?.conditionDisplayName?.[0] || "",
    itemWebUrl: item?.viewItemURL?.[0] || "",
    soldDate: item?.listingInfo?.[0]?.endTime?.[0] || "",
  }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "";
  const author = searchParams.get("author") || "";
  const publisher = searchParams.get("publisher") || "";
  const edition = searchParams.get("edition") || "";
  const mode = (searchParams.get("mode") || "sold").toLowerCase() === "active" ? "active" : "sold";

  if (!title.trim()) {
    return NextResponse.json({ error: "Title is required", results: [] });
  }

  const needsToken = mode === "active";
  if (!EBAY_APP_ID || (needsToken && !EBAY_CERT_ID)) {
    return NextResponse.json({
      error: needsToken
        ? "eBay active listings are not configured"
        : "eBay sold comps are not configured",
      results: [],
    });
  }

  try {
    const token = needsToken ? await getEbayToken() : null;
    if (needsToken && !token) {
      return NextResponse.json({ error: "eBay auth failed", results: [] });
    }

    // Try multiple search strategies and combine results
    const authorLast = author ? author.split(" ").pop() : "";
    const editionTerms = getEditionSearchTerms(edition);
    const queries = [
      [title, authorLast].filter(Boolean).join(" "),
      [title, author, publisher].filter(Boolean).join(" "),
      [title, ...editionTerms, publisher].filter(Boolean).join(" "),
    ].map(q => q.trim()).filter(Boolean);

    // Run searches in parallel
    const allResults = await Promise.all(
      queries.map(q => (mode === "sold" ? searchEbaySold(q) : searchEbay(token, q)))
    );

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
      const matchType = getEditionMatchType(edition, itemTitle);
      const soldDate = item.soldDate
        ? new Date(item.soldDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "";

      const score = calculateMatchScore(itemTitle, title, author, publisher, edition);

      return { title: itemTitle, price, condition, imageUrl, listingUrl, score, matchType, date: soldDate || (mode === "sold" ? "Sold" : "Active") };
    });

    const minScore = edition ? 35 : 28;
    let filteredCandidates = scored.filter(item => item.score >= minScore && item.price > 0);
    if (edition.trim()) {
      const strict = filteredCandidates.filter(item => item.matchType === "strict");
      const related = filteredCandidates.filter(item => item.matchType === "related");
      const unknown = filteredCandidates.filter(item => item.matchType === "unknown");
      if (strict.length >= 2) {
        filteredCandidates = strict;
      } else if (strict.length === 1) {
        filteredCandidates = [...strict, ...related.slice(0, 2), ...unknown.slice(0, 1)];
      } else if (related.length >= 2) {
        filteredCandidates = related;
      } else if (strict.length + related.length > 0) {
        filteredCandidates = [...strict, ...related, ...unknown.slice(0, 1)];
      } else {
        filteredCandidates = [];
      }
    }
    // If edition filters were too strict, provide a best-effort fallback.
    if (!filteredCandidates.length) {
      const fallbackMin = Math.max(minScore - 8, 20);
      filteredCandidates = scored.filter(item => item.score >= fallbackMin && item.price > 0 && item.matchType !== "mismatch");
    }
    const filtered = removePriceOutliers(filteredCandidates)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return NextResponse.json({
      results: filtered,
      queries,
      mode,
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

  // Edition matching (roughly -25 to +20 points)
  if (edition) {
    const editionMatch = getEditionMatchType(edition, listingTitle);
    if (editionMatch === "strict") score += 20;
    else if (editionMatch === "related") score += 10;
    else if (editionMatch === "mismatch") score -= 25;
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

function getEditionSearchTerms(edition) {
  const c = getEditionClass(edition);
  if (!c) return edition ? [edition] : [];
  if (c === "lettered") return ["lettered", "signed limited", "traycased"];
  if (c === "numbered") return ["numbered", "limited", "traycased"];
  if (c === "traycased") return ["traycased", "slipcased", "limited"];
  if (c === "deluxe") return ["deluxe", "traycased"];
  if (c === "gift") return ["gift edition", "limited"];
  if (c === "first") return ["first edition", "first printing"];
  if (c === "arc-proof") return ["arc", "proof", "galley"];
  return [edition];
}

function normalizeText(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getEditionClass(value) {
  const text = normalizeText(value);
  if (!text) return "";
  for (const group of EDITION_CLASS_RULES) {
    if (group.terms.some(term => text.includes(term))) return group.key;
  }
  return "";
}

function isRelatedEditionClass(targetClass, candidateClass) {
  if (!targetClass || !candidateClass) return false;
  if (targetClass === candidateClass) return true;
  const related = {
    lettered: ["traycased", "deluxe"],
    numbered: ["traycased", "deluxe"],
    traycased: ["lettered", "numbered", "deluxe"],
    deluxe: ["traycased", "lettered", "numbered"],
    gift: ["hardcover"],
  };
  return (related[targetClass] || []).includes(candidateClass);
}

function getEditionMatchType(targetEdition, candidateText) {
  const targetClass = getEditionClass(targetEdition);
  if (!targetClass) return "any";
  const candidateClass = getEditionClass(candidateText);
  if (!candidateClass) return "unknown";
  if (candidateClass === targetClass) return "strict";
  if (isRelatedEditionClass(targetClass, candidateClass)) return "related";
  return "mismatch";
}

function removePriceOutliers(items) {
  if (items.length < 5) return items;
  const prices = items.map(i => i.price).sort((a, b) => a - b);
  const q1 = prices[Math.floor((prices.length - 1) * 0.25)];
  const q3 = prices[Math.floor((prices.length - 1) * 0.75)];
  const iqr = q3 - q1;
  const min = q1 - iqr * 1.5;
  const max = q3 + iqr * 1.5;
  const filtered = items.filter(i => i.price >= min && i.price <= max);
  return filtered.length >= 3 ? filtered : items;
}
