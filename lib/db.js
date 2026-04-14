import { supabase } from "./supabase";
import { normalizeText, getEditionMatchType } from "./edition-classes";
import { SHELF_VALUATION_SOURCE, FOLLOW_TABLE_CANDIDATES } from "./constants";
import { toPriceNumber } from "./pricing";

export const includesNormalized = (source, target) => {
  const t = normalizeText(target);
  if (!t) return true;
  return normalizeText(source).includes(t);
};

/* ═══════════════════════════════════════════
   DATABASE FUNCTIONS
   ═══════════════════════════════════════════ */
export async function dbLoadCollection(userId) {
  const { data, error } = await supabase
    .from("user_collection")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("Load collection error:", error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    author: row.author,
    publisher: row.publisher || "",
    editionType: row.edition_type || "",
    limitation: row.limitation || "",
    condition: row.condition || "Fine",
    purchasePrice: row.purchase_price || "",
    currentValue: row.current_value || "",
    notes: row.notes || "",
    coverUrl: row.cover_url || "",
    dateAdded: row.date_added || "",
    isbn: row.isbn || "",
  }));
}

export function getShelfValuationMarker(shelfId) {
  return `[shelf:${shelfId}]`;
}

export async function dbSyncShelfValuation(userId, shelfId, book) {
  if (!userId || !shelfId || !book?.title) return;

  const marker = getShelfValuationMarker(shelfId);
  const { data, error } = await supabase
    .from("price_reports")
    .select("id")
    .eq("reported_by", userId)
    .eq("sale_source", SHELF_VALUATION_SOURCE)
    .eq("notes", marker)
    .limit(1);
  if (error) { console.error("Shelf valuation lookup error:", error); return; }

  const existingId = data?.[0]?.id;
  const shelfValue = toPriceNumber(book.currentValue);

  if (!shelfValue) {
    if (existingId) {
      const { error: deleteError } = await supabase.from("price_reports").delete().eq("id", existingId);
      if (deleteError) console.error("Shelf valuation delete error:", deleteError);
    }
    return;
  }

  const payload = {
    reported_by: userId,
    title: book.title,
    author: book.author || null,
    publisher: book.publisher || null,
    edition_type: book.editionType || null,
    sale_price: shelfValue,
    sale_source: SHELF_VALUATION_SOURCE,
    condition: book.condition || null,
    notes: marker,
  };

  if (existingId) {
    const { error: updateError } = await supabase
      .from("price_reports")
      .update(payload)
      .eq("id", existingId);
    if (updateError) console.error("Shelf valuation update error:", updateError);
  } else {
    const { error: insertError } = await supabase.from("price_reports").insert(payload);
    if (insertError) console.error("Shelf valuation insert error:", insertError);
  }
}

export async function dbDeleteShelfValuation(userId, shelfId) {
  if (!userId || !shelfId) return;
  const marker = getShelfValuationMarker(shelfId);
  const { error } = await supabase
    .from("price_reports")
    .delete()
    .eq("reported_by", userId)
    .eq("sale_source", SHELF_VALUATION_SOURCE)
    .eq("notes", marker);
  if (error) console.error("Delete shelf valuation error:", error);
}

export async function dbAddBook(userId, book) {
  // Also save to the shared books table so others can find it
  await supabase.from("books").upsert(
    { title: book.title, author: book.author },
    { onConflict: "title,author", ignoreDuplicates: true }
  );

  const { data, error } = await supabase
    .from("user_collection")
    .insert({
      user_id: userId,
      title: book.title,
      author: book.author,
      publisher: book.publisher || null,
      edition_type: book.editionType || null,
      limitation: book.limitation || null,
      condition: book.condition || "Fine",
      purchase_price: book.purchasePrice ? Number(book.purchasePrice) : null,
      current_value: book.currentValue ? Number(book.currentValue) : null,
      notes: book.notes || null,
      cover_url: book.coverUrl || null,
      isbn: book.isbn || null,
    })
    .select()
    .single();
  if (error) { console.error("Add book error:", error); return null; }
  await dbSyncShelfValuation(userId, data.id, {
    title: data.title,
    author: data.author,
    publisher: data.publisher,
    editionType: data.edition_type,
    condition: data.condition,
    currentValue: data.current_value,
  });
  return {
    id: data.id, title: data.title, author: data.author,
    publisher: data.publisher || "", editionType: data.edition_type || "",
    limitation: data.limitation || "", condition: data.condition || "Fine",
    purchasePrice: data.purchase_price || "", currentValue: data.current_value || "",
    notes: data.notes || "", coverUrl: data.cover_url || "", dateAdded: data.date_added || "",
    isbn: data.isbn || "",
  };
}

