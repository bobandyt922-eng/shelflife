import { NextResponse } from "next/server";
import {
  getEditionClass,
  getEditionMatchType,
} from "@/lib/edition-classes";

const EBAY_APP_ID = process.env.EBAY_APP_ID;
const EBAY_CERT_ID = process.env.EBAY_CERT_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
const GOOGLE_MARKET_DOMAINS = (process.env.GOOGLE_MARKET_DOMAINS || "abebooks.com,biblio.com,bookfinder.com,alibris.com,pangobooks.com,betterworldbooks.com")
  .split(",")
  .map(d => d.trim().toLowerCase())
  .filter(Boolean);

let cachedToken = null;
let tokenExpiry = 0;

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

// eBay category 267 = "Books & Magazines" — filters out DVDs, games, etc.
const EBAY_BOOKS_CATEGORY = "267";

async function searchEbay(token, query) {
  const ebayUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  ebayUrl.searchParams.set("q", query);
  ebayUrl.searchParams.set("category_ids", EBAY_BOOKS_CATEGORY);
  ebayUrl.searchParams.set("limit", "50");

  const resp = await fetch(ebayUrl.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });

  if (!resp.ok) return [];
  const data = await resp.json();
  return (data.itemSummaries || []).map(item => ({
    ...item,
    marketSource: "ebay",
    sourceLabel: "eBay",
  }));
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
  ebayUrl.searchParams.set("categoryId", EBAY_BOOKS_CATEGORY);
  ebayUrl.searchParams.set("paginationInput.entriesPerPage", "50");
  ebayUrl.searchParams.set("itemFilter(0).name", "SoldItemsOnly");
  ebayUrl.searchParams.set("itemFilter(0).value", "true");
  ebayUrl.searchParams.set("itemFilter(1).name", "MinPrice");
  ebayUrl.searchParams.set("itemFilter(1).value", "5.00");

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
    marketSource: "ebay",
    sourceLabel: "eBay",
  }));
}

