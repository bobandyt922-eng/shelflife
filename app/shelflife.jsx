import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";

/* ═══════════════════════════════════════════
   CONSTANTS & DATA
   ═══════════════════════════════════════════ */
const gold = "#c4a265";
const goldDark = "#a07830";
const bg = "#0a0a0a";
const cardBg = "var(--card-bg)";
const borderClr = "var(--border-clr)";

const BOOK_DB = [
  { title: "It", author: "Stephen King", year: "1986" },{ title: "The Shining", author: "Stephen King", year: "1977" },{ title: "Salem's Lot", author: "Stephen King", year: "1975" },{ title: "Pet Sematary", author: "Stephen King", year: "1983" },{ title: "Misery", author: "Stephen King", year: "1987" },{ title: "The Stand", author: "Stephen King", year: "1978" },{ title: "Needful Things", author: "Stephen King", year: "1991" },{ title: "Desperation", author: "Stephen King", year: "1996" },{ title: "Revival", author: "Stephen King", year: "2014" },{ title: "Holly", author: "Stephen King", year: "2023" },{ title: "Fairy Tale", author: "Stephen King", year: "2022" },{ title: "Christine", author: "Stephen King", year: "1983" },{ title: "Cujo", author: "Stephen King", year: "1981" },{ title: "Carrie", author: "Stephen King", year: "1974" },{ title: "Night Shift", author: "Stephen King", year: "1978" },{ title: "You Like It Darker", author: "Stephen King", year: "2024" },{ title: "If It Bleeds", author: "Stephen King", year: "2020" },{ title: "Billy Summers", author: "Stephen King", year: "2021" },{ title: "Bag of Bones", author: "Stephen King", year: "1998" },{ title: "Duma Key", author: "Stephen King", year: "2008" },
  { title: "Midnight Mass", author: "F. Paul Wilson", year: "2004" },{ title: "The Keep", author: "F. Paul Wilson", year: "1981" },{ title: "The Tomb", author: "F. Paul Wilson", year: "1984" },{ title: "Reprisal", author: "F. Paul Wilson", year: "1991" },{ title: "Nightworld", author: "F. Paul Wilson", year: "1992" },{ title: "Sims", author: "F. Paul Wilson", year: "2003" },
  { title: "Novem", author: "Brian Keene", year: "2016" },{ title: "The Rising", author: "Brian Keene", year: "2003" },{ title: "Ghoul", author: "Brian Keene", year: "2007" },{ title: "Dark Hollow", author: "Brian Keene", year: "2008" },{ title: "Dead Sea", author: "Brian Keene", year: "2007" },{ title: "The Complex", author: "Brian Keene", year: "2016" },{ title: "Pressure", author: "Brian Keene", year: "2016" },
  { title: "The Hellbound Heart", author: "Clive Barker", year: "1986" },{ title: "The Books of Blood", author: "Clive Barker", year: "1984" },{ title: "Imajica", author: "Clive Barker", year: "1991" },{ title: "Weaveworld", author: "Clive Barker", year: "1987" },{ title: "The Scarlet Gospels", author: "Clive Barker", year: "2015" },
  { title: "The Exorcist", author: "William Peter Blatty", year: "1971" },{ title: "Legion", author: "William Peter Blatty", year: "1983" },
  { title: "Ghost Story", author: "Peter Straub", year: "1979" },{ title: "Shadowland", author: "Peter Straub", year: "1980" },{ title: "Floating Dragon", author: "Peter Straub", year: "1982" },
  { title: "The Talisman", author: "Stephen King & Peter Straub", year: "1984" },{ title: "Black House", author: "Stephen King & Peter Straub", year: "2001" },
  { title: "Off Season", author: "Jack Ketchum", year: "1980" },{ title: "The Girl Next Door", author: "Jack Ketchum", year: "1989" },{ title: "Red", author: "Jack Ketchum", year: "1995" },
  { title: "Graverobbers Wanted", author: "Jeff Strand", year: "2002" },{ title: "Dweller", author: "Jeff Strand", year: "2010" },{ title: "Autumn Bleeds Into Winter", author: "Jeff Strand", year: "2021" },{ title: "The Oddity", author: "Jeff Strand", year: "2023" },
  { title: "Heart-Shaped Box", author: "Joe Hill", year: "2007" },{ title: "NOS4A2", author: "Joe Hill", year: "2013" },{ title: "20th Century Ghosts", author: "Joe Hill", year: "2005" },
  { title: "The Elementals", author: "Michael McDowell", year: "1981" },{ title: "Blackwater", author: "Michael McDowell", year: "1983" },
  { title: "House of Leaves", author: "Mark Z. Danielewski", year: "2000" },
  { title: "The Fisherman", author: "John Langan", year: "2016" },
  { title: "A Head Full of Ghosts", author: "Paul Tremblay", year: "2015" },{ title: "Horror Movie", author: "Paul Tremblay", year: "2024" },
  { title: "The Only Good Indians", author: "Stephen Graham Jones", year: "2020" },{ title: "My Heart Is a Chainsaw", author: "Stephen Graham Jones", year: "2021" },
  { title: "Swan Song", author: "Robert McCammon", year: "1987" },{ title: "Boy's Life", author: "Robert McCammon", year: "1991" },{ title: "Mine", author: "Robert McCammon", year: "1990" },{ title: "The Wolf's Hour", author: "Robert McCammon", year: "1989" },
  { title: "Hell House", author: "Richard Matheson", year: "1971" },{ title: "I Am Legend", author: "Richard Matheson", year: "1954" },
  { title: "The Cellar", author: "Richard Laymon", year: "1980" },{ title: "The Traveling Vampire Show", author: "Richard Laymon", year: "2000" },{ title: "Island", author: "Richard Laymon", year: "1995" },
  { title: "The Cipher", author: "Kathe Koja", year: "1991" },
  { title: "The Ceremonies", author: "T.E.D. Klein", year: "1984" },{ title: "Dark Gods", author: "T.E.D. Klein", year: "1985" },
  { title: "The Troop", author: "Nick Cutter", year: "2014" },
  { title: "My Best Friend's Exorcism", author: "Grady Hendrix", year: "2016" },{ title: "Paperbacks from Hell", author: "Grady Hendrix", year: "2017" },
  { title: "Children of the Dark", author: "Jonathan Janz", year: "2016" },{ title: "Marla", author: "Jonathan Janz", year: "2021" },
  { title: "Mexican Gothic", author: "Silvia Moreno-Garcia", year: "2020" },
  { title: "The Ritual", author: "Adam Nevill", year: "2011" },
  { title: "Header", author: "Edward Lee", year: "1995" },{ title: "The Bighead", author: "Edward Lee", year: "1999" },
  { title: "Rosemary's Baby", author: "Ira Levin", year: "1967" },
  { title: "The Haunting of Hill House", author: "Shirley Jackson", year: "1959" },
  { title: "Interview with the Vampire", author: "Anne Rice", year: "1976" },
  { title: "Survivor", author: "J.F. Gonzalez", year: "2004" },
  { title: "The Summer I Died", author: "Ryan C. Thomas", year: "2006" },
  { title: "The Hunger", author: "Alma Katsu", year: "2018" },
  { title: "The Changeling", author: "Victor LaValle", year: "2017" },
  { title: "Neverland", author: "Douglas Clegg", year: "1991" },
  { title: "Prodigal Blues", author: "Gary A. Braunbeck", year: "2006" },
];

const PUBLISHERS = ["Cemetery Dance","Borderlands Press","Lividian Publishing","Delirium Press","Subterranean Press","Dark Regions Press","Thunderstorm Books","Suntup Editions","PS Publishing","Centipede Press","Charnel House","Grant Books","Gauntlet Press","Lonely Road Books","SST Publications","Earthling Publications","Necessary Evil Press","Dark Hart Press","Overlook Connection Press","Doubleday","Viking","Scribner","Penguin","Other"];
const EDITION_TYPES = ["Lettered","Numbered","Traycased","Artist Edition","Gift Edition","Deluxe","Ultra-Deluxe","Roman Numeral","Publisher Copy","Remarqued","Subscriber Edition","Limited Hardcover","First Edition / First Printing","First Edition","First Printing","Mass Market Paperback","Trade Paperback","Hardcover","Signed First Edition","Signed Trade Hardcover","Unsigned Trade Hardcover","Vintage Paperback","Pulp Paperback","Movie Tie-In","ARC / Proof","Uncorrected Proof","Galley","Book Club Edition","Ex-Library","Print on Demand","Other"];
const CONDITIONS = ["Mint","Near Mint","Fine","Very Good","Good","Fair","Poor"];

const MY_BOOKS = [
  { id:1, title:"Midnight Mass", author:"F. Paul Wilson", publisher:"Cemetery Dance", editionType:"Lettered", limitation:"Letter: Q", condition:"Mint", purchasePrice:350, currentValue:800, notes:"Beautiful traycase. One of 26 lettered copies.", dateAdded:"2024-01-15", coverUrl:"" },
  { id:2, title:"Novem", author:"Brian Keene", publisher:"Delirium Press", editionType:"Lettered", limitation:"Letter: D", condition:"Near Mint", purchasePrice:200, currentValue:450, notes:"Signed by Keene.", dateAdded:"2024-03-22", coverUrl:"" },
  { id:3, title:"The Stand", author:"Stephen King", publisher:"Cemetery Dance", editionType:"Gift Edition", limitation:"", condition:"Mint", purchasePrice:125, currentValue:300, notes:"CD Gift Edition.", dateAdded:"2024-06-10", coverUrl:"" },
  { id:4, title:"Swan Song", author:"Robert McCammon", publisher:"Subterranean Press", editionType:"Numbered", limitation:"#142/500", condition:"Fine", purchasePrice:175, currentValue:600, notes:"SubPress numbered with slipcase.", dateAdded:"2023-11-05", coverUrl:"" },
  { id:5, title:"The Traveling Vampire Show", author:"Richard Laymon", publisher:"Cemetery Dance", editionType:"Numbered", limitation:"#88/500", condition:"Near Mint", purchasePrice:95, currentValue:275, notes:"One of Laymon's best.", dateAdded:"2024-02-14", coverUrl:"" },
  { id:6, title:"The Cipher", author:"Kathe Koja", publisher:"Borderlands Press", editionType:"Lettered", limitation:"Letter: F", condition:"Mint", purchasePrice:400, currentValue:950, notes:"Incredible Koja lettered.", dateAdded:"2024-04-01", coverUrl:"" },
];

const NEW_RELEASES = [
  { id:1, title:"You Like It Darker", author:"Stephen King", publisher:"Cemetery Dance", editions:"Numbered ($350) · Lettered ($2,500)", status:"Pre-order", date:"Coming 2026" },
  { id:2, title:"Fairy Tale", author:"Stephen King", publisher:"Cemetery Dance", editions:"Gift ($125) · Numbered ($350)", status:"Pre-order", date:"2026" },
  { id:3, title:"Dissonant Harmonies", author:"Brian Keene & Bev Vincent", publisher:"Cemetery Dance", editions:"Limited", status:"Pre-order", date:"2026" },
  { id:4, title:"The Angel of Indian Lake", author:"Stephen Graham Jones", publisher:"Subterranean Press", editions:"Numbered ($60) · Lettered ($350)", status:"Available", date:"Order Now" },
];

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const btnPrimary = { background:`linear-gradient(135deg, ${gold}, ${goldDark})`, color:"#1a1a1a", border:"none", padding:"12px 28px", borderRadius:6, cursor:"pointer", fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:14, letterSpacing:1, textTransform:"uppercase" };
const btnGhost = { ...btnPrimary, background:"transparent", color:"var(--text-sub)", border:"1px solid var(--border-clr)", fontSize:12, padding:"10px 20px" };
const btnDanger = { ...btnPrimary, background:"linear-gradient(135deg, #944, #722)", color:"#fff", fontSize:12, padding:"10px 20px" };
const btnSmall = { background:"none", border:"1px solid var(--border-clr)", color:"var(--text-sub)", padding:"6px 14px", borderRadius:4, cursor:"pointer", fontSize:11, fontFamily:"'Cinzel', serif", letterSpacing:0.5, textTransform:"uppercase" };
const inputBase = { width:"100%", background:"var(--input-bg)", border:"1px solid var(--border-clr)", color:"var(--text)", padding:"12px 14px", borderRadius:6, fontSize:15, fontFamily:"'EB Garamond', serif", boxSizing:"border-box" };
const selectBase = { ...inputBase, appearance:"auto" };
const labelBase = { display:"block", fontSize:10, textTransform:"uppercase", letterSpacing:2, color:gold, marginBottom:4, fontFamily:"'Cinzel', serif" };
const emptyBook = { title:"",author:"",publisher:"",editionType:"",limitation:"",condition:"Mint",purchasePrice:"",currentValue:"",notes:"",coverUrl:"" };

/* ═══════════════════════════════════════════
   DATABASE FUNCTIONS
   ═══════════════════════════════════════════ */
async function dbLoadCollection(userId) {
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
  }));
}

async function dbAddBook(userId, book) {
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
    })
    .select()
    .single();
  if (error) { console.error("Add book error:", error); return null; }
  return {
    id: data.id, title: data.title, author: data.author,
    publisher: data.publisher || "", editionType: data.edition_type || "",
    limitation: data.limitation || "", condition: data.condition || "Fine",
    purchasePrice: data.purchase_price || "", currentValue: data.current_value || "",
    notes: data.notes || "", coverUrl: data.cover_url || "", dateAdded: data.date_added || "",
  };
}

async function dbUpdateBook(bookId, book) {
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
    })
    .eq("id", bookId);
  if (error) { console.error("Update book error:", error); return false; }
  return true;
}

async function dbDeleteBook(bookId) {
  const { error } = await supabase
    .from("user_collection")
    .delete()
    .eq("id", bookId);
  if (error) { console.error("Delete book error:", error); return false; }
  return true;
}

/* Wishlist DB functions */
async function dbLoadWishlist(userId) {
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

async function dbAddWishlistItem(userId, item) {
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

async function dbDeleteWishlistItem(itemId) {
  const { error } = await supabase.from("wishlist").delete().eq("id", itemId);
  if (error) { console.error("Delete wishlist error:", error); return false; }
  return true;
}

/* Contact messages DB function */
async function dbSendContactMessage(userId, name, email, topic, message) {
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
async function dbLoadProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) { console.error("Load profile error:", error); return null; }
  return data;
}

async function dbUpdateProfile(userId, updates) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) { console.error("Update profile error:", error); return false; }
  return true;
}