export async function dbUpdateBook(bookId, book, userId) {
  // Keep shared lookup table fresh if title/author changed.
  await supabase.from("books").upsert(
    { title: book.title, author: book.author },
    { onConflict: "title,author", ignoreDuplicates: true }
  );

  const { error } = await supabase
    .from("user_collection")
    .update({
      title: book.title,
      author: book.author,
      publisher: book.publisher || null,
      edition_type: book.editionType || null,
      limitation: book.limitation || null,
      condition: book.condition || "Fine",
      purchase_price: book.purchasePrice ? Number(book.purchasePrice) : null,
      current_value: book.currentValue ? Number(book.currentValue) : null,
      notes: book.notes || null,
      cover_url: book.coverUrl || null,
      isbn: book.isbn || null,
    })
    .eq("id", bookId);
  if (error) { console.error("Update book error:", error); return false; }
  await dbSyncShelfValuation(userId, bookId, book);
  return true;
}

export async function dbDeleteBook(bookId, userId) {
  const { error } = await supabase
    .from("user_collection")
    .delete()
    .eq("id", bookId);
  if (error) { console.error("Delete book error:", error); return false; }
  await dbDeleteShelfValuation(userId, bookId);
  return true;
}

/* Wishlist DB functions */
export async function dbLoadWishlist(userId) {
  const { data, error } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("Load wishlist error:", error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    author: row.author || "",
    edition: row.edition_wanted || "",
    maxPrice: row.max_price || "",
    notes: row.notes || "",
  }));
}

export async function dbAddWishlistItem(userId, item) {
  const { data, error } = await supabase
    .from("wishlist")
    .insert({
      user_id: userId,
      title: item.title,
      author: item.author || null,
      edition_wanted: item.edition || null,
      max_price: item.maxPrice ? Number(item.maxPrice) : null,
      notes: item.notes || null,
    })
    .select()
    .single();
  if (error) { console.error("Add wishlist error:", error); return null; }
  return {
    id: data.id, title: data.title, author: data.author || "",
    edition: data.edition_wanted || "", maxPrice: data.max_price || "", notes: data.notes || "",
  };
}

export async function dbDeleteWishlistItem(itemId) {
  const { error } = await supabase.from("wishlist").delete().eq("id", itemId);
  if (error) { console.error("Delete wishlist error:", error); return false; }
  return true;
}

/* Contact messages DB function */
export async function dbSendContactMessage(userId, name, email, topic, message) {
  const { error } = await supabase
    .from("contact_messages")
    .insert({
      user_id: userId || null,
      name: name || null,
      email,
      topic,
      message,
    });
  if (error) { console.error("Contact message error:", error); return false; }
  return true;
}

/* Profile settings DB functions */
export async function dbLoadProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error && error.code !== "PGRST116") { console.error("Load profile error:", error); }
  return data || null;
}

export async function dbUpdateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates }, { onConflict: "id" })
    .select("*")
    .single();
  if (error) { console.error("Update profile error:", error); return null; }
  return data || null;
}