function getHostname(urlValue) {
  try {
    return new URL(urlValue).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function normalizePriceCandidate(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function extractPriceFromText(text) {
  if (!text) return null;
  const matches = [...String(text).matchAll(/(?:US\$|\$)\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/g)];
  for (const match of matches) {
    const n = normalizePriceCandidate(match[1]);
    if (n) return n;
  }
  return null;
}

function extractGoogleResultPrice(item) {
  const offerPrice = normalizePriceCandidate(item?.pagemap?.offer?.[0]?.price);
  if (offerPrice) return offerPrice;

  const meta = item?.pagemap?.metatags?.[0] || {};
  const metaPrice = normalizePriceCandidate(
    meta["product:price:amount"] ||
    meta["og:price:amount"] ||
    meta["twitter:data1"]
  );
  if (metaPrice) return metaPrice;

  const snippetPrice = extractPriceFromText(item?.snippet || "");
  if (snippetPrice) return snippetPrice;

  return extractPriceFromText(item?.title || "");
}

function formatSourceLabel(hostname) {
  if (!hostname) return "Web";
  const stripped = hostname.replace(/^www\./, "");
  const base = stripped.split(".").slice(0, -1).join(".") || stripped;
  return base
    .split(/[-.]/g)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function searchGoogleMarketplace(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) return [];
  const siteClause = GOOGLE_MARKET_DOMAINS.length
    ? `(${GOOGLE_MARKET_DOMAINS.map(domain => `site:${domain}`).join(" OR ")})`
    : "";
  const q = [query, siteClause].filter(Boolean).join(" ");
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", GOOGLE_API_KEY);
  url.searchParams.set("cx", GOOGLE_CSE_ID);
  url.searchParams.set("q", q);
  url.searchParams.set("num", "10");
  url.searchParams.set("safe", "off");

  const resp = await fetch(url.toString());
  if (!resp.ok) return [];
  const data = await resp.json();
  const results = data?.items || [];

  return results
    .map(item => {
      const listingUrl = item?.link || "";
      const hostname = getHostname(listingUrl);
      if (GOOGLE_MARKET_DOMAINS.length && hostname && !GOOGLE_MARKET_DOMAINS.some(domain => hostname.endsWith(domain))) {
        return null;
      }
      const price = extractGoogleResultPrice(item);
      if (!price) return null;
      const sourceKey = hostname || "web";
      return {
        itemId: listingUrl || item?.cacheId || item?.title || "",
        title: item?.title || "",
        snippet: item?.snippet || "",
        price: { value: String(price) },
        condition: "",
        itemWebUrl: listingUrl,
        soldDate: "",
        marketSource: sourceKey,
        sourceLabel: formatSourceLabel(hostname),
        thumbnailImages: item?.pagemap?.cse_thumbnail?.[0]?.src
          ? [{ imageUrl: item.pagemap.cse_thumbnail[0].src }]
          : [],
      };
    })
    .filter(Boolean);
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
  const ebayAvailable = !!EBAY_APP_ID && (!needsToken || !!EBAY_CERT_ID);
  const googleAvailable = !!GOOGLE_API_KEY && !!GOOGLE_CSE_ID;
  if (!ebayAvailable && !googleAvailable) {
    return NextResponse.json({
      error: "No marketplace providers are configured",
      results: [],
    });
  }

  try {
    const token = needsToken && ebayAvailable ? await getEbayToken() : null;
    if (needsToken && ebayAvailable && !token) {
      return NextResponse.json({ error: "eBay auth failed", results: [] });
    }

    const authorLast = author ? author.split(" ").pop() : "";
    const editionTerms = getEditionSearchTerms(edition);

    // Build multiple search queries from broad to specific for better coverage
    const rawQueries = [
      // Broad: just title + author last name (catches most listings)
      [title, authorLast].filter(Boolean).join(" "),
      // Medium: title + full author
      author ? [title, author].filter(Boolean).join(" ") : null,
      // Specific: title + author + publisher
      publisher ? [title, authorLast, publisher].filter(Boolean).join(" ") : null,
      // Edition-specific: title + edition terms
      editionTerms.length ? [title, authorLast, ...editionTerms].filter(Boolean).join(" ") : null,
      // Ultra-broad fallback: just the title (for rare titles where author clutters results)
      title.split(" ").length <= 3 ? `"${title}" book` : null,
    ];
    const seenQueries = new Set();
    const queries = rawQueries
      .filter(Boolean)
      .map(q => q.trim())
      .filter(q => { if (seenQueries.has(q)) return false; seenQueries.add(q); return true; });

    // Run searches in parallel
    const providerRuns = [];
    if (ebayAvailable) {
      providerRuns.push(
        Promise.all(queries.map(q => (mode === "sold" ? searchEbaySold(q) : searchEbay(token, q))))
          .then(rows => rows.flat())
      );
    }
    if (googleAvailable) {
      const broadQuery = [title, author, publisher, ...editionTerms].filter(Boolean).join(" ").trim();
      providerRuns.push(searchGoogleMarketplace(broadQuery || title));
    }
    const allResults = await Promise.all(providerRuns);

    // Merge and deduplicate by item ID or title
    const seen = new Set();
    const merged = [];
    allResults.flat().forEach(item => {
      const key = item.itemWebUrl || item.itemId || item.title;
      if (!seen.has(key)) { seen.add(key); merged.push(item); }
    });

    // Score every result
    const scored = merged.map(item => {
      const itemTitle = item.title || "";
      const price = parseFloat(item.price?.value || "0");
      const condition = item.condition || "";
      const imageUrl = item.thumbnailImages?.[0]?.imageUrl || item.image?.imageUrl || "";
      const listingUrl = item.itemWebUrl || "";
      const itemSource = item.marketSource || "ebay";
      const sourceLabel = item.sourceLabel || (itemSource === "ebay" ? "eBay" : "Web");
      const comparableText = [itemTitle, item.snippet || ""].filter(Boolean).join(" ");
      const matchType = getEditionMatchType(edition, comparableText);
      const soldDate = item.soldDate
        ? new Date(item.soldDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "";

      const score = calculateMatchScore(comparableText, title, author, publisher, edition);

      return {
        title: itemTitle,
        price,
        condition,
        imageUrl,
        listingUrl,
        score,
        matchType,
        marketSource: itemSource,
        sourceLabel,
        date: soldDate || (itemSource === "ebay" ? (mode === "sold" ? "Sold" : "Active") : "Web"),
      };
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
      providers: {
        ebay: ebayAvailable,
        google: googleAvailable,
      },
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

  // Penalties for non-book items
  const nonBookTerms = [
    "dvd", "blu-ray", "vhs", "audiobook", "audio book", "board game", "video game",
    "funko", "poster", "t-shirt", "tee shirt", "vinyl", "soundtrack", "cd ",
    "cassette", "laserdisc", "manga", "comic book", "graphic novel",
    "kindle", "nook", "ebook", "e-book", "digital download",
    "action figure", "toy", "plush", "magnet", "keychain", "bookmark only",
    "movie prop", "replica", "costume",
  ];
  if (nonBookTerms.some(term => lt.includes(term))) {
    score -= 50;
  }
  if (lt.includes("lot of") || lt.includes("book lot") || lt.includes("bundle of") || lt.includes("set of")) {
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
