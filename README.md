# ShelfLife — The Collector's Edition Tracker

Catalog your library. Know your book's worth. Never miss a drop.

ShelfLife is a web app built for serious book collectors — people who track lettered editions, numbered/slipcased copies, traycased deluxe runs, ARCs, and everything in between. It combines a personal library catalog with real market pricing data from eBay sold listings, bookstore aggregators, and community-reported sales.

## Features

- **Collection Management** — Catalog books with edition type, limitation details (#42/500, Letter: Q), condition, publisher, purchase price, and estimated value. Three shelf views: list, spine, and cover.
- **Multi-Source Pricing Engine** — Aggregates data from eBay (sold + active listings), Google Custom Search across book market domains (AbeBooks, Biblio, etc.), community price reports, and other collectors' shelf valuations. Uses IQR outlier removal and confidence scoring.
- **Edition-Aware Matching** — Understands that "lettered" relates to "traycased" and "deluxe"; scores marketplace listings by strict, related, or mismatched edition class. Prevents a $30 trade paperback from polluting a lettered edition estimate.
- **Community** — Public collector profiles, follow system, tiered badges (Bronze/Silver/Gold/Obsidian), community activity feed, and crowdsourced price reports.
- **Wishlist / Hunting List** — Track books you're searching for with edition and budget constraints.
- **Market Page** — Search any book for a price check with combined data from all sources.
- **PWA Support** — Installable on mobile with offline shell caching.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 + inline styles with light/dark theme
- **Database**: Supabase (PostgreSQL + Auth + Row Level Security)
- **APIs**: eBay Browse & Finding APIs, Google Custom Search, Open Library
- **Deployment**: Vercel-ready

## Getting Started

```bash
npm install
cp .env.example .env.local  # then fill in your keys
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `EBAY_APP_ID` | No | eBay developer App ID (for marketplace search) |
| `EBAY_CERT_ID` | No | eBay developer Cert ID (for OAuth token) |
| `GOOGLE_API_KEY` | No | Google Custom Search API key |
| `GOOGLE_CSE_ID` | No | Google Custom Search Engine ID |
| `GOOGLE_MARKET_DOMAINS` | No | Comma-separated domains to search (defaults to abebooks.com, biblio.com, etc.) |

## Database Tables (Supabase)

The schema is managed in Supabase. Key tables:

- `profiles` — User display name, privacy settings
- `user_collection` — Per-user book catalog with edition/pricing details
- `books` — Shared title/author lookup table
- `wishlist` — Per-user hunting list
- `price_reports` — Community-reported and shelf-synced valuations
- `community_activity` — Public activity feed
- `contact_messages` — User feedback/contact submissions
- `collector_follows` — Follow graph between collectors

## Project Structure

```
app/
  layout.tsx                # Root layout, metadata, fonts
  page.tsx                  # Client wrapper for ShelfLife
  shelflife.jsx             # UI components and screens
  globals.css               # Tailwind imports + shared keyframes
  api/
    ebay/route.js           # Marketplace search aggregator (eBay + Google CSE)
    price-report/route.js   # Server-validated price report submission
lib/
  supabase.js               # Supabase browser client singleton
  constants.js              # App data, style objects, dropdown options
  edition-classes.js        # Shared edition classification logic
  pricing.js                # Price aggregation, stats, and confidence scoring
  db.js                     # All Supabase database operations
supabase/
  schema.sql                # Database schema documentation (tables, indexes, RLS)
public/
  manifest.json             # PWA manifest
  sw.js                     # Service worker (network-first + cache fallback)
```