/* Community activity DB function */
export async function dbGetCommunityActivity(limit = 10) {
  const { data, error } = await supabase
    .from("community_activity")
    .select("*, profiles:user_id(display_name)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("Community activity error:", error); return []; }
  return (data || []).map(row => {
    const mins = Math.floor((Date.now() - new Date(row.created_at).getTime()) / 60000);
    const timeAgo = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins/60)} hr ago` : `${Math.floor(mins/1440)} day ago`;
    return {
      user: row.profiles?.display_name || "Anonymous",
      title: row.title || "",
      detail: row.detail || "",
      time: timeAgo,
    };
  });
}

let cachedFollowTableName = null;
let attemptedFollowTableResolve = false;

export function isMissingFollowTableError(error) {
  const code = error?.code || "";
  const msg = String(error?.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || msg.includes("does not exist") || msg.includes("not found");
}

export async function resolveFollowTableName() {
  if (attemptedFollowTableResolve) return cachedFollowTableName;
  attemptedFollowTableResolve = true;

  for (const tableName of FOLLOW_TABLE_CANDIDATES) {
    const { error } = await supabase
      .from(tableName)
      .select("follower_id", { head: true, count: "exact" })
      .limit(1);
    if (!error || !isMissingFollowTableError(error)) {
      cachedFollowTableName = tableName;
      return cachedFollowTableName;
    }
  }

  cachedFollowTableName = null;
  return null;
}

export async function dbGetFollowerCounts(collectorIds = []) {
  const ids = [...new Set((collectorIds || []).filter(Boolean))];
  if (!ids.length) return {};
  const tableName = await resolveFollowTableName();
  if (!tableName) return {};

  const { data, error } = await supabase
    .from(tableName)
    .select("followed_id")
    .in("followed_id", ids);
  if (error) { console.error("Load follower counts error:", error); return {}; }

  const counts = {};
  for (const id of ids) counts[id] = 0;
  (data || []).forEach(row => {
    if (!row.followed_id) return;
    counts[row.followed_id] = (counts[row.followed_id] || 0) + 1;
  });
  return counts;
}

export async function dbGetFollowSnapshot(userId, collectorIds = []) {
  const tableName = await resolveFollowTableName();
  if (!tableName) return { available: false, followingIds: [], followerCounts: {} };

  const ids = [...new Set((collectorIds || []).filter(Boolean))];
  const followerCounts = await dbGetFollowerCounts(ids);
  let followingIds = [];

  if (userId) {
    const { data, error } = await supabase
      .from(tableName)
      .select("followed_id")
      .eq("follower_id", userId);
    if (error) {
      console.error("Load following list error:", error);
      return { available: true, followingIds: [], followerCounts };
    }
    followingIds = [...new Set((data || []).map(row => row.followed_id).filter(Boolean))];
  }

  return { available: true, followingIds, followerCounts };
}

export async function dbFollowCollector(userId, collectorId) {
  if (!userId || !collectorId || userId === collectorId) return false;
  const tableName = await resolveFollowTableName();
  if (!tableName) return false;

  const { error } = await supabase
    .from(tableName)
    .insert({ follower_id: userId, followed_id: collectorId });
  if (error && error.code !== "23505") {
    console.error("Follow collector error:", error);
    return false;
  }
  return true;
}

export async function dbUnfollowCollector(userId, collectorId) {
  if (!userId || !collectorId) return false;
  const tableName = await resolveFollowTableName();
  if (!tableName) return false;

  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("follower_id", userId)
    .eq("followed_id", collectorId);
  if (error) { console.error("Unfollow collector error:", error); return false; }
  return true;
}

export async function dbGetFollowingCollectors(userId, limit = 24) {
  if (!userId) return [];
  const tableName = await resolveFollowTableName();
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName)
    .select("followed_id")
    .eq("follower_id", userId)
    .limit(300);
  if (error) { console.error("Load following collector ids error:", error); return []; }

  const followedIds = [...new Set((data || []).map(row => row.followed_id).filter(Boolean))];
  if (!followedIds.length) return [];

  const publicCollectors = await dbGetPublicCollectors(120);
  const byId = {};
  publicCollectors.forEach(c => { byId[c.id] = c; });

  return followedIds
    .map(id => byId[id])
    .filter(Boolean)
    .slice(0, limit);
}

export async function dbGetPublicCollectors(limit = 24) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, is_public, show_value")
    .eq("is_public", true)
    .limit(limit);
  if (error) { console.error("Load public collectors error:", error); return []; }
  const collectors = data || [];
  if (!collectors.length) return [];

  const ids = collectors.map(c => c.id);
  const { data: booksData, error: booksError } = await supabase
    .from("user_collection")
    .select("user_id, title, author, edition_type, current_value")
    .in("user_id", ids);
  if (booksError) { console.error("Load public collector books error:", booksError); return []; }

  const grouped = {};
  (booksData || []).forEach(row => {
    if (!grouped[row.user_id]) grouped[row.user_id] = [];
    grouped[row.user_id].push(row);
  });

  return collectors
    .map(c => {
      const books = grouped[c.id] || [];
      const totalValue = books.reduce((sum, b) => sum + (Number(b.current_value) || 0), 0);
      const topBooks = books
        .sort((a, b) => (Number(b.current_value) || 0) - (Number(a.current_value) || 0))
        .slice(0, 8)
        .map(b => ({
          title: b.title || "Unknown",
          author: b.author || "",
          edition: b.edition_type || "",
          value: Number(b.current_value) || 0,
        }));
      const tier = books.length >= 100 ? "Obsidian" : books.length >= 50 ? "Gold" : books.length >= 20 ? "Silver" : "Bronze";
      return {
        id: c.id,
        name: c.display_name || "Collector",
        booksCount: books.length,
        totalValue: c.show_value ? totalValue : null,
        showValue: !!c.show_value,
        tier,
        topBooks,
      };
    })
    .filter(c => c.booksCount > 0)
    .sort((a, b) => b.booksCount - a.booksCount);
}

export async function dbLoadPublicCollectorProfile(collectorId) {
  const { data: collector, error: collectorError } = await supabase
    .from("profiles")
    .select("id, display_name, is_public, show_value")
    .eq("id", collectorId)
    .single();
  if (collectorError && collectorError.code !== "PGRST116") {
    console.error("Load collector profile error:", collectorError);
    return null;
  }
  if (!collector || !collector.is_public) return null;

  const { data: booksData, error: booksError } = await supabase
    .from("user_collection")
    .select("id, title, author, edition_type, publisher, condition, current_value, created_at")
    .eq("user_id", collectorId)
    .order("created_at", { ascending: false })
    .limit(400);
  if (booksError) { console.error("Load collector shelf error:", booksError); return null; }

  const books = (booksData || []).map(row => ({
    id: row.id,
    title: row.title || "Unknown",
    author: row.author || "",
    edition: row.edition_type || "",
    publisher: row.publisher || "",
    condition: row.condition || "",
    rankValue: Number(row.current_value) || 0,
    value: collector.show_value ? (Number(row.current_value) || 0) : null,
  }));

  const totalValue = books.reduce((sum, b) => sum + b.rankValue, 0);
  const topBooks = [...books]
    .sort((a, b) => (b.rankValue || 0) - (a.rankValue || 0))
    .slice(0, 8);
  const followerCounts = await dbGetFollowerCounts([collectorId]);
  const tier = books.length >= 100 ? "Obsidian" : books.length >= 50 ? "Gold" : books.length >= 20 ? "Silver" : "Bronze";

  return {
    id: collector.id,
    name: collector.display_name || "Collector",
    booksCount: books.length,
    totalValue: collector.show_value ? totalValue : null,
    showValue: !!collector.show_value,
    followerCount: followerCounts[collectorId] || 0,
    tier,
    topBooks,
    books,
  };
}

/* Recent price reports for market feed (excludes auto-generated Shelf Valuations) */
export async function dbGetRecentPriceReports(limit = 5) {
  const { data, error } = await supabase
    .from("price_reports")
    .select("*, profiles:reported_by(display_name)")
    .neq("sale_source", SHELF_VALUATION_SOURCE)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("Recent reports error:", error); return []; }
  return (data || []).map(row => {
    const mins = Math.floor((Date.now() - new Date(row.created_at).getTime()) / 60000);
    const timeAgo = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins/60)} hr ago` : `${Math.floor(mins/1440)} days ago`;
    return {
      title: row.title, publisher: row.publisher || "", edition: row.edition_type || "",
      price: Number(row.sale_price), source: row.sale_source || "",
      date: timeAgo, user: row.profiles?.display_name || "Anonymous",
    };
  });
}

