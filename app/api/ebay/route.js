import { NextResponse } from "next/server";

const EBAY_APP_ID = process.env.EBAY_APP_ID;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "";
  const publisher = searchParams.get("publisher") || "";
  const edition = searchParams.get("edition") || "";

  if (!title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!EBAY_APP_ID) {
    return NextResponse.json({ error: "eBay API not configured" }, { status: 500 });
  }

  try {
    // Build smart search query
    const query = buildSearchQuery(title, publisher, edition);

    // Call eBay Finding API - findCompletedItems (sold listings)
    const ebayUrl = new URL("https://svcs.ebay.com/services/search/FindingService/v1");
    ebayUrl.searchParams.set("OPERATION-NAME", "findCompletedItems");
    ebayUrl.searchParams.set("SERVICE-VERSION", "1.0.0");
    ebayUrl.searchParams.set("SECURITY-APPNAME", EBAY_APP_ID);
    ebayUrl.searchParams.set("RESPONSE-DATA-FORMAT", "JSON");
    ebayUrl.searchParams.set("keywords", query);
    ebayUrl.searchParams.set("categoryId", "267"); // Books category
    ebayUrl.searchParams.set("itemFilter(0).name", "SoldItemsOnly");
    ebayUrl.searchParams.set("itemFilter(0).value", "true");
    ebayUrl.searchParams.set("sortOrder", "EndTimeSoonest");
    ebayUrl.searchParams.set("paginationInput.entriesPerPage", "20");

    const resp = await fetch(ebayUrl.toString());
    const data = await resp.json();

    const results = data?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];

    // Score and filter results
    const scored = results.map(item => {
      const itemTitle = item.title?.[0] || "";
      const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || "0");
      const endTime = item.listingInfo?.[0]?.endTime?.[0] || "";
      const condition = item.condition?.[0]?.conditionDisplayName?.[0] || "";
      const imageUrl = item.galleryURL?.[0] || "";
      const listingUrl = item.viewItemURL?.[0] || "";

      const score = calculateMatchScore(itemTitle, title, publisher, edition);

      return {
        title: itemTitle,
        price,
        date: endTime ? new Date(endTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
        condition,
        imageUrl,
        listingUrl,
        score,
      };
    });

    // Filter out poor matches (score < 40) and sort by score then date
    const filtered = scored
      .filter(item => item.score >= 40 && item.price > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return NextResponse.json({
      results: filtered,
      query,
      totalRaw: results.length,
      totalFiltered: filtered.length,
    });

  } catch (error) {
    console.error("eBay API error:", error);
    return NextResponse.json({ error: "Failed to fetch eBay data" }, { status: 500 });
  }
}

/*
 * Build a smart eBay search query from book details.
 * Wraps key terms in quotes, adds exclusions for common false positives.
 */
function buildSearchQuery(title, publisher, edition) {
  let parts = [];

  // Always quote the title
  parts.push(`"${title}"`);

  // Add publisher if provided
  if (publisher) {
    // Map common publisher names to how they appear on eBay
    const pubMap = {
      "Cemetery Dance": "Cemetery Dance",
      "Subterranean Press": "Subterranean Press",
      "Suntup Editions": "Suntup",
      "Centipede Press": "Centipede Press",
      "Gauntlet Press": "Gauntlet",
      "Borderlands Press": "Borderlands",
      "Thunderstorm Books": "Thunderstorm",
      "PS Publishing": "PS Publishing",
      "Charnel House": "Charnel House",
      "Dark Regions Press": "Dark Regions",
      "Delirium Press": "Delirium",
    };
    const mapped = pubMap[publisher] || publisher;
    parts.push(`"${mapped}"`);
  }

  // Add edition keywords
  if (edition) {
    const edLower = edition.toLowerCase();
    if (edLower.includes("lettered")) parts.push("lettered OR letted OR letter");
    else if (edLower.includes("numbered")) parts.push("numbered OR num OR limited");
    else if (edLower.includes("traycased") || edLower.includes("traycase")) parts.push("traycase OR traycased");
    else if (edLower.includes("deluxe") || edLower.includes("ultra")) parts.push("deluxe");
    else if (edLower.includes("artist")) parts.push("artist edition");
    else if (edLower.includes("gift")) parts.push("gift edition");
    else if (edLower.includes("first edition") || edLower.includes("first printing")) parts.push("first edition OR 1st edition");
    else if (edLower.includes("signed")) parts.push("signed");
    else parts.push(edition);
  }

  // Exclusions for common false positives
  const exclusions = [
    "-dvd", "-blu-ray", "-bluray", "-vhs", "-cd", "-vinyl",
    "-poster", "-shirt", "-funko", "-bookmark",
  ];

  return parts.join(" ") + " " + exclusions.join(" ");
}

