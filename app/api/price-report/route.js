import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MAX_PRICE = 1_000_000;
const MIN_PRICE = 0.01;
const MAX_TITLE_LENGTH = 500;
const MAX_FIELD_LENGTH = 200;
const VALID_SOURCES = ["eBay", "AbeBooks", "Private Sale", "Facebook Group", "Forum", "Other", "Shelf Valuation"];

function getServerSupabase() {
  if (!supabaseUrl) return null;
  const key = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) return null;
  return createClient(supabaseUrl, key);
}

export async function POST(request) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, title, author, publisher, edition, price, source, condition, notes } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Title is too long" }, { status: 400 });
  }

  const numPrice = Number(price);
  if (!Number.isFinite(numPrice) || numPrice < MIN_PRICE || numPrice > MAX_PRICE) {
    return NextResponse.json(
      { error: `Price must be between $${MIN_PRICE} and $${MAX_PRICE.toLocaleString()}` },
      { status: 400 }
    );
  }

  if (source && !VALID_SOURCES.includes(source)) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const truncate = (val, max) => {
    if (!val || typeof val !== "string") return null;
    return val.trim().slice(0, max) || null;
  };

  const { error } = await supabase.from("price_reports").insert({
    reported_by: userId || null,
    title: title.trim().slice(0, MAX_TITLE_LENGTH),
    author: truncate(author, MAX_FIELD_LENGTH),
    publisher: truncate(publisher, MAX_FIELD_LENGTH),
    edition_type: truncate(edition, MAX_FIELD_LENGTH),
    sale_price: numPrice,
    sale_source: source || "Other",
    condition: truncate(condition, MAX_FIELD_LENGTH),
    notes: truncate(notes, MAX_FIELD_LENGTH),
  });

  if (error) {
    console.error("Price report insert error:", error);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