/* Check for duplicate in user collection */
export async function dbCheckDuplicate(userId, title, author) {
  const { data } = await supabase
    .from("user_collection")
    .select("id")
    .eq("user_id", userId)
    .ilike("title", title)
    .ilike("author", author)
    .limit(1);
  return (data || []).length > 0;
}

/* Get collection values from all users for a book title */
export async function dbGetCollectionValues(title, { author = "", edition = "", publisher = "" } = {}) {
  let query = supabase
    .from("user_collection")
    .select("current_value, purchase_price, edition_type, publisher, condition, profiles:user_id(display_name)")
    .ilike("title", `%${title}%`)
    .not("current_value", "is", null)
    .gt("current_value", 0)
    .limit(30);
  if (author.trim()) query = query.ilike("author", `%${author.trim()}%`);

  const { data, error } = await query;
  if (error) { console.error("Collection values error:", error); return []; }
  return (data || [])
    .filter(row => {
      const matchType = getEditionMatchType(edition, row.edition_type);
      return matchType !== "mismatch" && includesNormalized(row.publisher, publisher);
    })
    .map(row => ({
    value: Number(row.current_value),
    paid: row.purchase_price ? Number(row.purchase_price) : null,
    edition: row.edition_type || "",
    publisher: row.publisher || "",
    condition: row.condition || "",
    user: row.profiles?.display_name || "Anonymous",
    matchType: getEditionMatchType(edition, row.edition_type),
  }));
}