/*
 * Calculate a match score (0-100) for an eBay listing against our search criteria.
 * Uses fuzzy matching to handle misspellings and abbreviations.
 */
function calculateMatchScore(listingTitle, bookTitle, publisher, edition) {
  const lt = listingTitle.toLowerCase();
  const bt = bookTitle.toLowerCase();
  let score = 0;

  // Title matching (0-50 points)
  const titleWords = bt.split(/\s+/).filter(w => w.length > 2);
  const matchedWords = titleWords.filter(w => lt.includes(w));
  if (titleWords.length > 0) {
    const wordRatio = matchedWords.length / titleWords.length;
    score += Math.round(wordRatio * 40);
  }
  // Bonus for exact title substring
  if (lt.includes(bt)) score += 10;

  // Publisher matching (0-20 points)
  if (publisher) {
    const pl = publisher.toLowerCase();
    const pubWords = pl.split(/\s+/).filter(w => w.length > 2);
    const pubAbbrevs = {
      "cemetery dance": ["cemetery", "dance", "cd"],
      "subterranean press": ["subterranean", "subpress", "sub press"],
      "suntup editions": ["suntup", "sun tup"],
      "centipede press": ["centipede"],
      "borderlands press": ["borderlands"],
      "thunderstorm books": ["thunderstorm"],
      "ps publishing": ["ps pub"],
      "gauntlet press": ["gauntlet"],
      "delirium press": ["delirium"],
    };

    const abbrevs = pubAbbrevs[pl] || pubWords;
    const pubMatch = abbrevs.some(a => lt.includes(a));
    if (pubMatch) score += 20;
  }

  // Edition matching (0-20 points)
  if (edition) {
    const el = edition.toLowerCase();
    const editionTerms = {
      "lettered": ["lettered", "letted", "lttrd", "letter:", "letter "],
      "numbered": ["numbered", "numbrd", "#", "/500", "/750", "/1000", "/250", "/350", "num "],
      "traycased": ["traycase", "tray case", "traycased"],
      "deluxe": ["deluxe", "dlx"],
      "ultra-deluxe": ["ultra", "ultra-deluxe", "ultra deluxe"],
      "artist edition": ["artist", "artist edition"],
      "gift edition": ["gift", "gift edition"],
      "first edition": ["first edition", "1st edition", "1st ed", "first ed", "1/1"],
      "first printing": ["first printing", "1st printing", "first print"],
      "signed": ["signed", "autograph"],
    };

    for (const [key, terms] of Object.entries(editionTerms)) {
      if (el.includes(key)) {
        const edMatch = terms.some(t => lt.includes(t));
        if (edMatch) score += 20;
        break;
      }
    }
  }

  // Penalty for lot listings
  if (lt.includes("lot of") || lt.includes("book lot") || lt.includes("set of") || lt.includes("collection of")) {
    score -= 30;
  }

  // Penalty for obviously wrong formats
  if (lt.includes("dvd") || lt.includes("blu-ray") || lt.includes("vhs") || lt.includes("audiobook") || lt.includes("audio book")) {
    score -= 50;
  }

  return Math.max(0, Math.min(100, score));
}