/* Community activity DB function */
async function dbGetCommunityActivity(limit = 10) {
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

/* Recent price reports for market feed */
async function dbGetRecentPriceReports(limit = 5) {
  const { data, error } = await supabase
    .from("price_reports")
    .select("*, profiles:reported_by(display_name)")
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
async function dbCheckDuplicate(userId, title, author) {
  const { data } = await supabase
    .from("user_collection")
    .select("id")
    .eq("user_id", userId)
    .ilike("title", title)
    .ilike("author", author)
    .limit(1);
  return (data || []).length > 0;
}

/* Price Reports DB functions */
async function dbReportSale(userId, report) {
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

async function dbGetPriceReports(title) {
  const { data, error } = await supabase
    .from("price_reports")
    .select("*, profiles:reported_by(display_name)")
    .ilike("title", `%${title}%`)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) { console.error("Get price reports error:", error); return []; }
  return (data || []).map(row => ({
    price: Number(row.sale_price),
    source: row.sale_source || "Unknown",
    condition: row.condition || "",
    edition: row.edition_type || "",
    publisher: row.publisher || "",
    notes: row.notes || "",
    user: row.profiles?.display_name || "Anonymous",
    date: new Date(row.created_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
  }));
}

async function dbSearchBooks(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  
  // Search local Supabase database
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
    .limit(20);
  const localResults = (data || []).map(row => ({
    title: row.title, author: row.author, year: row.year || "", source: "database",
  }));

  // Search Open Library API for millions of books
  let apiResults = [];
  try {
    const resp = await fetch(
      "https://openlibrary.org/search.json?q=" + encodeURIComponent(query) + "&limit=15&fields=key,title,author_name,first_publish_year,cover_i"
    );
    const json = await resp.json();
    apiResults = (json.docs || []).map(doc => ({
      title: doc.title || "Unknown",
      author: (doc.author_name || []).join(", ") || "Unknown",
      year: doc.first_publish_year ? String(doc.first_publish_year) : "",
      source: "openlibrary",
      coverId: doc.cover_i || null,
      olKey: doc.key || null,
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
  return merged.slice(0, 20);
}

function Modal({ children, onClose }) {
  return (<div data-modal-bg onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(8px)", padding:16 }}><div data-modal-card onClick={e=>e.stopPropagation()} style={{ background:`linear-gradient(180deg, #1a1a1a, ${cardBg})`, border:"1px solid #2a2a2a", borderRadius:12, padding:28, width:"100%", maxWidth:640, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 32px 100px rgba(0,0,0,0.9)" }}>{children}</div></div>);
}

function SH({ title, sub, action }) {
  return (<div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}><div><h3 style={{ fontFamily:"'Cinzel', serif", fontSize:15, color:"#e0d6c8", margin:0, letterSpacing:1 }}>{title}</h3>{sub && <p style={{ color:"#444", fontSize:11, margin:"2px 0 0" }}>{sub}</p>}</div>{action}</div>);
}

function NavBar({ page, setPage }) {
  const items = [{ key:"home", label:"Home", i:"⬡" },{ key:"shelf", label:"Shelf", i:"◫" },{ key:"market", label:"Market", i:"◈" },{ key:"discover", label:"Discover", i:"✦" },{ key:"profile", label:"Profile", i:"◉" }];
  return (<nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"linear-gradient(180deg, rgba(10,10,10,0.96), rgba(5,5,5,1))", borderTop:"1px solid #1a1a1a", display:"flex", justifyContent:"space-around", padding:"8px 0 14px", zIndex:900 }}>{items.map(it=>(<button key={it.key} onClick={()=>setPage(it.key)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"4px 10px", color:page===it.key?gold:"#444" }}><span style={{ fontSize:18 }}>{it.i}</span><span style={{ fontSize:8, fontFamily:"'Cinzel', serif", letterSpacing:1 }}>{it.label}</span></button>))}</nav>);
}

function TrendBadge({ trend }) {
  const c = trend==="up"?"#6a6":trend==="down"?"#c66":"#666";
  const t = trend==="up"?"▲":"▼";
  return <span style={{ fontSize:10, color:c }}>{t}</span>;
}

function TierBadge({ tier }) {
  const c = tier==="Obsidian"?"#999":tier==="Gold"?gold:tier==="Silver"?"#bbb":"#b87333";
  return <span style={{ fontSize:9, padding:"2px 8px", borderRadius:4, border:`1px solid ${c}40`, color:c, fontFamily:"'Cinzel', serif", letterSpacing:1.5, textTransform:"uppercase" }}>{tier} Shelf</span>;
}

/* ═══════════════════════════════════════════
   PUBLIC HOMEPAGE (No Login Required)
   ═══════════════════════════════════════════ */
function PublicHomePage({ onLogin, onSignup, onBrowse }) {
  const [showContact, setShowContact] = useState(false);
  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(ellipse at 50% 20%, #1a1510 0%, #0a0908 50%, #050505 100%)`, color:"#e0d6c8", fontFamily:"'EB Garamond', serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ padding:"60px 24px 40px", textAlign:"center" }}>
        <div style={{ fontSize:10, letterSpacing:8, color:"#333", fontFamily:"'Cinzel', serif", textTransform:"uppercase", marginBottom:10 }}>Introducing</div>
        <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:48, fontWeight:900, margin:0, background:`linear-gradient(135deg, ${gold}, #e8d5a8, ${gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:5 }}>SHELFLIFE</h1>
        <div style={{ width:60, height:2, background:`linear-gradient(90deg, transparent, ${gold}, transparent)`, margin:"14px auto" }} />
        <p style={{ fontStyle:"italic", fontSize:17, color:"#777", margin:"0 0 8px", maxWidth:340, marginLeft:"auto", marginRight:"auto" }}>The collector's edition tracker. Catalog your library. Know your book's worth. Never miss a drop.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:32 }}>
          <button onClick={onSignup} style={{ ...btnPrimary, padding:"14px 32px" }}>Get Started Free</button>
          <button onClick={onLogin} style={{ ...btnGhost, borderColor:gold+"50", color:gold }}>Sign In</button>
        </div>
      </div>

      {/* What ShelfLife Does */}
      <div style={{ padding:"0 20px 32px" }}>
        <SH title="Built for Collectors" sub="Everything you need in one place" />
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            ["&#128218;", "Catalog Every Edition", "Track lettered, numbered, traycased, and every other edition type with full details."],
            ["&#128200;", "Know Your Value", "Real market data from eBay listings and community reports. See what your books are worth."],
            ["&#128276;", "Never Miss a Drop", "New release alerts from the publishers you follow. Pre-orders, availability, sold out status."],
          ].map(([icon, t, d], i) => (
            <div key={i} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:10, padding:"16px" }}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:24 }} dangerouslySetInnerHTML={{ __html: icon }} />
                <div>
                  <div style={{ fontFamily:"'Cinzel', serif", fontSize:14, color:"#e0d6c8", marginBottom:4 }}>{t}</div>
                  <div style={{ fontSize:13, color:"#666", lineHeight:1.5 }}>{d}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Releases */}
      <div style={{ padding:"0 20px 32px" }}>
        <SH title="New Releases" sub="From publishers collectors follow" />
        {NEW_RELEASES.slice(0,3).map(r=>(
          <div key={r.id} style={{ padding:"12px 0", borderBottom:`1px solid ${borderClr}` }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div><div style={{ fontFamily:"'Cinzel', serif", fontSize:13, color:"#e0d6c8" }}>{r.title}</div><div style={{ fontSize:12, color:"#555", fontStyle:"italic" }}>{r.author} · {r.publisher}</div></div>
              <span style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:r.status==="Available"?"rgba(100,170,100,0.12)":"rgba(196,162,101,0.1)", color:r.status==="Available"?"#6a6":gold, fontFamily:"'Cinzel', serif", alignSelf:"flex-start" }}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Tiers */}
      <div style={{ padding:"0 20px 40px" }}>
        <SH title="Plans" sub="Start free, upgrade when ready" />
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Free */}
          <div style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:10, padding:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <h4 style={{ fontFamily:"'Cinzel', serif", fontSize:16, color:"#e0d6c8", margin:0 }}>Free</h4>
              <span style={{ fontFamily:"'Cinzel', serif", fontSize:20, color:"#888" }}>$0</span>
            </div>
            <div style={{ fontSize:13, color:"#666", lineHeight:1.8 }}>Up to 25 books · Basic details and 1 photo per book · Search the database · View last 5 market prices · Public profile · Basic wishlist (10 books)</div>
            <button onClick={onSignup} style={{ ...btnPrimary, width:"100%", marginTop:16, padding:"12px" }}>Get Started</button>
          </div>
          {/* Pro */}
          <div style={{ background:cardBg, border:`1px solid ${gold}30`, borderRadius:10, padding:"20px", position:"relative" }}>
            <div style={{ position:"absolute", top:-10, right:16, background:gold, color:"#111", padding:"3px 12px", borderRadius:4, fontSize:9, fontFamily:"'Cinzel', serif", fontWeight:700, letterSpacing:1 }}>POPULAR</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <h4 style={{ fontFamily:"'Cinzel', serif", fontSize:16, color:gold, margin:0 }}>ShelfLife Pro</h4>
              <div style={{ textAlign:"right" }}><span style={{ fontFamily:"'Cinzel', serif", fontSize:20, color:gold }}>$4.99</span><span style={{ fontSize:11, color:"#555" }}>/mo</span></div>
            </div>
            <div style={{ fontSize:13, color:"#888", lineHeight:1.8 }}>Unlimited books and photos · Full price history charts · Price alerts on any book · Collection value over time · Advanced stats and ROI · Hunting mode wishlists · Export as PDF/spreadsheet · Verified collector badge · Priority new release alerts</div>
            <button onClick={onSignup} style={{ ...btnPrimary, width:"100%", marginTop:16, padding:"12px" }}>Start Free Trial</button>
          </div>
          {/* Dealer */}
          <div style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:10, padding:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <h4 style={{ fontFamily:"'Cinzel', serif", fontSize:16, color:"#e0d6c8", margin:0 }}>ShelfLife Dealer</h4>
              <div style={{ textAlign:"right" }}><span style={{ fontFamily:"'Cinzel', serif", fontSize:20, color:"#888" }}>$14.99</span><span style={{ fontSize:11, color:"#555" }}>/mo</span></div>
            </div>
            <div style={{ fontSize:13, color:"#666", lineHeight:1.8 }}>Everything in Pro · List books for sale in-app · Profit/loss tracking · Bulk import via CSV · Inventory management · Transaction log · Dealer badge</div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ padding:"40px 24px 20px", textAlign:"center", borderTop:`1px solid ${borderClr}` }}>
        <h3 style={{ fontFamily:"'Cinzel', serif", fontSize:20, color:"#e0d6c8", margin:"0 0 8px" }}>Every Edition Has a Story</h3>
        <p style={{ color:"#555", fontSize:14, fontStyle:"italic", margin:"0 0 24px" }}>Join the first community built for serious book collectors</p>
        <button onClick={onSignup} style={{ ...btnPrimary, padding:"14px 40px" }}>Create Your Library</button>
      </div>

      {/* Footer */}
      <div style={{ padding:"20px 24px 40px", textAlign:"center" }}>
        <button onClick={()=>setShowContact(true)} style={{ background:"none", border:"none", color:"#555", fontSize:13, cursor:"pointer", fontFamily:"'EB Garamond', serif", textDecoration:"underline", textUnderlineOffset:3 }}>Contact Us</button>
        <span style={{ color:"#333", margin:"0 12px" }}>·</span>
        <span style={{ color:"#333", fontSize:12 }}>support@shelflifeapp.com</span>
      </div>

      {showContact && <ContactModal type="contact" onClose={()=>setShowContact(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════
   AUTH PAGES
   ═══════════════════════════════════════════ */
function AuthPage({ mode, onComplete, onBack, onSwitch }) {
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [name, setName] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const authInput = { ...inputBase, background:"#1a1a1a", borderColor:"#333", color:"#e0d6c8" };

  const handleSignup = async () => {
    if (!email.trim() || !pass.trim()) { setError("Email and password are required."); return; }
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: { data: { display_name: name.trim() || email.split("@")[0] } }
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data?.user) onComplete(data.user);
  };

  const handleLogin = async () => {
    if (!email.trim() || !pass.trim()) { setError("Email and password are required."); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data?.user) onComplete(data.user);
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) { setError("Please enter your email."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: window.location.origin + "?type=recovery",
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setResetSent(true);
  };

  const handleSubmit = () => { if (mode === "login") handleLogin(); else handleSignup(); };

  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(ellipse at 50% 30%, #1a1510 0%, #0a0908 60%, #050505 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, fontFamily:"'EB Garamond', serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:36, fontWeight:900, margin:"0 0 32px", background:`linear-gradient(135deg, ${gold}, #e8d5a8, ${gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:4 }}>SHELFLIFE</h1>
      <div style={{ width:"100%", maxWidth:360 }}>

        {/* FORGOT PASSWORD SCREEN */}
        {showForgot ? (<div>
          <h3 style={{ fontFamily:"'Cinzel', serif", color:gold, fontSize:18, marginBottom:8, textAlign:"center" }}>Reset Password</h3>
          <p style={{ color:"#777", fontSize:13, textAlign:"center", marginBottom:20 }}>Enter your email and we'll send you a reset link.</p>
          {error && <div style={{ background:"rgba(200,80,80,0.15)", border:"1px solid #933", borderRadius:6, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#e88" }}>{error}</div>}
          {resetSent ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ background:"rgba(100,170,100,0.15)", border:"1px solid #393", borderRadius:6, padding:"16px", marginBottom:20, fontSize:14, color:"#8c8" }}>Reset link sent! Check your email inbox.</div>
              <button onClick={()=>{setShowForgot(false);setResetSent(false);setError("");}} style={{ ...btnPrimary, width:"100%", padding:14 }}>Back to Sign In</button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom:20 }}><label style={labelBase}>Email</label><input style={authInput} type="email" value={resetEmail} onChange={e=>{setResetEmail(e.target.value);setError("");}} placeholder="your@email.com" onKeyDown={e=>{if(e.key==="Enter")handleResetPassword();}} /></div>
              <button onClick={handleResetPassword} disabled={loading} style={{ ...btnPrimary, width:"100%", padding:14, opacity:loading?0.6:1 }}>{loading?"Sending...":"Send Reset Link"}</button>
              <p onClick={()=>{setShowForgot(false);setError("");}} style={{ color:"#555", fontSize:13, textAlign:"center", marginTop:16, cursor:"pointer" }}>Back to Sign In</p>
            </div>
          )}
        </div>) : (<div>

          {/* LOGIN / SIGNUP SCREEN */}
          <h3 style={{ fontFamily:"'Cinzel', serif", color:gold, fontSize:18, marginBottom:20, textAlign:"center" }}>{mode==="login"?"Sign In":"Create Your Library"}</h3>
          {error && <div style={{ background:"rgba(200,80,80,0.15)", border:"1px solid #933", borderRadius:6, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#e88" }}>{error}</div>}
          {mode==="signup" && <div style={{ marginBottom:14 }}><label style={labelBase}>Display Name</label><input style={authInput} value={name} onChange={e=>setName(e.target.value)} placeholder="Your collector name" /></div>}
          <div style={{ marginBottom:14 }}><label style={labelBase}>Email</label><input style={authInput} type="email" value={email} onChange={e=>{setEmail(e.target.value);setError("");}} placeholder="your@email.com" onKeyDown={e=>{if(e.key==="Enter")handleSubmit();}} /></div>
          <div style={{ marginBottom:mode==="login"?8:24 }}><label style={labelBase}>Password</label><input style={authInput} type="password" value={pass} onChange={e=>{setPass(e.target.value);setError("");}} placeholder={mode==="login"?"Enter password":"Create password (6+ chars)"} onKeyDown={e=>{if(e.key==="Enter")handleSubmit();}} /></div>
          {mode==="login"&&<p style={{ textAlign:"right", marginBottom:20 }}><span style={{ color:gold, fontSize:12, cursor:"pointer", fontFamily:"'EB Garamond', serif" }} onClick={()=>{setShowForgot(true);setResetEmail(email);setError("");}}>Forgot password?</span></p>}
          <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, width:"100%", padding:14, opacity:loading?0.6:1 }}>
            {loading ? "Please wait..." : mode==="login" ? "Enter ShelfLife" : "Begin Collecting"}
          </button>
          <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#555" }}>{mode==="login"?"Don't have an account? ":"Already have an account? "}<span onClick={()=>{onSwitch();setError("");}} style={{ color:gold, cursor:"pointer" }}>{mode==="login"?"Sign up":"Sign in"}</span></p>
          <p onClick={onBack} style={{ color:"#333", fontSize:13, textAlign:"center", marginTop:12, cursor:"pointer" }}>Back to home</p>
        </div>)}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PASSWORD RESET HANDLER
   ═══════════════════════════════════════════ */
function ResetPasswordScreen({ onDone }) {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const authInput = { ...inputBase, background:"#1a1a1a", borderColor:"#333", color:"#e0d6c8" };

  const handleReset = async () => {
    if (!newPass || !confirmPass) { setError("Please fill in both fields."); return; }
    if (newPass.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPass !== confirmPass) { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.updateUser({ password: newPass });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    setTimeout(() => onDone(), 2000);
  };

  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(ellipse at 50% 30%, #1a1510 0%, #0a0908 60%, #050505 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, fontFamily:"'EB Garamond', serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:36, fontWeight:900, margin:"0 0 32px", background:`linear-gradient(135deg, ${gold}, #e8d5a8, ${gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:4 }}>SHELFLIFE</h1>
      <div style={{ width:"100%", maxWidth:360 }}>
        <h3 style={{ fontFamily:"'Cinzel', serif", color:gold, fontSize:18, marginBottom:20, textAlign:"center" }}>Set New Password</h3>
        {error && <div style={{ background:"rgba(200,80,80,0.15)", border:"1px solid #933", borderRadius:6, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#e88" }}>{error}</div>}
        {success ? (
          <div style={{ background:"rgba(100,170,100,0.15)", border:"1px solid #393", borderRadius:6, padding:"16px", fontSize:14, color:"#8c8", textAlign:"center" }}>Password updated! Redirecting...</div>
        ) : (
          <div>
            <div style={{ marginBottom:14 }}><label style={labelBase}>New Password</label><input style={authInput} type="password" value={newPass} onChange={e=>{setNewPass(e.target.value);setError("");}} placeholder="New password (6+ chars)" /></div>
            <div style={{ marginBottom:24 }}><label style={labelBase}>Confirm Password</label><input style={authInput} type="password" value={confirmPass} onChange={e=>{setConfirmPass(e.target.value);setError("");}} placeholder="Confirm new password" onKeyDown={e=>{if(e.key==="Enter")handleReset();}} /></div>
            <button onClick={handleReset} disabled={loading} style={{ ...btnPrimary, width:"100%", padding:14, opacity:loading?0.6:1 }}>{loading?"Updating...":"Update Password"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOME DASHBOARD (Logged In)
   ═══════════════════════════════════════════ */
function HomePage({ books, setPage, t, user, setBooks, setModal, showToast }) {
  const tv = books.reduce((s,b)=>s+(Number(b.currentValue)||0),0);
  const top = [...books].sort((a,b)=>(Number(b.currentValue)||0)-(Number(a.currentValue)||0))[0];
  const topHasValue = top && Number(top.currentValue) > 0;
  const [communityFeed, setCommunityFeed] = useState([]);
  const [marketFeed, setMarketFeed] = useState([]);
  const recentBooks = books.slice(0, 4);

  useEffect(() => {
    dbGetCommunityActivity(5).then(setCommunityFeed);
    dbGetRecentPriceReports(5).then(setMarketFeed);
  }, []);

  return (
    <div style={{ padding:"24px 20px 100px" }}>
      <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:22, color:"#e0d6c8", margin:"0 0 4px" }}>Your Library</h2>
      <p style={{ color:"#555", fontSize:12, margin:"0 0 16px", fontStyle:"italic" }}>Collection at a glance</p>

      {/* Search Bar - taps to full search page */}
      <div onClick={()=>setPage("search")} style={{ background:"#111", border:`1px solid ${gold}30`, borderRadius:10, padding:"14px 16px", marginBottom:24, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ color:"#555", fontSize:16 }}>&#9906;</span>
        <span style={{ color:"#666", fontSize:15, fontFamily:"'EB Garamond', serif" }}>Search for a book to add...</span>
      </div>

      {/* Onboarding for new users */}
      {books.length === 0 && (
        <div style={{ background:cardBg, border:`1px solid ${gold}25`, borderRadius:10, padding:"24px 20px", marginBottom:24, textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:8 }}>&#128218;</div>
          <h3 style={{ fontFamily:"'Cinzel', serif", fontSize:16, color:"#e0d6c8", margin:"0 0 8px" }}>Welcome to ShelfLife</h3>
          <p style={{ color:"#666", fontSize:13, margin:"0 0 16px" }}>Start building your collection. Search for a book above or browse the market below.</p>
          <button onClick={()=>setPage("search")} style={{ ...btnPrimary, padding:"10px 24px", fontSize:12 }}>Add Your First Book</button>
        </div>
      )}

      {/* Stats - only show when user has books */}
      {books.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
          {[["Volumes",books.length,"#e0d6c8"],["Collection Value",tv>0?"$"+tv.toLocaleString():"—",gold]].map(([l,v,c])=>(
            <div key={l} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontSize:9, color:"#444", textTransform:"uppercase", letterSpacing:2, fontFamily:"'Cinzel', serif" }}>{l}</div>
              <div style={{ fontSize:20, fontFamily:"'Cinzel', serif", color:c, marginTop:4 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Most Valuable - only if top book has value */}
      {topHasValue && (<div style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:10, padding:"14px 16px", marginBottom:24 }}>
        <div style={{ fontSize:9, color:gold, textTransform:"uppercase", letterSpacing:2, fontFamily:"'Cinzel', serif", marginBottom:4 }}>Most Valuable</div>
        <div style={{ fontFamily:"'Cinzel', serif", fontSize:15, color:"#e0d6c8" }}>{top.title}</div>
        <div style={{ fontSize:12, color:"#555", fontStyle:"italic" }}>{top.author}{top.publisher ? ` · ${top.publisher}` : ""} {top.editionType||""}</div>
        <div style={{ fontSize:18, color:gold, fontFamily:"'Cinzel', serif", marginTop:4 }}>${Number(top.currentValue).toLocaleString()}</div>
      </div>)}

      {/* Recently Added */}
      {recentBooks.length > 0 && (<div style={{ marginBottom:24 }}>
        <SH title="Recently Added" action={<button onClick={()=>setPage("shelf")} style={{ ...btnSmall, fontSize:9, padding:"4px 8px" }}>All</button>} />
        {recentBooks.map(b => (
          <div key={b.id} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:8, padding:"10px 12px", marginBottom:6, display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ width:36, height:50, borderRadius:3, background:"#111", border:`1px solid ${borderClr}`, overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {b.coverUrl ? <img src={b.coverUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:7, color:"#333" }}>N/A</span>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Cinzel', serif", fontSize:12, color:"#e0d6c8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.title}</div>
              <div style={{ fontSize:11, color:"#555", fontStyle:"italic" }}>{b.author}</div>
            </div>
            {b.editionType && <span style={{ fontSize:8, background:gold, color:"#111", padding:"2px 6px", borderRadius:3, fontFamily:"'Cinzel', serif", flexShrink:0 }}>{b.editionType}</span>}
          </div>
        ))}
      </div>)}

      {/* Market Activity - real data */}
      <SH title="Market Activity" action={<button onClick={()=>setPage("market")} style={{ ...btnSmall, fontSize:9, padding:"4px 8px" }}>All</button>} />
      {marketFeed.length > 0 ? marketFeed.slice(0,3).map((m,i)=>(<div key={i} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:8, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}><div><div style={{ fontFamily:"'Cinzel', serif", fontSize:13, color:"#e0d6c8" }}>{m.title}</div><div style={{ fontSize:10, color:"#444" }}>{m.publisher}{m.edition ? ` · ${m.edition}` : ""}</div></div><div style={{ textAlign:"right" }}><div style={{ fontFamily:"'Cinzel', serif", fontSize:16, color:gold }}>${m.price.toLocaleString()}</div><div style={{ fontSize:9, color:"#444" }}>{m.date}</div></div></div>))
      : <p style={{ color:"#444", fontSize:12, fontStyle:"italic", padding:"8px 0" }}>No market activity yet. Be the first to report a sale.</p>}

      <div style={{ marginTop:24 }}>
        <SH title="New Releases" action={<button onClick={()=>setPage("discover")} style={{ ...btnSmall, fontSize:9, padding:"4px 8px" }}>All</button>} />
        <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:8 }}>
          {NEW_RELEASES.map(r=>(<div key={r.id} style={{ minWidth:200, background:cardBg, border:`1px solid ${borderClr}`, borderRadius:10, padding:"12px 14px", flexShrink:0 }}><div style={{ fontFamily:"'Cinzel', serif", fontSize:12, color:"#e0d6c8" }}>{r.title}</div><div style={{ fontSize:11, color:"#555", fontStyle:"italic" }}>{r.author}</div><div style={{ fontSize:10, color:"#444", marginTop:4 }}>{r.editions}</div><span style={{ display:"inline-block", fontSize:8, marginTop:6, padding:"2px 6px", borderRadius:3, background:r.status==="Available"?"rgba(100,170,100,0.12)":`${gold}15`, color:r.status==="Available"?"#6a6":gold, fontFamily:"'Cinzel', serif" }}>{r.status}</span></div>))}
        </div>
      </div>

      {/* Community Activity - real data */}
      <div style={{ marginTop:24 }}>
        <SH title="Community" sub="Recent collector additions" />
        {communityFeed.length > 0 ? communityFeed.slice(0,4).map((a,i)=>(<div key={i} style={{ padding:"8px 0", borderBottom:`1px solid ${borderClr}`, fontSize:12 }}><span style={{ color:gold, fontFamily:"'Cinzel', serif" }}>{a.user}</span> <span style={{ color:"#444" }}>added</span> <span style={{ color:"#e0d6c8" }}>{a.title}</span> <span style={{ color:"#333" }}>· {a.detail} · {a.time}</span></div>))
        : <p style={{ color:"#444", fontSize:12, fontStyle:"italic", padding:"8px 0" }}>No community activity yet. Add a book to get things started!</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SEARCH PAGE (Full Screen - Like Goodreads)
   ═══════════════════════════════════════════ */
function SearchPage({ onBack, onAddBook, user, setBooks, books, showToast }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAddForm, setShowAddForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [olPage, setOlPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const timer = useRef(null);
  const inputRef = useRef(null);
  const lastQuery = useRef("");

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = (q) => {
    setQuery(q);
    clearTimeout(timer.current);
    if (q.trim().length < 2) { setResults([]); setHasSearched(false); setTotalResults(0); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      setHasSearched(true);
      setOlPage(1);
      lastQuery.current = q;
      const dbResults = await dbSearchBooks(q);
      const ql = q.toLowerCase();
      const localResults = BOOK_DB.filter(b => b.title.toLowerCase().includes(ql) || b.author.toLowerCase().includes(ql)).map(b => ({ ...b, source: "local" }));
      const seen = new Set();
      const merged = [];
      [...dbResults, ...localResults].forEach(r => {
        const key = (r.title + "|" + r.author).toLowerCase();
        if (!seen.has(key)) { seen.add(key); merged.push(r); }
      });
      // Get total count from Open Library
      try {
        const resp = await fetch("https://openlibrary.org/search.json?q=" + encodeURIComponent(q) + "&limit=1&fields=key");
        const json = await resp.json();
        setTotalResults(json.numFound || merged.length);
      } catch(e) { setTotalResults(merged.length); }
      setResults(merged);
      setSearching(false);
    }, 400);
  };

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = olPage + 1;
    try {
      const offset = nextPage * 20;
      const resp = await fetch(
        "https://openlibrary.org/search.json?q=" + encodeURIComponent(lastQuery.current) + "&limit=20&offset=" + offset + "&fields=key,title,author_name,first_publish_year,cover_i"
      );
      const json = await resp.json();
      const newResults = (json.docs || []).map(doc => ({
        title: doc.title || "Unknown",
        author: (doc.author_name || []).join(", ") || "Unknown",
        year: doc.first_publish_year ? String(doc.first_publish_year) : "",
        source: "openlibrary",
        coverId: doc.cover_i || null,
        olKey: doc.key || null,
      }));
      const seen = new Set(results.map(r => (r.title + "|" + r.author).toLowerCase()));
      const unique = newResults.filter(r => {
        const key = (r.title + "|" + r.author).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setResults(prev => [...prev, ...unique]);
      setOlPage(nextPage);
    } catch(e) { console.log("Load more failed"); }
    setLoadingMore(false);
  };

  const handleSelect = (result) => {
    setSelectedBook(result);
    // Fetch additional details from Open Library if available
    if (result.source === "openlibrary" && result.olKey) {
      fetch(`https://openlibrary.org${result.olKey}.json`)
        .then(r => r.json())
        .then(data => {
          setSelectedBook(prev => prev ? ({
            ...prev,
            description: typeof data.description === "string" ? data.description : data.description?.value || "",
            pages: data.number_of_pages || null,
            subjects: (data.subjects || []).slice(0, 6),
          }) : null);
        })
        .catch(() => {});
    }
  };

  const handleAddFromDetail = () => {
    if (!selectedBook) return;
    const coverUrl = selectedBook.coverId ? `https://covers.openlibrary.org/b/id/${selectedBook.coverId}-L.jpg` : "";
    setShowAddForm({ ...emptyBook, title: selectedBook.title, author: selectedBook.author, coverUrl });
    setSelectedBook(null);
  };

  const handleSave = async (formData) => {
    if (!user) return;
    // Check for duplicate
    const isDupe = await dbCheckDuplicate(user.id, formData.title, formData.author);
    if (isDupe) {
      if (showToast) showToast("This book is already on your shelf!", "error");
      setShowAddForm(null);
      return;
    }
    setSaving(true);
    const saved = await dbAddBook(user.id, formData);
    if (saved) {
      setBooks(prev => [saved, ...prev]);
      if (showToast) showToast(`"${saved.title}" added to your shelf!`);
    }
    setSaving(false);
    setShowAddForm(null);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", padding:"0 0 100px" }}>
      {/* Search Header */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:"#0a0a0a", borderBottom:`1px solid ${borderClr}`, padding:"12px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#888", fontSize:20, cursor:"pointer", padding:"4px 8px" }}>&#8592;</button>
          <div style={{ flex:1, position:"relative" }}>
            <input
              ref={inputRef}
              style={{ width:"100%", background:"#151515", border:`1px solid ${borderClr}`, color:"#e0d6c8", padding:"12px 40px 12px 14px", borderRadius:8, fontSize:16, fontFamily:"'EB Garamond', serif", boxSizing:"border-box" }}
              placeholder="Title, author, or ISBN..."
              value={query}
              onChange={e => doSearch(e.target.value)}
            />
            {searching && <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", width:16, height:16, border:"2px solid #333", borderTopColor:gold, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />}
          </div>
        </div>
        {/* Always visible Add Manually */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10, paddingLeft:40 }}>
          <button onClick={() => setShowAddForm({ ...emptyBook, title: query || "" })} style={{ background:"none", border:"none", color:gold, fontSize:12, cursor:"pointer", fontFamily:"'Cinzel', serif", letterSpacing:0.5 }}>+ Add Manually</button>
          {hasSearched && !searching && totalResults > 0 && (
            <span style={{ fontSize:12, color:"#666" }}>{totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Results */}
      <div style={{ padding:"4px 0" }}>

        {results.map((r, i) => (
          <div key={i} onClick={() => handleSelect(r)} style={{
            padding:"14px 20px", cursor:"pointer", borderBottom:`1px solid ${borderClr}`,
            display:"flex", gap:12, alignItems:"center",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="#151515";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}
          >
            {r.coverId ? (
              <img src={`https://covers.openlibrary.org/b/id/${r.coverId}-S.jpg`} alt="" style={{ width:40, height:56, objectFit:"cover", borderRadius:3, border:"1px solid #333", flexShrink:0 }} />
            ) : (
              <div style={{ width:40, height:56, borderRadius:3, border:"1px solid #222", background:"#151515", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:8, color:"#333", fontFamily:"'Cinzel', serif" }}>N/A</span>
              </div>
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Cinzel', serif", fontSize:14, color:"#e0d6c8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.title}</div>
              <div style={{ fontSize:13, color:"#777", fontStyle:"italic" }}>{r.author}</div>
              {r.year && <div style={{ fontSize:11, color:"#444", marginTop:2 }}>{r.year}</div>}
            </div>
            <span style={{ fontSize:10, color:gold, fontFamily:"'Cinzel', serif", flexShrink:0, padding:"4px 10px", border:`1px solid ${gold}40`, borderRadius:4 }}>+ ADD</span>
          </div>
        ))}

        {/* Load More Button */}
        {hasSearched && !searching && results.length > 0 && results.length < totalResults && (
          <div style={{ padding:"20px", textAlign:"center" }}>
            <button onClick={loadMore} disabled={loadingMore} style={{ ...btnPrimary, padding:"10px 28px", fontSize:12, background:`linear-gradient(135deg, #1a1510, #111)`, color:gold, border:`1px solid ${gold}30`, opacity:loadingMore?0.6:1 }}>
              {loadingMore ? "Loading..." : `More Results (${(totalResults - results.length).toLocaleString()} remaining)`}
            </button>
          </div>
        )}

        {hasSearched && !searching && results.length === 0 && (
          <div style={{ padding:"40px 20px", textAlign:"center" }}>
            <p style={{ color:"#666", fontSize:15, marginBottom:8 }}>No results for "{query}"</p>
            <p style={{ color:"#444", fontSize:13 }}>Try a different search or use "+ Add Manually" above</p>
          </div>
        )}

        {!hasSearched && (
          <div style={{ padding:"60px 20px", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:12, opacity:0.2 }}>&#9906;</div>
            <p style={{ color:"#555", fontSize:14 }}>Search millions of books</p>
            <p style={{ color:"#444", fontSize:12, marginTop:4 }}>Type a title, author name, or ISBN</p>
          </div>
        )}
      </div>

      {/* Book Detail View */}
      {selectedBook && !showAddForm && (
        <div style={{ position:"fixed", inset:0, background:"#0a0a0a", zIndex:60, overflowY:"auto", padding:"0 0 100px" }}>
          <div style={{ position:"sticky", top:0, zIndex:61, background:"#0a0a0a", borderBottom:`1px solid ${borderClr}`, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={()=>setSelectedBook(null)} style={{ background:"none", border:"none", color:"#888", fontSize:20, cursor:"pointer", padding:"4px 8px" }}>&#8592;</button>
            <span style={{ fontFamily:"'Cinzel', serif", fontSize:14, color:"#e0d6c8", flex:1 }}>Book Details</span>
          </div>

          <div style={{ padding:"24px 20px" }}>
            {/* Cover and Title */}
            <div style={{ display:"flex", gap:16, marginBottom:20 }}>
              <div style={{ width:120, height:176, borderRadius:6, overflow:"hidden", border:`1px solid #333`, background:"#151515", flexShrink:0, boxShadow:"4px 4px 16px rgba(0,0,0,0.5)" }}>
                {selectedBook.coverId ? (
                  <img src={`https://covers.openlibrary.org/b/id/${selectedBook.coverId}-L.jpg`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                ) : (
                  <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", padding:12, textAlign:"center" }}>
                    <div style={{ fontFamily:"'Cinzel', serif", fontSize:11, color:"#555", textTransform:"uppercase", lineHeight:1.3 }}>{selectedBook.title}</div>
                    <div style={{ width:16, height:1, background:"#333", margin:"8px 0" }} />
                    <div style={{ fontSize:10, color:"#444", fontStyle:"italic" }}>{selectedBook.author?.split(" ").pop()}</div>
                  </div>
                )}
              </div>
              <div style={{ flex:1 }}>
                <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:20, color:"#e0d6c8", margin:"0 0 6px", lineHeight:1.2 }}>{selectedBook.title}</h2>
                <p style={{ fontSize:15, color:"#888", fontStyle:"italic", margin:"0 0 8px" }}>by {selectedBook.author}</p>
                {selectedBook.year && <p style={{ fontSize:13, color:"#555", margin:"0 0 12px" }}>First published {selectedBook.year}</p>}
                {selectedBook.pages && <p style={{ fontSize:12, color:"#555", margin:"0 0 4px" }}>{selectedBook.pages} pages</p>}
                <button onClick={handleAddFromDetail} style={{ ...btnPrimary, padding:"10px 20px", fontSize:12, marginTop:8 }}>+ Add to Shelf</button>
              </div>
            </div>

            {/* Description */}
            {selectedBook.description && (
              <div style={{ marginBottom:20 }}>
                <div style={labelBase}>Description</div>
                <p style={{ color:"#999", fontSize:14, lineHeight:1.6, margin:"6px 0 0" }}>{selectedBook.description.length > 500 ? selectedBook.description.slice(0, 500) + "..." : selectedBook.description}</p>
              </div>
            )}

            {/* Subjects/Tags */}
            {selectedBook.subjects && selectedBook.subjects.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={labelBase}>Subjects</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:6 }}>
                  {selectedBook.subjects.map((s, i) => (
                    <span key={i} style={{ fontSize:11, color:"#777", background:"#151515", padding:"3px 10px", borderRadius:4, border:`1px solid ${borderClr}` }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Add Button at bottom */}
            <div style={{ borderTop:`1px solid ${borderClr}`, paddingTop:16, marginTop:8 }}>
              <button onClick={handleAddFromDetail} style={{ ...btnPrimary, width:"100%", padding:"14px", fontSize:14 }}>Add to My Shelf</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <Modal onClose={() => setShowAddForm(null)}>
          <BookForm book={showAddForm} onSave={handleSave} onCancel={() => setShowAddForm(null)} />
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHELF PAGE
   ═══════════════════════════════════════════ */
function SpineColor(title) {
  const colors = ["#2a1a1a","#1a1a2a","#1a2a1a","#2a2a1a","#2a1a2a","#1a2a2a","#251510","#101825","#182510","#251018","#0f1520","#201510","#1b1520","#15201b","#20151b","#151b20"];
  let h = 0; for (let i = 0; i < title.length; i++) h = ((h << 5) - h + title.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

function BookshelfView({ books, onSelect }) {
  const shelfRows = [];
  const booksPerShelf = 6;
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelfRows.push(books.slice(i, i + booksPerShelf));
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {shelfRows.map((row, ri) => (
        <div key={ri} style={{ position:"relative", marginBottom:4 }}>
          {/* Books */}
          <div style={{ display:"flex", gap:0, overflowX:"auto", padding:"12px 8px 0", minHeight:160, alignItems:"flex-end", scrollbarWidth:"none" }}>
            {row.map(book => {
              const spineW = 36 + Math.random() * 12;
              const h = 140 + (book.editionType === "Lettered" ? 16 : book.editionType === "Numbered" ? 8 : 0);
              const bgC = SpineColor(book.title);
              const isLettered = book.editionType === "Lettered";
              const isDeluxe = book.editionType === "Deluxe" || book.editionType === "Ultra-Deluxe" || book.editionType === "Traycased";
              return (
                <div key={book.id} onClick={() => onSelect(book)} style={{ width: spineW, height: h, flexShrink: 0, cursor: "pointer", position: "relative", transition: "transform 0.3s, margin-top 0.3s", borderRadius: "2px 2px 0 0", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-12px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                >
                  {/* Spine body */}
                  <div style={{
                    width: "100%", height: "100%",
                    background: isLettered ? `linear-gradient(180deg, #2a2018, #1a1510, #2a2018)` : isDeluxe ? `linear-gradient(180deg, #1a1520, #0f0f18, #1a1520)` : `linear-gradient(180deg, ${bgC}, #0a0a0a, ${bgC})`,
                    borderLeft: `1px solid ${isLettered ? gold + "40" : "#2a2a2a"}`,
                    borderRight: "1px solid #0a0a0a",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 2px",
                    position: "relative",
                  }}>
                    {/* Gold foil for lettered */}
                    {isLettered && <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, border: `1px solid ${gold}50`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 4, height: 4, background: gold, borderRadius: "50%" }} /></div>}

                    {/* Horizontal lines decoration */}
                    <div style={{ position: "absolute", top: isLettered ? 28 : 12, left: 4, right: 4, height: 1, background: isLettered ? gold + "30" : "#ffffff10" }} />
                    <div style={{ position: "absolute", bottom: 12, left: 4, right: 4, height: 1, background: isLettered ? gold + "30" : "#ffffff10" }} />

                    {/* Title - vertical text */}
                    <div style={{
                      writingMode: "vertical-rl", textOrientation: "mixed",
                      fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: 1,
                      color: isLettered ? gold : "#888",
                      textTransform: "uppercase", overflow: "hidden", maxHeight: h - 50,
                      whiteSpace: "nowrap", textOverflow: "ellipsis",
                    }}>{book.title}</div>

                    {/* Author initial at bottom */}
                    <div style={{ position: "absolute", bottom: 16, fontSize: 7, color: isLettered ? gold + "80" : "#555", fontFamily: "'Cinzel', serif" }}>{book.author.split(" ").pop()[0]}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div data-shelf-plank style={{
            height: 10,
            background: "linear-gradient(180deg, #3a2a1a, #2a1a0a, #1a0f05)",
            borderTop: "2px solid #4a3520",
            borderBottom: "1px solid #0a0500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 #5a4530",
            borderRadius: "0 0 2px 2px",
          }} />
          {/* Shelf shadow */}
          <div style={{ height: 8, background: "linear-gradient(180deg, rgba(0,0,0,0.4), transparent)" }} />
        </div>
      ))}
      {books.length === 0 && (
        <div style={{ position: "relative" }}>
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#444", fontSize: 13, fontStyle: "italic" }}>Your shelf is empty. Add your first book.</div>
          <div style={{ height: 10, background: "linear-gradient(180deg, #3a2a1a, #2a1a0a, #1a0f05)", borderTop: "2px solid #4a3520", boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 #5a4530" }} />
        </div>
      )}
    </div>
  );
}

function CoverShelfView({ books, onSelect }) {
  const shelfRows = [];
  const booksPerShelf = 3;
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelfRows.push(books.slice(i, i + booksPerShelf));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {shelfRows.map((row, ri) => (
        <div key={ri} style={{ position: "relative", marginBottom: 4 }}>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "12px 12px 0", minHeight: 190, alignItems: "flex-end", justifyContent: "center", scrollbarWidth: "none" }}>
            {row.map(book => {
              const isLettered = book.editionType === "Lettered";
              const isSpecial = isLettered || book.editionType === "Numbered" || book.editionType === "Traycased" || book.editionType === "Deluxe" || book.editionType === "Ultra-Deluxe";
              const bgC = SpineColor(book.title);
              return (
                <div key={book.id} onClick={() => onSelect(book)} style={{
                  width: 100, flexShrink: 0, cursor: "pointer", transition: "transform 0.3s",
                }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-10px)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
                  {/* Book cover */}
                  <div style={{
                    width: 100, height: 148, borderRadius: "3px 6px 6px 3px", overflow: "hidden",
                    border: isLettered ? `2px solid ${gold}60` : `1px solid #333`,
                    boxShadow: isLettered
                      ? `4px 4px 12px rgba(0,0,0,0.6), 0 0 20px ${gold}10, inset -2px 0 4px rgba(0,0,0,0.3)`
                      : "4px 4px 12px rgba(0,0,0,0.6), inset -2px 0 4px rgba(0,0,0,0.3)",
                    position: "relative", background: `linear-gradient(135deg, ${bgC}, #0a0a0a)`,
                  }}>
                    {/* Spine edge shadow */}
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: "linear-gradient(90deg, rgba(0,0,0,0.5), transparent)", zIndex: 2 }} />

                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 8, textAlign: "center" }}>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: isLettered ? gold : "#666", letterSpacing: 1, lineHeight: 1.3, textTransform: "uppercase", marginBottom: 6 }}>{book.title}</div>
                        <div style={{ width: 20, height: 1, background: isLettered ? gold + "60" : "#333", marginBottom: 6 }} />
                        <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 9, color: isLettered ? gold + "aa" : "#555", fontStyle: "italic" }}>{book.author.split(" ").pop()}</div>
                      </div>
                    )}

                    {/* Lettered badge */}
                    {isSpecial && (
                      <div style={{ position: "absolute", top: 4, right: 4, background: isLettered ? gold : "#555", color: "#111", padding: "1px 5px", borderRadius: 2, fontSize: 7, fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: 0.5 }}>{book.editionType === "Lettered" ? "LTD" : book.editionType === "Numbered" ? "NUM" : "DLX"}</div>
                    )}
                  </div>

                  {/* Title below */}
                  <div style={{ padding: "6px 2px 0", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: 0.5 }}>{book.title}</div>
                    <div style={{ fontSize: 8, color: "#555", fontStyle: "italic", marginTop: 1 }}>{book.author.split(" ").pop()}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Shelf plank */}
          <div data-shelf-plank style={{
            height: 10, marginTop: 2,
            background: "linear-gradient(180deg, #3a2a1a, #2a1a0a, #1a0f05)",
            borderTop: "2px solid #4a3520",
            borderBottom: "1px solid #0a0500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 #5a4530",
            borderRadius: "0 0 2px 2px",
          }} />
          <div style={{ height: 8, background: "linear-gradient(180deg, rgba(0,0,0,0.4), transparent)" }} />
        </div>
      ))}
      {books.length === 0 && (
        <div style={{ position: "relative" }}>
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#444", fontSize: 13, fontStyle: "italic" }}>Your shelf is empty. Add your first book.</div>
          <div data-shelf-plank style={{ height: 10, background: "linear-gradient(180deg, #3a2a1a, #2a1a0a, #1a0f05)", borderTop: "2px solid #4a3520", boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 #5a4530" }} />
        </div>
      )}
    </div>
  );
}

function ShelfPage({ books, setBooks, modal, setModal, t, user, setPage, showToast }) {
  const [search,setSearch]=useState(""); const [sortBy,setSortBy]=useState("title"); const [prefill,setPrefill]=useState(null); const [confirmDel,setConfirmDel]=useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "shelf" | "covers"
  const [showInvestment, setShowInvestment] = useState(false);
  const filtered = books.filter(b=>{const q=search.toLowerCase(); return !q||b.title.toLowerCase().includes(q)||b.author.toLowerCase().includes(q)||(b.publisher||"").toLowerCase().includes(q);}).sort((a,b)=>{if(sortBy==="title")return a.title.localeCompare(b.title);if(sortBy==="author")return a.author.localeCompare(b.author);if(sortBy==="value")return(Number(b.currentValue)||0)-(Number(a.currentValue)||0);return b.id-a.id;});

  const tv = books.reduce((s,b)=>s+(Number(b.currentValue)||0),0);
  const tp = books.reduce((s,b)=>s+(Number(b.purchasePrice)||0),0);
  const tg = tv - tp;
  const roi = tp > 0 ? ((tg / tp) * 100).toFixed(1) : "0";

  const handleSave = async (d) => {
    if (modal?.type === "edit") {
      const ok = await dbUpdateBook(modal.book.id, d);
      if (ok) { setBooks(p => p.map(b => b.id === modal.book.id ? { ...b, ...d } : b)); if(showToast) showToast("Book updated!"); }
    } else {
      if (!user) return;
      const isDupe = await dbCheckDuplicate(user.id, d.title, d.author);
      if (isDupe) { if(showToast) showToast("This book is already on your shelf!", "error"); setModal(null); setPrefill(null); return; }
      const saved = await dbAddBook(user.id, d);
      if (saved) { setBooks(p => [saved, ...p]); if(showToast) showToast(`"${saved.title}" added to your shelf!`); }
    }
    setModal(null); setPrefill(null);
  };

  const handleDelete = async (id) => {
    const ok = await dbDeleteBook(id);
    if (ok) setBooks(p => p.filter(b => b.id !== id));
    setModal(null); setConfirmDel(null);
  };

  return (
    <div style={{ padding:"24px 20px 100px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:22, color:"#e0d6c8", margin:0 }}>The Shelf</h2>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* View toggle */}
          <div style={{ display:"flex", border:`1px solid ${borderClr}`, borderRadius:4, overflow:"hidden" }}>
            <button onClick={()=>setViewMode("list")} style={{ background:viewMode==="list"?gold+"20":"transparent", border:"none", color:viewMode==="list"?gold:"#444", padding:"5px 8px", cursor:"pointer", fontSize:11 }} title="List">☰</button>
            <button onClick={()=>setViewMode("shelf")} style={{ background:viewMode==="shelf"?gold+"20":"transparent", border:"none", color:viewMode==="shelf"?gold:"#444", padding:"5px 8px", cursor:"pointer", fontSize:11, borderLeft:`1px solid ${borderClr}` }} title="Spines">▐</button>
            <button onClick={()=>setViewMode("covers")} style={{ background:viewMode==="covers"?gold+"20":"transparent", border:"none", color:viewMode==="covers"?gold:"#444", padding:"5px 8px", cursor:"pointer", fontSize:11, borderLeft:`1px solid ${borderClr}` }} title="Covers">▦</button>
          </div>
          <button onClick={()=>setPage("search")} style={{ ...btnPrimary, padding:"8px 16px", fontSize:11 }}>+ Add</button>
        </div>
      </div>

      {/* Investment Stats Toggle */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", gap:8 }}>
          <input style={{ ...inputBase, flex:1, fontSize:13, padding:"8px 12px", width:180 }} placeholder="Filter your shelf..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select style={{ ...selectBase, maxWidth:100, fontSize:11, padding:"8px" }} value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="title">Title</option><option value="author">Author</option><option value="value">Value</option><option value="recent">Recent</option></select>
        </div>
        <button onClick={()=>setShowInvestment(!showInvestment)} style={{ background:"none", border:`1px solid ${showInvestment?gold+"60":borderClr}`, color:showInvestment?gold:"#555", padding:"6px 10px", borderRadius:4, cursor:"pointer", fontSize:9, fontFamily:"'Cinzel', serif", letterSpacing:0.5, whiteSpace:"nowrap" }}>
          {showInvestment ? "▲ Stats" : "▼ Stats"}
        </button>
      </div>

      {/* Investment Stats Panel */}
      {showInvestment && books.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6, marginBottom:14 }}>
          <div style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ fontSize:8, color:"#444", textTransform:"uppercase", letterSpacing:1, fontFamily:"'Cinzel', serif" }}>Invested</div>
            <div style={{ fontSize:14, fontFamily:"'Cinzel', serif", color:"#e0d6c8", marginTop:2 }}>${tp.toLocaleString()}</div>
          </div>
          <div style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ fontSize:8, color:"#444", textTransform:"uppercase", letterSpacing:1, fontFamily:"'Cinzel', serif" }}>Value</div>
            <div style={{ fontSize:14, fontFamily:"'Cinzel', serif", color:gold, marginTop:2 }}>${tv.toLocaleString()}</div>
          </div>
          <div style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ fontSize:8, color:"#444", textTransform:"uppercase", letterSpacing:1, fontFamily:"'Cinzel', serif" }}>Gain</div>
            <div style={{ fontSize:14, fontFamily:"'Cinzel', serif", color:tg>=0?"#6a6":"#c66", marginTop:2 }}>{tg>=0?"+":""}${tg.toLocaleString()}</div>
          </div>
          <div style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ fontSize:8, color:"#444", textTransform:"uppercase", letterSpacing:1, fontFamily:"'Cinzel', serif" }}>ROI</div>
            <div style={{ fontSize:14, fontFamily:"'Cinzel', serif", color:tg>=0?"#6a6":"#c66", marginTop:2 }}>{roi}%</div>
          </div>
        </div>
      )}

      {/* SPINE SHELF VIEW */}
      {viewMode === "shelf" && <BookshelfView books={filtered} onSelect={book => setModal({type:"detail",book})} />}

      {/* COVERS SHELF VIEW */}
      {viewMode === "covers" && <CoverShelfView books={filtered} onSelect={book => setModal({type:"detail",book})} />}

      {/* LIST VIEW */}
      {viewMode === "list" && <>
      {filtered.map(book=>{const g=book.currentValue&&book.purchasePrice?Number(book.currentValue)-Number(book.purchasePrice):null;return(
        <div key={book.id} onClick={()=>setModal({type:"detail",book})} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:8, padding:"12px 14px", marginBottom:8, cursor:"pointer", display:"flex", gap:12 }}>
          <div style={{ width:50, height:70, borderRadius:4, background:"#111", border:`1px solid ${borderClr}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:8, color:"#222" }}>{book.coverUrl?<img src={book.coverUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:3 }} />:"NO COVER"}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}><h3 style={{ fontFamily:"'Cinzel', serif", fontSize:13, color:"#e0d6c8", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", paddingRight:8 }}>{book.title}</h3><span style={{ fontSize:8, background:gold, color:"#111", padding:"2px 6px", borderRadius:3, fontFamily:"'Cinzel', serif", flexShrink:0 }}>{book.editionType||"N/A"}</span></div>
            <div style={{ fontSize:11, color:"#555", fontStyle:"italic", margin:"2px 0 4px" }}>{book.author}</div>
            <div style={{ display:"flex", gap:8, fontSize:10, color:"#444" }}><span>{book.publisher}</span>{book.limitation&&<span style={{ color:gold }}>{book.limitation}</span>}<span style={{ padding:"0 4px", borderRadius:2, background:book.condition==="Mint"?"rgba(100,200,100,0.1)":"rgba(200,180,100,0.08)", color:book.condition==="Mint"?"#6a6":"#998", fontSize:9 }}>{book.condition}</span></div>
            {book.currentValue&&<div style={{ fontSize:11, marginTop:4, color:"#555" }}>Val <span style={{ color:gold }}>${Number(book.currentValue).toLocaleString()}</span>{g!==null&&<span style={{ color:g>=0?"#6a6":"#c66", marginLeft:8 }}>{g>=0?"+":""}${g.toLocaleString()}</span>}</div>}
          </div>
        </div>
      );})}
      {filtered.length===0&&<p style={{ color:"#444", textAlign:"center", padding:40 }}>No books found.</p>}
      </>}

      {modal?.type==="edit"&&<Modal onClose={()=>setModal(null)}><BookForm book={modal.book} isEdit onSave={handleSave} onCancel={()=>setModal(null)} /></Modal>}
      {modal?.type==="detail"&&!confirmDel&&<Modal onClose={()=>setModal(null)}><DetailView book={modal.book} user={user} onEdit={()=>setModal({type:"edit",book:modal.book})} onDelete={()=>setConfirmDel(modal.book.id)} onClose={()=>setModal(null)} onUpdateCover={async (bookId, url) => {
        await dbUpdateBook(bookId, { ...modal.book, coverUrl: url });
        setBooks(p => p.map(b => b.id === bookId ? { ...b, coverUrl: url } : b));
        setModal(prev => prev ? { ...prev, book: { ...prev.book, coverUrl: url } } : null);
      }} /></Modal>}
      {confirmDel&&<Modal onClose={()=>setConfirmDel(null)}><div style={{ textAlign:"center", padding:"16px 0" }}><h3 style={{ fontFamily:"'Cinzel', serif", color:gold, margin:"0 0 10px" }}>Remove?</h3><p style={{ color:"#777", marginBottom:24, fontSize:14 }}>Cannot be undone.</p><div style={{ display:"flex", gap:12, justifyContent:"center" }}><button onClick={()=>setConfirmDel(null)} style={btnGhost}>Cancel</button><button onClick={()=>handleDelete(confirmDel)} style={btnDanger}>Delete</button></div></div></Modal>}
    </div>
  );
}

function BookForm({ book, onSave, onCancel, isEdit }) {
  const [f, setF] = useState(()=>book?{...book}:{...emptyBook}); const s=(k,v)=>setF(p=>({...p,[k]:v})); const valid=f.title.trim()&&f.author.trim();
  const [searchingCover, setSearchingCover] = useState(false);
  const [coverOptions, setCoverOptions] = useState([]);
  const [estimating, setEstimating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const searchCover = async () => {
    if (!f.title.trim()) return;
    setSearchingCover(true);
    setCoverOptions([]);
    try {
      const titleQ = encodeURIComponent(f.title.trim());
      const authorQ = f.author.trim() ? "&author=" + encodeURIComponent(f.author.trim()) : "";
      const resp = await fetch(`https://openlibrary.org/search.json?title=${titleQ}${authorQ}&limit=12&fields=key,title,author_name,cover_i`);
      const json = await resp.json();
      const covers = (json.docs || []).filter(d => d.cover_i).map(d => ({
        id: d.cover_i,
        url: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
        thumb: `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`,
      }));
      const seen = new Set();
      setCoverOptions(covers.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));
    } catch (e) { console.log("Cover search failed"); }
    setSearchingCover(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Compress and convert to data URL for now (Supabase Storage can be added later)
    setUploading(true);
    try {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.onload = () => {
        const maxW = 600, maxH = 900;
        let w = img.width, h = img.height;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        if (h > maxH) { w = (maxH / h) * w; h = maxH; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        s("coverUrl", dataUrl);
        setUploading(false);
      };
      img.onerror = () => { setUploading(false); };
      img.src = URL.createObjectURL(file);
    } catch (err) { setUploading(false); }
  };

  const estimateValue = async () => {
    if (!f.title.trim()) return;
    setEstimating(true);
    // Get community reports
    const reports = await dbGetPriceReports(f.title);
    const communityPrices = reports.map(r => r.price);
    // Get eBay data
    let ebayPrices = [];
    try {
      const params = new URLSearchParams({ title: f.title });
      if (f.publisher) params.set("publisher", f.publisher);
      if (f.editionType) params.set("edition", f.editionType);
      const resp = await fetch(`/api/ebay?${params.toString()}`);
      const data = await resp.json();
      if (data.results) ebayPrices = data.results.map(r => r.price);
    } catch(e) {}
    const allPrices = [...communityPrices, ...ebayPrices];
    if (allPrices.length > 0) {
      const avg = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length);
      s("currentValue", String(avg));
    }
    setEstimating(false);
  };

  return (<div>
    <h2 style={{ fontFamily:"'Cinzel', serif", color:gold, margin:"0 0 16px", fontSize:18 }}>{isEdit?"Edit":"Collector Details"}</h2>
    
    {/* Cover Preview */}
    <div style={{ display:"flex", gap:14, marginBottom:16 }}>
      <div style={{ width:80, height:110, borderRadius:4, border:`1px solid ${borderClr}`, background:"#111", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
        {f.coverUrl ? (
          <img src={f.coverUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        ) : (
          <span style={{ fontSize:9, color:"#333" }}>NO COVER</span>
        )}
      </div>
      <div style={{ flex:1 }}>
        <label style={labelBase}>Cover Image</label>
        <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap" }}>
          <button onClick={()=>fileInputRef.current?.click()} disabled={uploading} style={{ background:"none", border:`1px solid ${gold}40`, color:gold, padding:"4px 10px", borderRadius:4, cursor:"pointer", fontSize:10, fontFamily:"'Cinzel', serif" }}>
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
          <button onClick={searchCover} disabled={searchingCover} style={{ background:"none", border:`1px solid ${gold}40`, color:gold, padding:"4px 10px", borderRadius:4, cursor:"pointer", fontSize:10, fontFamily:"'Cinzel', serif", opacity:searchingCover?0.5:1 }}>
            {searchingCover ? "Searching..." : "Find Cover"}
          </button>
          {f.coverUrl && <button onClick={()=>s("coverUrl","")} style={{ background:"none", border:"none", color:"#666", padding:"4px 6px", cursor:"pointer", fontSize:10 }}>Remove</button>}
        </div>
        <input style={{ ...inputBase, fontSize:11, padding:"6px 8px" }} placeholder="Or paste image URL..." value={f.coverUrl||""} onChange={e=>s("coverUrl",e.target.value)} />
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFileUpload} />
      </div>
    </div>

    {/* Cover Options Grid */}
    {coverOptions.length > 0 && (
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, color:"#666", marginBottom:6 }}>Select a cover:</div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8 }}>
          {coverOptions.map((c, i) => (
            <div key={i} onClick={() => { s("coverUrl", c.url); setCoverOptions([]); }} style={{
              width:55, height:78, borderRadius:3, overflow:"hidden", cursor:"pointer", flexShrink:0,
              border: f.coverUrl === c.url ? `2px solid ${gold}` : "1px solid #333",
            }}>
              <img src={c.thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
          ))}
        </div>
      </div>
    )}

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
      <div style={{ gridColumn:"1/-1" }}><label style={labelBase}>Title *</label><input style={inputBase} value={f.title} onChange={e=>s("title",e.target.value)} /></div>
      <div style={{ gridColumn:"1/-1" }}><label style={labelBase}>Author *</label><input style={inputBase} value={f.author} onChange={e=>s("author",e.target.value)} /></div>
      <div><label style={labelBase}>Publisher</label>
        {f.publisher === "__custom__" || (f.publisher && !PUBLISHERS.includes(f.publisher)) ? (
          <div style={{ display:"flex", gap:4 }}>
            <input style={{ ...inputBase, flex:1 }} value={f.publisher === "__custom__" ? "" : f.publisher} onChange={e=>s("publisher",e.target.value)} placeholder="Enter publisher name..." autoFocus />
            <button onClick={()=>s("publisher","")} style={{ ...btnSmall, fontSize:9, padding:"4px 8px", whiteSpace:"nowrap" }}>List</button>
          </div>
        ) : (
          <select style={selectBase} value={f.publisher} onChange={e=>{if(e.target.value==="__custom__")s("publisher","__custom__");else s("publisher",e.target.value);}}>
            <option value="">Select...</option>
            {PUBLISHERS.filter(p=>p!=="Other").map(p=><option key={p}>{p}</option>)}
            <option value="__custom__">+ Add Other Publisher</option>
          </select>
        )}
      </div>
      <div><label style={labelBase}>Edition</label><select style={selectBase} value={f.editionType} onChange={e=>s("editionType",e.target.value)}><option value="">Select...</option>{EDITION_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
      <div><label style={labelBase}>Limitation</label><input style={inputBase} value={f.limitation} onChange={e=>s("limitation",e.target.value)} placeholder="#42/500" /></div>
      <div><label style={labelBase}>Condition</label><select style={selectBase} value={f.condition} onChange={e=>s("condition",e.target.value)}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></div>
      <div><label style={labelBase}>Paid ($)</label><input style={inputBase} type="number" value={f.purchasePrice} onChange={e=>s("purchasePrice",e.target.value)} placeholder="Optional" /></div>
      <div>
        <label style={labelBase}>Est. Value ($)</label>
        <div style={{ display:"flex", gap:4 }}>
          <input style={{ ...inputBase, flex:1 }} type="number" value={f.currentValue} onChange={e=>s("currentValue",e.target.value)} placeholder="—" />
          <button onClick={estimateValue} disabled={estimating||!f.title.trim()} style={{ background:"none", border:`1px solid ${gold}40`, color:gold, padding:"0 8px", borderRadius:4, cursor:"pointer", fontSize:9, fontFamily:"'Cinzel', serif", whiteSpace:"nowrap", opacity:(estimating||!f.title.trim())?0.4:1 }} title="Estimate from community data">
            {estimating ? "..." : "Est."}
          </button>
        </div>
        {f.currentValue && <div style={{ fontSize:9, color:"#444", marginTop:2 }}>Based on community reports</div>}
      </div>
      <div style={{ gridColumn:"1/-1" }}><label style={labelBase}>Notes</label><textarea style={{ ...inputBase, minHeight:50, resize:"vertical" }} value={f.notes} onChange={e=>s("notes",e.target.value)} /></div>
    </div>
    <div style={{ display:"flex", gap:12, marginTop:16, justifyContent:"flex-end" }}><button onClick={onCancel} style={btnGhost}>Cancel</button><button onClick={()=>{if(valid)onSave(f);}} style={{ ...btnPrimary, opacity:valid?1:0.4, padding:"10px 20px", fontSize:12 }}>{isEdit?"Save":"Add to Shelf"}</button></div>
  </div>);
}

function PriceCheckPanel({ title, edition, publisher, onClose, user }) {
  const [loading, setLoading] = useState(true);
  const [communityData, setCommunityData] = useState([]);
  const [ebayData, setEbayData] = useState([]);
  const [ebayLoading, setEbayLoading] = useState(true);
  const [ebayError, setEbayError] = useState(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    dbGetPriceReports(title).then(r => { setCommunityData(r); setLoading(false); });
    const params = new URLSearchParams({ title });
    if (publisher) params.set("publisher", publisher);
    if (edition) params.set("edition", edition);
    fetch(`/api/ebay?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.results) setEbayData(data.results);
        else if (data.error) setEbayError(data.error);
        setEbayLoading(false);
      })
      .catch(() => { setEbayError("Failed to connect"); setEbayLoading(false); });
  }, [title]);

  if (loading && ebayLoading) return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <div style={{ width: 28, height: 28, border: "2px solid #333", borderTopColor: "#c4a265", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: "#c4a265", letterSpacing: 1 }}>Checking prices...</p>
      <p style={{ fontSize: 11, color: "#555", fontStyle: "italic" }}>Scanning eBay listings and community data</p>
    </div>
  );

  const communityPrices = communityData.map(c => c.price);
  const ebayPrices = ebayData.map(e => e.price);
  const allPrices = [...communityPrices, ...ebayPrices];
  const hasData = allPrices.length > 0;
  const avg = hasData ? Math.round(allPrices.reduce((a,b)=>a+b,0) / allPrices.length) : 0;
  const low = hasData ? Math.min(...allPrices) : 0;
  const high = hasData ? Math.max(...allPrices) : 0;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <h3 style={{ fontFamily:"'Cinzel', serif", color:gold, margin:0, fontSize:18 }}>Price Check</h3>
          <p style={{ color:"#666", fontSize:13, fontStyle:"italic", margin:"4px 0 0" }}>{title} {edition && `\u00b7 ${edition}`}</p>
        </div>
        {onClose && <button onClick={onClose} style={{ background:"none", border:"none", color:"#444", fontSize:16, cursor:"pointer" }}>X</button>}
      </div>

      {hasData ? (
        <div style={{ background:"linear-gradient(135deg, #1a1510, #111)", border:`1px solid ${gold}25`, borderRadius:10, padding:"18px 20px", marginBottom:16, textAlign:"center" }}>
          <div style={{ fontSize:9, color:gold, textTransform:"uppercase", letterSpacing:2, fontFamily:"'Cinzel', serif", marginBottom:6 }}>Estimated Value</div>
          <div style={{ fontSize:36, fontFamily:"'Cinzel', serif", color:gold }}>${avg.toLocaleString()}</div>
          <div style={{ fontSize:12, color:"#666", marginTop:4 }}>Range: ${low.toLocaleString()} \u2014 ${high.toLocaleString()}</div>
          <div style={{ fontSize:10, color:"#444", marginTop:4 }}>Based on {allPrices.length} data point{allPrices.length !== 1 ? "s" : ""} (eBay + community)</div>
        </div>
      ) : (
        <div style={{ background:"linear-gradient(135deg, #1a1510, #111)", border:`1px solid ${borderClr}`, borderRadius:10, padding:"18px 20px", marginBottom:16, textAlign:"center" }}>
          <div style={{ fontSize:9, color:"#555", textTransform:"uppercase", letterSpacing:2, fontFamily:"'Cinzel', serif", marginBottom:6 }}>No Price Data Yet</div>
          <p style={{ color:"#666", fontSize:13, margin:"8px 0 0" }}>Be the first to report a sale for this book.</p>
        </div>
      )}

      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div style={{ fontSize:11, color:gold, textTransform:"uppercase", letterSpacing:1.5, fontFamily:"'Cinzel', serif" }}>eBay Listings</div>
          {ebayLoading ? <span style={{ fontSize:10, color:"#555" }}>Loading...</span> : <span style={{ fontSize:10, color:"#444" }}>{ebayData.length} listing{ebayData.length !== 1 ? "s" : ""}</span>}
        </div>
        {ebayLoading ? (
          <div style={{ padding:"12px", textAlign:"center" }}><div style={{ width:16, height:16, border:"2px solid #333", borderTopColor:"#c4a265", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} /></div>
        ) : ebayError ? (
          <p style={{ color:"#555", fontSize:12, fontStyle:"italic", padding:"8px 0" }}>{ebayError}</p>
        ) : ebayData.length > 0 ? (
          ebayData.map((e,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:i%2===0?"#0f0f0f":"transparent", borderRadius:4, fontSize:12, marginBottom:1 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ color:"#e0d6c8", fontFamily:"'Cinzel', serif", fontSize:14 }}>${e.price.toLocaleString()}</span>
                  {e.condition && <span style={{ color:"#555", fontSize:9 }}>{e.condition}</span>}
                  <span style={{ fontSize:8, color:"#333", background:"#1a1a1a", padding:"1px 4px", borderRadius:2 }}>Match: {e.score}%</span>
                </div>
                <div style={{ fontSize:10, color:"#444", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.title}</div>
              </div>
              <span style={{ color:"#444", fontSize:9, flexShrink:0, marginLeft:8 }}>{e.date}</span>
            </div>
          ))
        ) : (
          <p style={{ color:"#555", fontSize:12, fontStyle:"italic", padding:"8px 0" }}>No eBay listings found for this title.</p>
        )}
      </div>

      {communityData.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontSize:11, color:gold, textTransform:"uppercase", letterSpacing:1.5, fontFamily:"'Cinzel', serif" }}>Community Reported</div>
            <span style={{ fontSize:10, color:"#444" }}>{communityData.length} sale{communityData.length !== 1 ? "s" : ""}</span>
          </div>
          {communityData.map((c,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:i%2===0?"#0f0f0f":"transparent", borderRadius:4, fontSize:12, marginBottom:2 }}>
              <div>
                <span style={{ color:"#e0d6c8", fontFamily:"'Cinzel', serif", fontSize:14 }}>${c.price.toLocaleString()}</span>
                {c.condition && <span style={{ color:"#555", marginLeft:8, fontSize:10 }}>{c.condition}</span>}
                {c.edition && <span style={{ color:"#444", marginLeft:6, fontSize:10 }}>\u00b7 {c.edition}</span>}
                {c.publisher && <span style={{ color:"#444", marginLeft:6, fontSize:10 }}>\u00b7 {c.publisher}</span>}
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:gold, fontSize:10 }}>{c.user}</div>
                <div style={{ color:"#444", fontSize:9 }}>{c.source} \u00b7 {c.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showReport ? (
        <div style={{ textAlign:"center", padding:"8px 0" }}>
          <p style={{ color:"#555", fontSize:12, marginBottom:8 }}>Have price data to share?</p>
          <button onClick={()=>setShowReport(true)} style={{ ...btnSmall, color:gold, borderColor:`${gold}40` }}>Report a Sale Price</button>
        </div>
      ) : (
        <QuickReportSale title={title} edition={edition} user={user} onDone={(reported)=>{
          setShowReport(false);
          if (reported) { dbGetPriceReports(title).then(r => setCommunityData(r)); }
        }} />
      )}
    </div>
  );
}
function QuickReportSale({ title, edition, onDone, user }) {
  const [price,setPrice]=useState(""); const [source,setSource]=useState("eBay"); const [condition,setCond]=useState("Fine"); const [notes,setNotes]=useState(""); const [submitted,setSubmitted]=useState(false); const [saving,setSaving]=useState(false);

  if (submitted) return (
    <div style={{ background:"#0f0f0f", borderRadius:8, padding:16, textAlign:"center", border:`1px solid ${borderClr}` }}>
      <div style={{ color:"#6a6", fontSize:14, marginBottom:4 }}>Price reported. Thank you!</div>
      <p style={{ color:"#555", fontSize:11 }}>Your data helps the community get accurate valuations.</p>
    </div>
  );

  const handleSubmit = async () => {
    if (!price) return;
    setSaving(true);
    const ok = await dbReportSale(user?.id, { title, edition, price, source, condition, notes });
    setSaving(false);
    if (ok) { setSubmitted(true); setTimeout(() => onDone(true), 2000); }
  };

  return (
    <div style={{ background:"#0f0f0f", borderRadius:8, padding:16, border:`1px solid ${borderClr}` }}>
      <div style={{ fontSize:11, color:gold, textTransform:"uppercase", letterSpacing:1.5, fontFamily:"'Cinzel', serif", marginBottom:10 }}>Report a Sale</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div><label style={labelBase}>Price ($) *</label><input style={{ ...inputBase, fontSize:13, padding:"8px 10px" }} type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00" /></div>
        <div><label style={labelBase}>Source</label><select style={{ ...selectBase, fontSize:12, padding:"8px" }} value={source} onChange={e=>setSource(e.target.value)}><option>eBay</option><option>AbeBooks</option><option>Private Sale</option><option>Facebook Group</option><option>Forum</option><option>Other</option></select></div>
        <div><label style={labelBase}>Condition</label><select style={{ ...selectBase, fontSize:12, padding:"8px" }} value={condition} onChange={e=>setCond(e.target.value)}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div><label style={labelBase}>Notes</label><input style={{ ...inputBase, fontSize:12, padding:"8px 10px" }} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional" /></div>
      </div>
      <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"flex-end" }}>
        <button onClick={()=>onDone(false)} style={{ ...btnSmall, fontSize:10 }}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, padding:"6px 16px", fontSize:10, opacity:(price&&!saving)?1:0.4 }}>{saving?"Saving...":"Submit"}</button>
      </div>
    </div>
  );
}

function DetailView({ book, onEdit, onDelete, onClose, onUpdateCover, user }) {
  const g=book.currentValue&&book.purchasePrice?Number(book.currentValue)-Number(book.purchasePrice):null;
  const roi=g!==null&&book.purchasePrice?((g/Number(book.purchasePrice))*100).toFixed(0):null;
  const [showPriceCheck, setShowPriceCheck] = useState(false);
  const [showCoverEdit, setShowCoverEdit] = useState(false);
  const [coverOptions, setCoverOptions] = useState([]);
  const [searchingCover, setSearchingCover] = useState(false);
  const [coverUrl, setCoverUrl] = useState(book.coverUrl || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const searchCover = async () => {
    setSearchingCover(true);
    setCoverOptions([]);
    try {
      const titleQ = encodeURIComponent(book.title.trim());
      const authorQ = book.author.trim() ? "&author=" + encodeURIComponent(book.author.trim()) : "";
      const resp = await fetch(`https://openlibrary.org/search.json?title=${titleQ}${authorQ}&limit=12&fields=key,title,author_name,cover_i`);
      const json = await resp.json();
      const covers = (json.docs || []).filter(d => d.cover_i).map(d => ({
        id: d.cover_i,
        url: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
        thumb: `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`,
      }));
      const seen = new Set();
      setCoverOptions(covers.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));
    } catch (e) { console.log("Cover search failed"); }
    setSearchingCover(false);
  };

  const saveCover = async (url) => {
    setCoverUrl(url);
    if (onUpdateCover) await onUpdateCover(book.id, url);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.onload = () => {
        const maxW = 600, maxH = 900;
        let w = img.width, h = img.height;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        if (h > maxH) { w = (maxH / h) * w; h = maxH; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        saveCover(dataUrl);
        setUploading(false);
      };
      img.onerror = () => { setUploading(false); };
      img.src = URL.createObjectURL(file);
    } catch (err) { setUploading(false); }
  };

  return (<div>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
      <div style={{ display:"flex", gap:14, flex:1 }}>
        {/* Cover Image - tap to change */}
        <div onClick={()=>setShowCoverEdit(!showCoverEdit)} style={{ width:80, height:110, borderRadius:4, border:`1px solid ${borderClr}`, background:"#111", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", cursor:"pointer", position:"relative" }}>
          {coverUrl ? (
            <img src={coverUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          ) : (
            <span style={{ fontSize:9, color:"#333" }}>NO COVER</span>
          )}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.7)", padding:"2px 0", textAlign:"center" }}>
            <span style={{ fontSize:8, color:gold, fontFamily:"'Cinzel', serif" }}>{coverUrl ? "CHANGE" : "ADD"}</span>
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily:"'Cinzel', serif", color:"#e0d6c8", margin:0, fontSize:20 }}>{book.title}</h2>
          <p style={{ color:"#666", margin:"4px 0 0", fontStyle:"italic", fontSize:14 }}>by {book.author}</p>
        </div>
      </div>
      <button onClick={onClose} style={{ background:"none", border:"none", color:"#444", fontSize:18, cursor:"pointer", alignSelf:"flex-start" }}>X</button>
    </div>

    {/* Quick Cover Editor */}
    {showCoverEdit && (
      <div style={{ background:"#0f0f0f", borderRadius:8, padding:14, marginBottom:14, border:`1px solid ${borderClr}` }}>
        <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
          <button onClick={()=>fileInputRef.current?.click()} disabled={uploading} style={{ ...btnSmall, color:gold, borderColor:`${gold}40`, fontSize:10, padding:"6px 10px" }}>
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
          <button onClick={searchCover} disabled={searchingCover} style={{ ...btnSmall, color:gold, borderColor:`${gold}40`, fontSize:10, padding:"6px 10px" }}>
            {searchingCover ? "Searching..." : "Find Cover"}
          </button>
          {coverUrl && <button onClick={()=>saveCover("")} style={{ ...btnSmall, color:"#666", fontSize:10, padding:"6px 10px" }}>Remove</button>}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFileUpload} />
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input style={{ ...inputBase, flex:1, fontSize:11, padding:"8px 10px" }} placeholder="Or paste image URL..." value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} />
          <button onClick={()=>saveCover(coverUrl)} style={{ ...btnSmall, color:gold, borderColor:`${gold}40`, fontSize:10, padding:"6px 10px", whiteSpace:"nowrap" }}>Save</button>
        </div>
        {coverOptions.length > 0 && (
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginTop:10 }}>
            {coverOptions.map((c, i) => (
              <div key={i} onClick={()=>saveCover(c.url)} style={{
                width:50, height:70, borderRadius:3, overflow:"hidden", cursor:"pointer", flexShrink:0,
                border: coverUrl === c.url ? `2px solid ${gold}` : "1px solid #333",
              }}>
                <img src={c.thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>{[["Publisher",book.publisher],["Edition",book.editionType],["Limitation",book.limitation],["Condition",book.condition],["Added",book.dateAdded]].map(([l,v])=>v?<div key={l}><div style={labelBase}>{l}</div><div style={{ color:"#e0d6c8", fontSize:13 }}>{v}</div></div>:null)}</div>
    {(book.purchasePrice||book.currentValue)&&<div style={{ background:"#111", borderRadius:8, padding:14, marginBottom:14, border:`1px solid ${borderClr}` }}><div style={labelBase}>Financials</div><div style={{ display:"flex", gap:20, marginTop:6, flexWrap:"wrap" }}>{book.purchasePrice&&<div><div style={{ color:"#444", fontSize:9 }}>Paid</div><div style={{ color:"#ccc", fontSize:18, fontFamily:"'Cinzel', serif" }}>${Number(book.purchasePrice).toLocaleString()}</div></div>}{book.currentValue&&<div><div style={{ color:"#444", fontSize:9 }}>Value</div><div style={{ color:gold, fontSize:18, fontFamily:"'Cinzel', serif" }}>${Number(book.currentValue).toLocaleString()}</div></div>}{g!==null&&<div><div style={{ color:"#444", fontSize:9 }}>Gain</div><div style={{ color:g>=0?"#6a6":"#c66", fontSize:18, fontFamily:"'Cinzel', serif" }}>{g>=0?"+":""}${g.toLocaleString()} {roi&&<span style={{ fontSize:11, opacity:0.6 }}>({roi}%)</span>}</div></div>}</div></div>}

    {/* Price Check */}
    {!showPriceCheck ? (
      <button onClick={()=>setShowPriceCheck(true)} style={{ ...btnPrimary, width:"100%", padding:"12px", fontSize:12, marginBottom:14, background:`linear-gradient(135deg, #1a1510, #111)`, color:gold, border:`1px solid ${gold}30` }}>
        Price Check — See Market Data
      </button>
    ) : (
      <div style={{ marginBottom:14, border:`1px solid ${borderClr}`, borderRadius:10, padding:16, background:"#0a0a0a" }}>
        <PriceCheckPanel title={book.title} edition={book.editionType} publisher={book.publisher} onClose={()=>setShowPriceCheck(false)} user={user} />
      </div>
    )}

    {book.notes&&<div style={{ marginBottom:14 }}><div style={labelBase}>Notes</div><p style={{ color:"#999", fontSize:13, lineHeight:1.5, margin:"4px 0 0" }}>{book.notes}</p></div>}
    <div style={{ display:"flex", gap:12, justifyContent:"flex-end", borderTop:`1px solid ${borderClr}`, paddingTop:12 }}><button onClick={onDelete} style={btnDanger}>Delete</button><button onClick={onEdit} style={{ ...btnPrimary, padding:"10px 20px", fontSize:12 }}>Edit</button></div>
  </div>);
}

/* ═══════════════════════════════════════════
   MARKET PAGE
   ═══════════════════════════════════════════ */
function MarketPage({ setModal, t, user }) {
  const [priceSearch, setPriceSearch] = useState("");
  const [priceCheckBook, setPriceCheckBook] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => { dbGetRecentPriceReports(10).then(setRecentSales); }, []);

  const doSearch = (q) => {
    setPriceSearch(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    const ql = q.toLowerCase();
    setSearchResults(BOOK_DB.filter(b => b.title.toLowerCase().includes(ql) || b.author.toLowerCase().includes(ql)).slice(0, 8));
  };

  return (<div style={{ padding:"24px 20px 100px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
      <div><h2 style={{ fontFamily:"'Cinzel', serif", fontSize:22, color:"#e0d6c8", margin:0 }}>The Market</h2><p style={{ color:"#555", fontSize:12, margin:"2px 0 0", fontStyle:"italic" }}>Sales, prices, and trends</p></div>
      <button onClick={()=>setModal({type:"report"})} style={{ ...btnPrimary, padding:"8px 14px", fontSize:10 }}>Report Sale</button>
    </div>

    {/* Price Check Search */}
    <div style={{ background:cardBg, border:`1px solid ${gold}20`, borderRadius:10, padding:"16px 18px", marginBottom:20 }}>
      <div style={{ fontSize:11, color:gold, textTransform:"uppercase", letterSpacing:1.5, fontFamily:"'Cinzel', serif", marginBottom:8 }}>Price Check</div>
      <p style={{ color:"#666", fontSize:12, margin:"0 0 10px" }}>Look up any book's estimated market value</p>
      <input style={{ ...inputBase, fontSize:14, padding:"10px 14px" }} placeholder="Search title or author..." value={priceSearch} onChange={e=>doSearch(e.target.value)} />

      {searchResults.length > 0 && !priceCheckBook && (
        <div style={{ marginTop:8, maxHeight:200, overflowY:"auto", borderRadius:6, border:`1px solid ${borderClr}` }}>
          {searchResults.map((r,i)=>(
            <div key={i} onClick={()=>{setPriceCheckBook(r);setSearchResults([]);setPriceSearch("");}} style={{ padding:"10px 12px", cursor:"pointer", borderBottom:`1px solid ${borderClr}` }} onMouseEnter={e=>{e.currentTarget.style.background="#1a1a1a";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              <div style={{ fontFamily:"'Cinzel', serif", fontSize:13, color:"#e0d6c8" }}>{r.title}</div>
              <div style={{ fontSize:11, color:"#555", fontStyle:"italic" }}>{r.author} {r.year && `(${r.year})`}</div>
            </div>
          ))}
        </div>
      )}
    </div>

    {priceCheckBook && (
      <div style={{ marginBottom:20, border:`1px solid ${borderClr}`, borderRadius:10, padding:16, background:"#0a0a0a" }}>
        <PriceCheckPanel title={priceCheckBook.title} edition="" onClose={()=>setPriceCheckBook(null)} user={user} />
      </div>
    )}

    {/* Recent Sales - real data */}
    <SH title="Recent Sales" sub="Community reported transactions" />
    {recentSales.length > 0 ? recentSales.map((m,i)=>(<div key={i} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div><div style={{ fontFamily:"'Cinzel', serif", fontSize:14, color:"#e0d6c8" }}>{m.title}</div><div style={{ fontSize:11, color:"#555", marginTop:2 }}>{m.publisher}{m.edition ? ` · ${m.edition}` : ""}</div></div>
        <div style={{ textAlign:"right" }}><div style={{ fontFamily:"'Cinzel', serif", fontSize:20, color:gold }}>${m.price.toLocaleString()}</div></div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, paddingTop:8, borderTop:`1px solid ${borderClr}`, fontSize:10, color:"#444" }}><span>{m.source}</span><span>{m.user} · {m.date}</span></div>
    </div>))
    : <div style={{ textAlign:"center", padding:"32px 0" }}>
        <p style={{ color:"#555", fontSize:14, marginBottom:8 }}>No sales reported yet.</p>
        <p style={{ color:"#444", fontSize:12, marginBottom:16 }}>Be the first to contribute pricing data.</p>
        <button onClick={()=>setModal({type:"report"})} style={{ ...btnPrimary, padding:"10px 20px", fontSize:12 }}>Report a Sale</button>
      </div>}
  </div>);
}

function ReportSaleModal({ onClose, user }) {
  const [f,setF]=useState({title:"",publisher:"",edition:"",price:"",source:"eBay",condition:"Fine",notes:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  const handleSubmit = async () => {
    if (!f.title.trim() || !f.price) return;
    setSaving(true);
    const ok = await dbReportSale(user?.id, f);
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(onClose, 1500); }
  };

  if (saved) return (<div style={{ textAlign:"center", padding:"32px 0" }}><div style={{ color:"#6a6", fontSize:16, marginBottom:8 }}>Sale reported!</div><p style={{ color:"#555", fontSize:13 }}>Thank you for contributing to the community.</p></div>);

  return (<div>
    <h2 style={{ fontFamily:"'Cinzel', serif", color:gold, margin:"0 0 16px", fontSize:18 }}>Report a Sale</h2>
    <p style={{ color:"#666", fontSize:12, margin:"0 0 14px" }}>Help build the pricing database. Report sales you've seen or made.</p>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
      <div style={{ gridColumn:"1/-1" }}><label style={labelBase}>Book Title *</label><input style={inputBase} value={f.title} onChange={e=>s("title",e.target.value)} placeholder="e.g. The Stand" /></div>
      <div><label style={labelBase}>Publisher</label><input style={inputBase} value={f.publisher} onChange={e=>s("publisher",e.target.value)} placeholder="e.g. Cemetery Dance" /></div>
      <div><label style={labelBase}>Edition</label><input style={inputBase} value={f.edition} onChange={e=>s("edition",e.target.value)} placeholder="e.g. Lettered" /></div>
      <div><label style={labelBase}>Sale Price ($) *</label><input style={inputBase} type="number" value={f.price} onChange={e=>s("price",e.target.value)} /></div>
      <div><label style={labelBase}>Source</label><select style={selectBase} value={f.source} onChange={e=>s("source",e.target.value)}><option>eBay</option><option>AbeBooks</option><option>Private Sale</option><option>Facebook Group</option><option>Forum</option><option>Other</option></select></div>
      <div><label style={labelBase}>Condition</label><select style={selectBase} value={f.condition} onChange={e=>s("condition",e.target.value)}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></div>
      <div style={{ gridColumn:"1/-1" }}><label style={labelBase}>Notes</label><input style={inputBase} value={f.notes} onChange={e=>s("notes",e.target.value)} placeholder="Details..." /></div>
    </div>
    <div style={{ display:"flex", gap:12, marginTop:16, justifyContent:"flex-end" }}><button onClick={onClose} style={btnGhost}>Cancel</button><button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, padding:"10px 20px", fontSize:12, opacity:(f.title.trim()&&f.price&&!saving)?1:0.4 }}>{saving?"Saving...":"Submit"}</button></div>
  </div>);
}

/* ═══════════════════════════════════════════
   DISCOVER PAGE
   ═══════════════════════════════════════════ */
function DiscoverPage({ onViewProfile }) {
  const [communityFeed, setCommunityFeed] = useState([]);

  useEffect(() => { dbGetCommunityActivity(8).then(setCommunityFeed); }, []);

  return (<div style={{ padding:"24px 20px 100px" }}>
    <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:22, color:"#e0d6c8", margin:"0 0 4px" }}>Discover</h2>
    <p style={{ color:"#555", fontSize:12, margin:"0 0 20px", fontStyle:"italic" }}>Releases and community</p>

    <SH title="New Releases" />
    {NEW_RELEASES.map(r=>(<div key={r.id} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:10, padding:"14px 16px", marginBottom:8 }}><div style={{ display:"flex", justifyContent:"space-between" }}><div><div style={{ fontFamily:"'Cinzel', serif", fontSize:14, color:"#e0d6c8" }}>{r.title}</div><div style={{ fontSize:12, color:"#555", fontStyle:"italic" }}>{r.author} · {r.publisher}</div><div style={{ fontSize:11, color:"#444", marginTop:4 }}>{r.editions}</div></div><span style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:r.status==="Available"?"rgba(100,170,100,0.12)":r.status==="Sold Out"?"rgba(200,100,100,0.12)":`${gold}12`, color:r.status==="Available"?"#6a6":r.status==="Sold Out"?"#c66":gold, fontFamily:"'Cinzel', serif", alignSelf:"flex-start" }}>{r.status}</span></div></div>))}

    {/* Collectors - coming soon */}
    <div style={{ marginTop:28 }}>
      <SH title="Collectors" sub="Browse other collectors' shelves" />
      <div style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:10, padding:"24px 20px", textAlign:"center" }}>
        <div style={{ fontSize:24, marginBottom:8, opacity:0.3 }}>&#9734;</div>
        <p style={{ color:"#666", fontSize:14, margin:"0 0 4px" }}>Public profiles coming soon</p>
        <p style={{ color:"#444", fontSize:12, margin:0 }}>Once collectors start sharing their shelves, you'll find them here.</p>
      </div>
    </div>

    <div style={{ marginTop:28 }}><SH title="Recent Activity" /></div>
    {communityFeed.length > 0 ? communityFeed.map((a,i)=>(<div key={i} style={{ padding:"8px 0", borderBottom:`1px solid ${borderClr}`, fontSize:12 }}><span style={{ color:gold, fontFamily:"'Cinzel', serif" }}>{a.user}</span> <span style={{ color:"#444" }}>added</span> <span style={{ color:"#e0d6c8" }}>{a.title}</span><div style={{ fontSize:10, color:"#333" }}>{a.detail} · {a.time}</div></div>))
    : <p style={{ color:"#444", fontSize:12, fontStyle:"italic", padding:"8px 0" }}>No community activity yet.</p>}
  </div>);
}

/* ═══════════════════════════════════════════
   PUBLIC PROFILE VIEWER
   ═══════════════════════════════════════════ */
function PublicProfileView({ collector, onBack }) {
  return (<div style={{ padding:"24px 20px 100px" }}>
    <button onClick={onBack} style={{ ...btnSmall, marginBottom:16, color:"#555" }}>Back</button>
    <div style={{ textAlign:"center", marginBottom:24 }}>
      <div style={{ width:70, height:70, borderRadius:"50%", background:`${gold}15`, border:`2px solid ${gold}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", fontSize:24, color:gold, fontFamily:"'Cinzel', serif" }}>{collector.name[0]}</div>
      <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:22, color:"#e0d6c8", margin:"0 0 6px" }}>{collector.name}</h2>
      <TierBadge tier={collector.tier} />
      <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:16 }}>
        <div style={{ textAlign:"center" }}><div style={{ fontSize:9, color:"#444", textTransform:"uppercase", letterSpacing:1.5, fontFamily:"'Cinzel', serif" }}>Books</div><div style={{ fontSize:20, fontFamily:"'Cinzel', serif", color:"#e0d6c8" }}>{collector.books}</div></div>
        <div style={{ textAlign:"center" }}><div style={{ fontSize:9, color:"#444", textTransform:"uppercase", letterSpacing:1.5, fontFamily:"'Cinzel', serif" }}>Value</div><div style={{ fontSize:20, fontFamily:"'Cinzel', serif", color:gold }}>${collector.value.toLocaleString()}</div></div>
      </div>
    </div>
    <SH title="Showcase" sub="Top pieces in this collection" />
    {collector.topBooks.map((b,i)=>(<div key={i} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:8, padding:"12px 14px", marginBottom:8 }}><div style={{ fontFamily:"'Cinzel', serif", fontSize:14, color:"#e0d6c8" }}>{b}</div></div>))}
  </div>);
}

/* ═══════════════════════════════════════════
   PROFILE / STATS PAGE
   ═══════════════════════════════════════════ */
function ContactModal({ type, onClose, user }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [topic, setTopic] = useState(type === "feedback" ? "Feature Request" : "General");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (sent) return (
    <Modal onClose={onClose}>
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>&#10003;</div>
        <h3 style={{ fontFamily: "'Cinzel', serif", color: gold, margin: "0 0 8px", fontSize: 20 }}>Message Sent</h3>
        <p style={{ color: "#888", fontSize: 14, margin: "0 0 24px" }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
        <button onClick={onClose} style={{ ...btnPrimary, padding: "10px 28px", fontSize: 12 }}>Done</button>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontFamily: "'Cinzel', serif", color: gold, margin: "0 0 6px", fontSize: 20 }}>{type === "feedback" ? "Send Feedback" : "Contact Us"}</h2>
      <p style={{ color: "#666", fontSize: 13, margin: "0 0 20px" }}>{type === "feedback" ? "Help us make ShelfLife better. Feature ideas, bug reports, and suggestions welcome." : "Questions, partnership inquiries, or just want to talk books? We'd love to hear from you."}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelBase}>Name</label>
          <input style={inputBase} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label style={labelBase}>Email *</label>
          <input style={inputBase} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelBase}>Topic</label>
          <select style={selectBase} value={topic} onChange={e => setTopic(e.target.value)}>
            {type === "feedback" ? (
              <>
                <option>Feature Request</option>
                <option>Bug Report</option>
                <option>UI / Design</option>
                <option>Book Database</option>
                <option>Pricing / Plans</option>
                <option>Other</option>
              </>
            ) : (
              <>
                <option>General</option>
                <option>Account Help</option>
                <option>Publisher Partnership</option>
                <option>Press / Media</option>
                <option>Bug Report</option>
                <option>Other</option>
              </>
            )}
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelBase}>Message *</label>
          <textarea style={{ ...inputBase, minHeight: 100, resize: "vertical" }} value={message} onChange={e => setMessage(e.target.value)} placeholder={type === "feedback" ? "Tell us what you'd like to see..." : "How can we help?"} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnGhost}>Cancel</button>
        <button onClick={async () => { 
          if (email.trim() && message.trim()) {
            setSending(true);
            const ok = await dbSendContactMessage(user?.id, name, email, topic, message);
            setSending(false);
            if (ok) setSent(true);
          }
        }} disabled={sending} style={{ ...btnPrimary, padding: "10px 24px", fontSize: 12, opacity: (email.trim() && message.trim() && !sending) ? 1 : 0.4 }}>{sending ? "Sending..." : "Send Message"}</button>
      </div>
    </Modal>
  );
}

function SettingsToggle({ label, desc, value, onChange }) {
  return (
    <div onClick={()=>onChange(!value)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${borderClr}`, cursor:"pointer" }}>
      <div><div style={{ fontSize:13, color:"#e0d6c8" }}>{label}</div>{desc&&<div style={{ fontSize:11, color:"#555", marginTop:2 }}>{desc}</div>}</div>
      <div style={{ width:40, height:22, borderRadius:11, background:value?gold+"40":"#222", padding:2, transition:"background 0.2s", display:"flex", alignItems:  "center" }}>
        <div style={{ width:18, height:18, borderRadius:"50%", background:value?gold:"#555", transition:"transform 0.2s, background 0.2s", transform:value?"translateX(18px)":"translateX(0)" }} />
      </div>
    </div>
  );
}

function SettingsRow({ label, value, onClick }) {
  return (
    <div onClick={onClick} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${borderClr}`, cursor:onClick?"pointer":"default" }}>
      <div style={{ fontSize:13, color:"#e0d6c8" }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:12, color:"#555" }}>{value}</span>{onClick&&<span style={{ color:"#333", fontSize:12 }}>›</span>}</div>
    </div>
  );
}

function ProfilePage({ books, wishlist, setPage, onLogout, darkMode, setDarkMode, t, user, profile, setProfile }) {
  const tv=books.reduce((s,b)=>s+(Number(b.currentValue)||0),0); const tp=books.reduce((s,b)=>s+(Number(b.purchasePrice)||0),0);
  const pubC={}; books.forEach(b=>{if(b.publisher)pubC[b.publisher]=(pubC[b.publisher]||0)+1;}); const topP=Object.entries(pubC).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const edC={}; books.forEach(b=>{if(b.editionType)edC[b.editionType]=(edC[b.editionType]||0)+1;}); const topE=Object.entries(edC).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const tier=books.length>=100?"Obsidian":books.length>=50?"Gold":books.length>=20?"Silver":"Bronze";
  const [showSettings, setShowSettings] = useState(false);
  const [showContact, setShowContact] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.display_name || "");

  // Settings state from profile
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const [showValue, setShowValue] = useState(profile?.show_value ?? false);
  const [newReleaseAlerts, setNewReleaseAlerts] = useState(profile?.notify_new_releases ?? true);
  const [priceAlerts, setPriceAlerts] = useState(profile?.notify_price_alerts ?? true);
  const [wishlistAlerts, setWishlistAlerts] = useState(profile?.notify_wishlist ?? true);

  const saveToggle = async (field, value) => {
    if (user) await dbUpdateProfile(user.id, { [field]: value });
  };

  const handleSaveName = async () => {
    if (!newName.trim() || !user) return;
    await supabase.auth.updateUser({ data: { display_name: newName.trim() } });
    await dbUpdateProfile(user.id, { display_name: newName.trim() });
    setEditingName(false);
  };

  if (showSettings) return (<div style={{ padding:"24px 20px 100px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
      <button onClick={()=>setShowSettings(false)} style={{ ...btnSmall, padding:"4px 10px", color:"#555" }}>Back</button>
      <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:22, color:"#e0d6c8", margin:0 }}>Settings</h2>
    </div>

    <SH title="Account" />
    {editingName ? (
      <div style={{ padding:"12px 0", borderBottom:`1px solid ${borderClr}`, display:"flex", gap:8, alignItems:"center" }}>
        <input style={{ ...inputBase, flex:1, fontSize:13, padding:"8px 10px" }} value={newName} onChange={e=>setNewName(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter")handleSaveName();}} />
        <button onClick={handleSaveName} style={{ ...btnSmall, color:gold, borderColor:`${gold}40`, fontSize:10 }}>Save</button>
        <button onClick={()=>setEditingName(false)} style={{ ...btnSmall, fontSize:10 }}>Cancel</button>
      </div>
    ) : (
      <SettingsRow label="Display Name" value={user?.user_metadata?.display_name || "ShelfLife Member"} onClick={()=>{setNewName(user?.user_metadata?.display_name||"");setEditingName(true);}} />
    )}
    <SettingsRow label="Email" value={user?.email || ""} />
    <SettingsRow label="Password" value="••••••••" onClick={()=>alert("Use 'Forgot Password' from the login screen to change your password.")} />
    <SettingsRow label="Plan" value="Free" />

    <div style={{ marginTop:24 }}><SH title="Privacy" /></div>
    <SettingsToggle label="Public Profile" desc="Let other collectors browse your shelf" value={isPublic} onChange={v=>{setIsPublic(v);saveToggle("is_public",v);}} />
    <SettingsToggle label="Show Collection Value" desc="Display total value on your public profile" value={showValue} onChange={v=>{setShowValue(v);saveToggle("show_value",v);}} />

    <div style={{ marginTop:24 }}><SH title="Notifications" /></div>
    <SettingsToggle label="New Release Alerts" desc="When publishers you follow announce books" value={newReleaseAlerts} onChange={v=>{setNewReleaseAlerts(v);saveToggle("notify_new_releases",v);}} />
    <SettingsToggle label="Price Alerts" desc="When books you track change in value" value={priceAlerts} onChange={v=>{setPriceAlerts(v);saveToggle("notify_price_alerts",v);}} />
    <SettingsToggle label="Wishlist Alerts" desc="When a book on your hunting list surfaces" value={wishlistAlerts} onChange={v=>{setWishlistAlerts(v);saveToggle("notify_wishlist",v);}} />

    <div style={{ marginTop:24 }}><SH title="Appearance" /></div>
    <SettingsToggle label="Dark Mode" desc={darkMode ? "The collector's preferred aesthetic" : "Light mode active"} value={darkMode} onChange={setDarkMode} />

    <div style={{ marginTop:24 }}><SH title="Data" /></div>
    <SettingsRow label="Export Collection" value="Coming Soon" />
    <SettingsRow label="Import Collection" value="Coming Soon" />

    <div style={{ marginTop:24 }}><SH title="About" /></div>
    <SettingsRow label="Version" value="1.0.0 Beta" />
    <SettingsRow label="Terms of Service" value="Coming Soon" />
    <SettingsRow label="Privacy Policy" value="Coming Soon" />
    <SettingsRow label="Send Feedback" value="" onClick={()=>setShowContact("feedback")} />
    <SettingsRow label="Contact Us" value="" onClick={()=>setShowContact("contact")} />

    <button onClick={onLogout} style={{ ...btnGhost, width:"100%", marginTop:32, borderColor:"#533", color:"#966" }}>Sign Out</button>
    <button style={{ ...btnGhost, width:"100%", marginTop:12, borderColor:"#422", color:"#844", fontSize:11 }} onClick={()=>alert("To delete your account, please contact support@myshelflife.app")}>Delete Account</button>

    {showContact && <ContactModal type={showContact} onClose={()=>setShowContact(null)} user={user} />}
  </div>);

  return (<div style={{ padding:"24px 20px 100px" }}>
    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
      <button onClick={()=>setShowSettings(true)} style={{ ...btnSmall, fontSize:10, padding:"5px 12px", color:"#666" }}>Settings</button>
    </div>
    <div style={{ textAlign:"center", marginBottom:28 }}>
      <div style={{ width:70, height:70, borderRadius:"50%", background:`${gold}15`, border:`2px solid ${gold}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", fontSize:24, color:gold }}>{(user?.user_metadata?.display_name || user?.email || "S")[0].toUpperCase()}</div>
      <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:22, color:"#e0d6c8", margin:"0 0 6px" }}>{user?.user_metadata?.display_name || "ShelfLife Member"}</h2>
      <TierBadge tier={tier} />
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:24 }}>
      {[["Books",books.length],["Value","$"+tv.toLocaleString()],["Wishlist",wishlist.length]].map(([l,v])=>(<div key={l} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:8, padding:"10px", textAlign:"center" }}><div style={{ fontSize:8, color:"#444", textTransform:"uppercase", letterSpacing:1.5, fontFamily:"'Cinzel', serif" }}>{l}</div><div style={{ fontSize:16, fontFamily:"'Cinzel', serif", color:gold, marginTop:4 }}>{v}</div></div>))}
    </div>

    {/* Wishlist Quick View */}
    <SH title="Wishlist" sub={`${wishlist.length} books`} action={<button onClick={()=>setPage("wishlist")} style={{ ...btnSmall, fontSize:9, padding:"4px 8px" }}>Manage</button>} />
    {wishlist.length===0?<p style={{ color:"#444", fontSize:12, marginBottom:20, fontStyle:"italic" }}>No wishlist items yet. Add books you're hunting for.</p>:wishlist.slice(0,3).map((w,i)=>(<div key={i} style={{ padding:"8px 0", borderBottom:`1px solid ${borderClr}`, fontSize:12, color:"#e0d6c8" }}>{w.title} <span style={{ color:"#555" }}>· {w.edition||"Any edition"}</span></div>))}

    <div style={{ marginTop:24 }}><SH title="By Publisher" /></div>
    {topP.length > 0 ? topP.map(([p,c])=>(<div key={p} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:`1px solid ${borderClr}` }}><div style={{ flex:1 }}><div style={{ fontSize:12, color:"#e0d6c8" }}>{p}</div><div style={{ height:4, borderRadius:2, background:"#1a1a1a", marginTop:3 }}><div style={{ height:"100%", borderRadius:2, background:`linear-gradient(90deg, ${gold}, ${goldDark})`, width:`${(c/books.length)*100}%` }} /></div></div><span style={{ color:gold, fontSize:13, fontFamily:"'Cinzel', serif", minWidth:20, textAlign:"right" }}>{c}</span></div>))
    : <p style={{ color:"#444", fontSize:12, fontStyle:"italic", padding:"8px 0" }}>Add books with publishers to see your breakdown.</p>}

    <div style={{ marginTop:24 }}><SH title="By Edition Type" /></div>
    {topE.length > 0 ? topE.map(([e,c])=>(<div key={e} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:`1px solid ${borderClr}` }}><div style={{ flex:1 }}><div style={{ fontSize:12, color:"#e0d6c8" }}>{e}</div><div style={{ height:4, borderRadius:2, background:"#1a1a1a", marginTop:3 }}><div style={{ height:"100%", borderRadius:2, background:"linear-gradient(90deg, #6a6, #484)", width:`${(c/books.length)*100}%` }} /></div></div><span style={{ color:"#6a6", fontSize:13, fontFamily:"'Cinzel', serif", minWidth:20, textAlign:"right" }}>{c}</span></div>))
    : <p style={{ color:"#444", fontSize:12, fontStyle:"italic", padding:"8px 0" }}>Add books with edition types to see your breakdown.</p>}

    <button onClick={onLogout} style={{ ...btnGhost, width:"100%", marginTop:32, borderColor:"#222", color:"#555" }}>Sign Out</button>
  </div>);
}

/* ═══════════════════════════════════════════
   WISHLIST PAGE
   ═══════════════════════════════════════════ */
function WishlistPage({ wishlist, setWishlist, setPage, t, user }) {
  const [showAdd,setShowAdd]=useState(false); const [f,setF]=useState({title:"",author:"",edition:"",maxPrice:"",notes:""});
  const [saving,setSaving]=useState(false);

  const addItem = async () => {
    if (!f.title.trim() || !user) return;
    setSaving(true);
    const saved = await dbAddWishlistItem(user.id, f);
    if (saved) setWishlist(p => [saved, ...p]);
    setF({title:"",author:"",edition:"",maxPrice:"",notes:""});
    setShowAdd(false);
    setSaving(false);
  };

  const removeItem = async (id) => {
    const ok = await dbDeleteWishlistItem(id);
    if (ok) setWishlist(p => p.filter(x => x.id !== id));
  };
  return (<div style={{ padding:"24px 20px 100px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
      <button onClick={()=>setPage("profile")} style={{ ...btnSmall, padding:"4px 10px", color:"#555" }}>Back</button>
      <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:22, color:"#e0d6c8", margin:0, flex:1 }}>Hunting List</h2>
      <button onClick={()=>setShowAdd(true)} style={{ ...btnPrimary, padding:"8px 14px", fontSize:10 }}>+ Add</button>
    </div>
    <p style={{ color:"#555", fontSize:12, fontStyle:"italic", marginBottom:16 }}>Books you're searching for. Get notified when they appear.</p>

    {wishlist.length===0&&<div style={{ textAlign:"center", padding:"40px 20px", color:"#444" }}><p style={{ fontSize:14, marginBottom:12 }}>Your hunting list is empty.</p><p style={{ fontSize:12 }}>Add books you're looking for and we'll alert you when they surface.</p></div>}
    {wishlist.map(w=>(<div key={w.id} style={{ background:cardBg, border:`1px solid ${borderClr}`, borderRadius:8, padding:"14px 16px", marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div><div style={{ fontFamily:"'Cinzel', serif", fontSize:14, color:"#e0d6c8" }}>{w.title}</div>{w.author&&<div style={{ fontSize:12, color:"#555", fontStyle:"italic" }}>{w.author}</div>}{w.edition&&<div style={{ fontSize:11, color:gold, marginTop:2 }}>Looking for: {w.edition}</div>}{w.maxPrice&&<div style={{ fontSize:11, color:"#666", marginTop:2 }}>Max budget: ${w.maxPrice}</div>}{w.notes&&<div style={{ fontSize:11, color:"#444", marginTop:4 }}>{w.notes}</div>}</div>
        <button onClick={()=>removeItem(w.id)} style={{ background:"none", border:"none", color:"#533", fontSize:14, cursor:"pointer" }}>X</button>
      </div>
    </div>))}

    {showAdd&&<Modal onClose={()=>setShowAdd(false)}>
      <h2 style={{ fontFamily:"'Cinzel', serif", color:gold, margin:"0 0 16px", fontSize:18 }}>Add to Hunting List</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div style={{ gridColumn:"1/-1" }}><label style={labelBase}>Book Title *</label><input style={inputBase} value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="e.g. The Stand Coffin Edition" /></div>
        <div><label style={labelBase}>Author</label><input style={inputBase} value={f.author} onChange={e=>setF(p=>({...p,author:e.target.value}))} /></div>
        <div><label style={labelBase}>Edition Wanted</label><input style={inputBase} value={f.edition} onChange={e=>setF(p=>({...p,edition:e.target.value}))} placeholder="e.g. Lettered" /></div>
        <div><label style={labelBase}>Max Budget ($)</label><input style={inputBase} type="number" value={f.maxPrice} onChange={e=>setF(p=>({...p,maxPrice:e.target.value}))} /></div>
        <div><label style={labelBase}>Notes</label><input style={inputBase} value={f.notes} onChange={e=>setF(p=>({...p,notes:e.target.value}))} placeholder="Any details..." /></div>
      </div>
      <div style={{ display:"flex", gap:12, marginTop:16, justifyContent:"flex-end" }}><button onClick={()=>setShowAdd(false)} style={btnGhost}>Cancel</button><button onClick={addItem} disabled={saving} style={{ ...btnPrimary, padding:"10px 20px", fontSize:12, opacity:(f.title.trim()&&!saving)?1:0.4 }}>{saving?"Saving...":"Add to List"}</button></div>
    </Modal>}
  </div>);
}

/* ═══════════════════════════════════════════
   MAIN APP CONTROLLER
   ═══════════════════════════════════════════ */
function getTheme(dark) {
  if (dark) return {
    bg: "radial-gradient(ellipse at 15% -5%, #1a1510 0%, #0a0a0a 45%, #050505 100%)",
    cardBg: "#131313", borderClr: "#1c1c1c", text: "#e0d6c8", textSub: "#666",
    textMuted: "#444", inputBg: "#111", inputBorder: "#2a2a2a",
    navBg: "linear-gradient(180deg, rgba(10,10,10,0.96), rgba(5,5,5,1))",
    navBorder: "#1a1a1a", modalBg: "rgba(0,0,0,0.92)", modalCard: "#1a1a1a",
    modalCardEnd: "#131313", shelfPlank: "linear-gradient(180deg, #3a2a1a, #2a1a0a, #1a0f05)",
    plankBorder: "#4a3520", plankHighlight: "#5a4530",
  };
  return {
    bg: "linear-gradient(180deg, #f5f0e8 0%, #ebe5d9 50%, #e0d9cc 100%)",
    cardBg: "#ffffff", borderClr: "#d8d0c4", text: "#2a2318", textSub: "#7a7060",
    textMuted: "#a09888", inputBg: "#f8f5f0", inputBorder: "#d0c8b8",
    navBg: "linear-gradient(180deg, rgba(245,240,232,0.97), rgba(235,229,217,1))",
    navBorder: "#d8d0c4", modalBg: "rgba(0,0,0,0.4)", modalCard: "#f5f0e8",
    modalCardEnd: "#ffffff", shelfPlank: "linear-gradient(180deg, #c4a265, #a68940, #8a7030)",
    plankBorder: "#d4b978", plankHighlight: "#e0c888",
  };
}

export default function App() {
  const [appState, setAppState] = useState("loading"); // loading | public | auth | app | reset
  const [authMode, setAuthMode] = useState("login");
  const [page, setPage] = useState("home");
  const [books, setBooks] = useState([]);
  const [modal, setModal] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [viewingCollector, setViewingCollector] = useState(null);
  const [darkMode, setDarkMode] = useState(() => { try { const s = localStorage.getItem("shelflife-dark"); return s !== null ? s === "true" : true; } catch(e) { return true; } });
  const [user, setUser] = useState(null);
  const [booksLoading, setBooksLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [profile, setProfile] = useState(null);
  const t = getTheme(darkMode);

  // Persist dark mode
  useEffect(() => { try { localStorage.setItem("shelflife-dark", String(darkMode)); } catch(e){} }, [darkMode]);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null), 3000); };

  // Load user's books, wishlist, and profile from database
  const loadBooks = async (userId) => {
    setBooksLoading(true);
    const [userBooks, userWishlist, userProfile] = await Promise.all([
      dbLoadCollection(userId), dbLoadWishlist(userId), dbLoadProfile(userId),
    ]);
    setBooks(userBooks);
    setWishlist(userWishlist);
    if (userProfile) setProfile(userProfile);
    setBooksLoading(false);
  };

  // Check for existing session on load
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const checkSession = async () => {
      // Check if this is a password recovery redirect
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const isRecovery = hash.includes("type=recovery") || params.get("type") === "recovery";
      
      const { data: { session } } = await supabase.auth.getSession();
      if (isRecovery && session?.user) {
        setUser(session.user);
        setAppState("reset");
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
      if (session?.user) {
        setUser(session.user);
        setAppState("app");
        loadBooks(session.user.id);
      } else {
        setAppState("public");
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setUser(session?.user || null);
          setAppState("reset");
        } else if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          setAppState(prev => prev === "reset" ? "reset" : "app");
          if (appState !== "reset") {
            setPage("home");
            loadBooks(session.user.id);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setAppState("public");
          setPage("home");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAppState("public");
    setPage("home");
    setBooks([]);
    setWishlist([]);
  };

  // Loading screen while checking session
  if (appState === "loading") return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(ellipse at 50% 30%, #1a1510 0%, #0a0908 60%, #050505 100%)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      <div style={{ textAlign:"center" }}>
        <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:36, fontWeight:900, margin:"0 0 16px", background:`linear-gradient(135deg, ${gold}, #e8d5a8, ${gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:4 }}>SHELFLIFE</h1>
        <div style={{ width:28, height:28, border:`2px solid #333`, borderTopColor:gold, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  // Global style overrides based on theme
  const lm = !darkMode;
  const themeStyle = lm ? `
    .vault-app {
      --card-bg: #ffffff; --border-clr: #d0c8b8; --input-bg: #f0ece4;
      --text: #2a2318; --text-sub: #7a7060; --text-muted: #9a9080;
      background: linear-gradient(180deg, #f5f0e8, #ebe5d9, #e0d9cc) !important;
      color: #2a2318 !important;
    }
    .vault-app h1, .vault-app h2, .vault-app h3, .vault-app h4 {
      color: #2a2318 !important; -webkit-text-fill-color: #2a2318 !important;
      background: none !important; -webkit-background-clip: initial !important;
    }
    .vault-app div, .vault-app p, .vault-app span, .vault-app label { color: #3a3028 !important; }
    .vault-app [style*="color: #e0d6c8"] { color: #2a2318 !important; }
    .vault-app [style*="color: #ccc"] { color: #3a3028 !important; }
    .vault-app [style*="color: #bbb"] { color: #4a4038 !important; }
    .vault-app [style*="color: #999"] { color: #7a7060 !important; }
    .vault-app [style*="color: #888"] { color: #7a7060 !important; }
    .vault-app [style*="color: #777"] { color: #6a6050 !important; }
    .vault-app [style*="color: #666"] { color: #6a6050 !important; }
    .vault-app [style*="color: #555"] { color: #6a6050 !important; }
    .vault-app [style*="color: #444"] { color: #8a8070 !important; }
    .vault-app [style*="color: #333"] { color: #aaa098 !important; }
    .vault-app [style*="color: #222"] { color: #bbb0a8 !important; }
    .vault-app [style*="color: ${gold}"] { color: #8a6a20 !important; }
    .vault-app [style*="color: rgb(196"] { color: #8a6a20 !important; }
    .vault-app [style*="color: #6a6"] { color: #2a8a2a !important; }
    .vault-app [style*="color: rgb(102, 170"] { color: #2a8a2a !important; }
    .vault-app [style*="color: #c66"] { color: #c44 !important; }
    .vault-app [style*="background: #111"] { background: #f8f5f0 !important; }
    .vault-app [style*="background: #0f0f0f"] { background: rgba(0,0,0,0.03) !important; }
    .vault-app [style*="background: #0a0a0a"] { background: #f4f0e8 !important; }
    .vault-app [style*="background: #0e0e0e"] { background: #f4f0e8 !important; }
    .vault-app [style*="background: linear-gradient(135deg, #1a"] { background: #f8f5f0 !important; }
    .vault-app [style*="background: linear-gradient(180deg, #1a"] { background: #f8f5f0 !important; }
    .vault-app [style*="background: linear-gradient(150deg"] { background: #f8f5f0 !important; }
    .vault-app [style*="background: linear-gradient(145deg"] { background: #ece8e0 !important; }
    .vault-app [data-modal-bg] { background: rgba(0,0,0,0.3) !important; }
    .vault-app [data-modal-card] { background: #f8f5f0 !important; box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important; }
    .vault-app [data-nav] { background: linear-gradient(180deg, rgba(248,245,240,0.98), rgba(240,235,225,1)) !important; }
    .vault-app [data-shelf-plank] { background: ${t.shelfPlank} !important; border-top-color: ${t.plankBorder} !important; }
    .vault-app nav button { color: #aaa !important; }
    .vault-app input::placeholder { color: #a09888 !important; }
  ` : `
    .vault-app {
      --card-bg: #131313; --border-clr: #1c1c1c; --input-bg: #111;
      --text: #e0d6c8; --text-sub: #888; --text-muted: #444;
      background: radial-gradient(ellipse at 15% -5%, #1a1510 0%, #0a0a0a 45%, #050505 100%);
      color: #e0d6c8;
    }
    .vault-app [data-modal-bg] { background: rgba(0,0,0,0.92) !important; }
    .vault-app [data-modal-card] { background: linear-gradient(180deg, #1a1a1a, #131313) !important; }
    .vault-app [data-nav] { background: linear-gradient(180deg, rgba(10,10,10,0.96), rgba(5,5,5,1)); }
    .vault-app [data-shelf-plank] { background: linear-gradient(180deg, #3a2a1a, #2a1a0a, #1a0f05) !important; border-top-color: #4a3520 !important; }
  `;

  if (appState === "public") return <PublicHomePage onLogin={() => { setAuthMode("login"); setAppState("auth"); }} onSignup={() => { setAuthMode("signup"); setAppState("auth"); }} onBrowse={() => { setAppState("app"); setPage("discover"); }} />;
  if (appState === "auth") return <AuthPage mode={authMode} onComplete={(u) => { setUser(u); setAppState("app"); setPage("home"); }} onBack={() => setAppState("public")} onSwitch={() => setAuthMode(m => m === "login" ? "signup" : "login")} />;
  if (appState === "reset") return <ResetPasswordScreen onDone={() => setAppState("app")} />;

  if (viewingCollector) return (
    <div className="vault-app" style={{ minHeight:"100vh", fontFamily:"'EB Garamond', serif" }}>
      <style>{themeStyle}</style>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      <PublicProfileView collector={viewingCollector} onBack={() => setViewingCollector(null)} t={t} />
      <ThemedNav page={page} setPage={p => { setViewingCollector(null); setPage(p); }} t={t} />
    </div>
  );

  return (
    <div className="vault-app" style={{ minHeight:"100vh", fontFamily:"'EB Garamond', serif" }}>
      <style>{themeStyle}</style>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

      {page === "home" && <HomePage books={books} setPage={setPage} t={t} user={user} setBooks={setBooks} setModal={setModal} showToast={showToast} />}
      {page === "search" && <SearchPage onBack={()=>setPage("home")} user={user} setBooks={setBooks} books={books} showToast={showToast} />}
      {page === "shelf" && <ShelfPage books={books} setBooks={setBooks} modal={modal} setModal={setModal} t={t} user={user} setPage={setPage} showToast={showToast} />}
      {page === "market" && <MarketPage setModal={setModal} t={t} user={user} />}
      {page === "discover" && <DiscoverPage onViewProfile={c => setViewingCollector(c)} t={t} />}
      {page === "profile" && <ProfilePage books={books} wishlist={wishlist} setPage={setPage} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} t={t} user={user} profile={profile} setProfile={setProfile} />}
      {page === "wishlist" && <WishlistPage wishlist={wishlist} setWishlist={setWishlist} setPage={setPage} t={t} user={user} />}

      {modal?.type === "report" && <Modal onClose={() => setModal(null)}><ReportSaleModal onClose={() => setModal(null)} user={user} /></Modal>}

      {/* Toast notification */}
      {toast && <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", background:toast.type==="success"?"rgba(60,120,60,0.95)":"rgba(180,60,60,0.95)", color:"#fff", padding:"12px 24px", borderRadius:8, fontSize:14, fontFamily:"'EB Garamond', serif", zIndex:2000, boxShadow:"0 8px 32px rgba(0,0,0,0.5)", animation:"fadeIn 0.3s" }}>{toast.msg}</div>}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(-10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>

      <ThemedNav page={page} setPage={setPage} t={t} />
    </div>
  );
}

function ThemedNav({ page, setPage, t }) {
  const items = [{ key:"home", label:"Home", i:"⬡" },{ key:"shelf", label:"Shelf", i:"◫" },{ key:"market", label:"Market", i:"◈" },{ key:"discover", label:"Discover", i:"✦" },{ key:"profile", label:"Profile", i:"◉" }];
  return (<nav data-nav style={{ position:"fixed", bottom:0, left:0, right:0, borderTop:`1px solid ${t.navBorder}`, display:"flex", justifyContent:"space-around", padding:"8px 0 14px", zIndex:900 }}>{items.map(it=>(<button key={it.key} onClick={()=>setPage(it.key)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"4px 10px", color:page===it.key?gold:"#666" }}><span style={{ fontSize:18 }}>{it.i}</span><span style={{ fontSize:8, fontFamily:"'Cinzel', serif", letterSpacing:1 }}>{it.label}</span></button>))}</nav>);
}
