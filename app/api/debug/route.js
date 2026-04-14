import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Carrie";
  const author = searchParams.get("author") || "Stephen King";

  const EBAY_APP_ID = process.env.EBAY_APP_ID;
  const EBAY_CERT_ID = process.env.EBAY_CERT_ID;
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

  const results = {
    env: {
      EBAY_APP_ID: EBAY_APP_ID ? `SET (${EBAY_APP_ID.slice(0, 8)}...)` : "NOT SET",
      EBAY_CERT_ID: EBAY_CERT_ID ? `SET (${EBAY_CERT_ID.slice(0, 8)}...)` : "NOT SET",
      GOOGLE_API_KEY: GOOGLE_API_KEY ? `SET (${GOOGLE_API_KEY.slice(0, 8)}...)` : "NOT SET",
      GOOGLE_CSE_ID: GOOGLE_CSE_ID ? `SET (${GOOGLE_CSE_ID.slice(0, 8)}...)` : "NOT SET",
    },
    tests: {},
  };

  // Test eBay Finding API (sold items — only needs APP_ID)
  if (EBAY_APP_ID) {
    try {
      const ebayUrl = new URL("https://svcs.ebay.com/services/search/FindingService/v1");
      ebayUrl.searchParams.set("OPERATION-NAME", "findCompletedItems");
      ebayUrl.searchParams.set("SERVICE-VERSION", "1.13.0");
      ebayUrl.searchParams.set("SECURITY-APPNAME", EBAY_APP_ID);
      ebayUrl.searchParams.set("RESPONSE-DATA-FORMAT", "JSON");
      ebayUrl.searchParams.set("REST-PAYLOAD", "");
      ebayUrl.searchParams.set("GLOBAL-ID", "EBAY-US");
      ebayUrl.searchParams.set("keywords", `${title} ${author} book`);
      ebayUrl.searchParams.set("categoryId", "267");
      ebayUrl.searchParams.set("paginationInput.entriesPerPage", "5");
      ebayUrl.searchParams.set("itemFilter(0).name", "SoldItemsOnly");
      ebayUrl.searchParams.set("itemFilter(0).value", "true");

      const resp = await fetch(ebayUrl.toString());
      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }

      const items = data?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];
      const errorMsg = data?.findCompletedItemsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.message?.[0] || null;
      results.tests.ebaySold = {
        status: resp.status,
        ok: resp.ok,
        itemCount: items.length,
        error: errorMsg,
        sampleTitles: items.slice(0, 3).map(i => i?.title?.[0] || ""),
        samplePrices: items.slice(0, 3).map(i => "$" + (i?.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || "0")),
      };
    } catch (e) {
      results.tests.ebaySold = { error: e.message };
    }
  } else {
    results.tests.ebaySold = { skipped: "EBAY_APP_ID not set" };
  }

  // Test Google Custom Search
  if (GOOGLE_API_KEY && GOOGLE_CSE_ID) {
    try {
      const domains = "abebooks.com,biblio.com,bookfinder.com,alibris.com";
      const siteClause = domains.split(",").map(d => `site:${d}`).join(" OR ");
      const q = `${title} ${author} (${siteClause})`;

      const url = new URL("https://www.googleapis.com/customsearch/v1");
      url.searchParams.set("key", GOOGLE_API_KEY);
      url.searchParams.set("cx", GOOGLE_CSE_ID);
      url.searchParams.set("q", q);
      url.searchParams.set("num", "5");

      const resp = await fetch(url.toString());
      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }

      if (!resp.ok) {
        results.tests.google = {
          status: resp.status,
          ok: false,
          error: data?.error?.message || data?.error?.errors?.[0]?.message || text.slice(0, 300),
        };
      } else {
        const items = data?.items || [];
        results.tests.google = {
          status: resp.status,
          ok: true,
          totalResults: data?.searchInformation?.totalResults || "0",
          itemCount: items.length,
          sampleResults: items.slice(0, 3).map(i => ({
            title: (i?.title || "").slice(0, 80),
            link: (i?.link || "").slice(0, 100),
            hasPrice: !!(i?.pagemap?.offer?.[0]?.price || i?.pagemap?.metatags?.[0]?.["product:price:amount"]),
          })),
        };
      }
    } catch (e) {
      results.tests.google = { error: e.message };
    }
  } else {
    results.tests.google = { skipped: `GOOGLE_API_KEY: ${GOOGLE_API_KEY ? "set" : "not set"}, GOOGLE_CSE_ID: ${GOOGLE_CSE_ID ? "set" : "not set"}` };
  }

  return NextResponse.json(results, { headers: { "Cache-Control": "no-store" } });
}
