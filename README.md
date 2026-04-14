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
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (for server-side price report validation) |

## Setting Up Google Custom Search (for book pricing)

Google Custom Search pulls prices from AbeBooks, Biblio, BookFinder, Alibris, and other book market sites. This significantly improves pricing accuracy, especially for collector editions that don't always appear on eBay.

### Step 1: Get a Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Go to **APIs & Services → Library**
4. Search for **"Custom Search API"** and click **Enable**
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. Copy the key — this is your `GOOGLE_API_KEY`
8. (Recommended) Click the key and restrict it to "Custom Search API" only

### Step 2: Create a Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all)
2. Click **Add** to create a new search engine
3. Under **"Sites to search"**, add these domains (one per line):
   - `abebooks.com`
   - `biblio.com`
   - `bookfinder.com`
   - `alibris.com`
   - `pangobooks.com`
   - `betterworldbooks.com`
4. Name it something like "ShelfLife Book Market"
5. Click **Create**
6. On the next screen, copy the **Search engine ID** — this is your `GOOGLE_CSE_ID`

### Step 3: Add to your environment

Add both values to your `.env.local` (for local dev) or your hosting provider's environment variables:

```
GOOGLE_API_KEY=AIza...your-key-here
GOOGLE_CSE_ID=a1b2c3...your-cse-id
```

The free tier gives you 100 searches/day. For higher volume, billing can be enabled on the Google Cloud project.

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