/* Get recent collection entries with values for market feed */
export async function dbGetRecentCollectionEntries(limit = 10) {
  const { data, error } = await supabase
    .from("user_collection")
    .select("title, author, current_value, purchase_price, edition_type, publisher, condition, created_at, profiles:user_id(display_name)")
    .not("current_value", "is", null)
    .gt("current_value", 0)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("Recent entries error:", error); return []; }
  return (data || []).map(row => {
    const mins = Math.floor((Date.now() - new Date(row.created_at).getTime()) / 60000);
    const timeAgo = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins/60)} hr ago` : `${Math.floor(mins/1440)} days ago`;
    return {
      title: row.title, author: row.author || "", publisher: row.publisher || "",
      edition: row.edition_type || "", price: Number(row.current_value),
      condition: row.condition || "", source: "Collector Shelf",
      user: row.profiles?.display_name || "Anonymous", date: timeAgo,
    };
  });
}

/* Get pricing from all user collections for a book */
/* Price Reports DB functions */
export async function dbReportSale(userId, report) {
  const { error } = await supabase
    .from("price_reports")
    .insert({
      reported_by: userId || null,
      title: report.title,
      author: report.author || null,
      publisher: report.publisher || null,
      edition_type: report.edition || null,
      sale_price: Number(report.price),
      sale_source: report.source || "eBay",
      condition: report.condition || null,
      notes: report.notes || null,
    });
  if (error) { console.error("Report sale error:", error); return false; }
  return true;
}

export async function dbGetPriceReports(title, { author = "", edition = "", publisher = "" } = {}) {
  let query = supabase
    .from("price_reports")
    .select("*, profiles:reported_by(display_name)")
    .ilike("title", `%${title}%`)
    .order("created_at", { ascending: false })
    .limit(20);
  if (author.trim()) query = query.ilike("author", `%${author.trim()}%`);

  const { data, error } = await query;
  if (error) { console.error("Get price reports error:", error); return []; }
  return (data || [])
    .filter(row => {
      const matchType = getEditionMatchType(edition, row.edition_type);
      return matchType !== "mismatch" && includesNormalized(row.publisher, publisher);
    })
    .map(row => ({
    price: Number(row.sale_price),
    source: row.sale_source || "Unknown",
    condition: row.condition || "",
    edition: row.edition_type || "",
    publisher: row.publisher || "",
    notes: row.notes || "",
    user: row.profiles?.display_name || "Anonymous",
    date: new Date(row.created_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
    matchType: getEditionMatchType(edition, row.edition_type),
  }));
}

export async function dbSearchBooks(query) {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) return [];
  const wildcardQuery = normalizedQuery.split(" ").filter(Boolean).join("%");
  
  // Search local Supabase database
  const { data } = await supabase
    .from("books")
    .select("*")
    .or(`title.ilike.%${wildcardQuery}%,author.ilike.%${wildcardQuery}%`)
    .limit(20);
  const localResults = (data || []).map(row => ({
    title: row.title, author: row.author, year: row.year || "", source: "database",
  }));

  // Search Open Library with structured query for better accuracy
  let apiResults = [];
  try {
    const trimmed = query.trim();
    const olFields = "key,title,author_name,first_publish_year,cover_i,isbn,publisher,number_of_pages_median";

    // Try structured title search first, fall back to general query
    const isbnMatch = trimmed.match(/^(?:978|979)[\d-]{10,}/);
    let olUrl;
    if (isbnMatch) {
      olUrl = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbnMatch[0].replace(/-/g, ""))}&limit=10&fields=${olFields}`;
    } else {
      olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=20&fields=${olFields}`;
    }

    const resp = await fetch(olUrl);
    const json = await resp.json();
    apiResults = (json.docs || []).map(doc => ({
      title: doc.title || "Unknown",
      author: (doc.author_name || []).join(", ") || "Unknown",
      year: doc.first_publish_year ? String(doc.first_publish_year) : "",
      source: "openlibrary",
      coverId: doc.cover_i || null,
      olKey: doc.key || null,
      isbn: (doc.isbn || [])[0] || null,
      olPublisher: (doc.publisher || [])[0] || null,
      pages: doc.number_of_pages_median || null,
    }));
  } catch (e) {
    console.log("Open Library search failed, using local results only");
  }

  // Merge: local first, then API, deduplicated
  const seen = new Set();
  const merged = [];
  [...localResults, ...apiResults].forEach(r => {
    const key = (r.title + "|" + r.author).toLowerCase();
    if (!seen.has(key)) { seen.add(key); merged.push(r); }
  });
  return merged.slice(0, 25);
}

export async function dbSearchUserCollection(query, userId) {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) return [];
  const wildcardQuery = normalizedQuery.split(" ").filter(Boolean).join("%");

  const { data, error } = await supabase
    .from("user_collection")
    .select("title, author, publisher, edition_type, user_id, created_at, current_value")
    .or(`title.ilike.%${wildcardQuery}%,author.ilike.%${wildcardQuery}%`)
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) { console.error("Search user collection error:", error); return []; }

  return (data || []).map(row => ({
    title: row.title || "Unknown",
    author: row.author || "Unknown",
    publisher: row.publisher || "",
    edition: row.edition_type || "",
    currentValue: row.current_value || null,
    source: userId && row.user_id === userId ? "your-shelf" : "collector-shelf",
  }));
}

export async function dbSearchReportedTitles(query) {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) return [];
  const wildcardQuery = normalizedQuery.split(" ").filter(Boolean).join("%");

  const { data, error } = await supabase
    .from("price_reports")
    .select("title, author, publisher, edition_type, created_at")
    .or(`title.ilike.%${wildcardQuery}%,author.ilike.%${wildcardQuery}%`)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) { console.error("Search price reports error:", error); return []; }

  return (data || []).map(row => ({
    title: row.title || "Unknown",
    author: row.author || "Unknown",
    publisher: row.publisher || "",
    edition: row.edition_type || "",
    source: "community-report",
  }));
}

export async function dbGetUserPublishers(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("user_collection")
    .select("publisher")
    .eq("user_id", userId)
    .not("publisher", "is", null)
    .neq("publisher", "");
  if (error) { console.error("Load user publishers error:", error); return []; }
  const unique = [...new Set((data || []).map(r => r.publisher).filter(Boolean))];
  return unique.sort((a, b) => a.localeCompare(b));
}
