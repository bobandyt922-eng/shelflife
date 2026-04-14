-- ShelfLife Database Schema
-- This file documents the expected Supabase Postgres schema.
-- Run against your Supabase project to create or verify tables.

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  is_public BOOLEAN DEFAULT true,
  show_value BOOLEAN DEFAULT false,
  notify_new_releases BOOLEAN DEFAULT true,
  notify_price_alerts BOOLEAN DEFAULT true,
  notify_wishlist BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shared book catalog (for search/discovery across users)
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  year TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(title, author)
);

-- Per-user book collection
CREATE TABLE IF NOT EXISTS user_collection (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT,
  edition_type TEXT,
  limitation TEXT,
  condition TEXT DEFAULT 'Fine',
  purchase_price NUMERIC,
  current_value NUMERIC,
  notes TEXT,
  cover_url TEXT,
  isbn TEXT,
  date_added DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_collection_user_id ON user_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_title ON user_collection USING gin(title gin_trgm_ops);

-- Wishlist / hunting list
CREATE TABLE IF NOT EXISTS wishlist (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  edition_wanted TEXT,
  max_price NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- Community price reports (crowdsourced + shelf valuations)
CREATE TABLE IF NOT EXISTS price_reports (
  id BIGSERIAL PRIMARY KEY,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  edition_type TEXT,
  sale_price NUMERIC NOT NULL,
  sale_source TEXT,
  condition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_reports_title ON price_reports USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_price_reports_reported_by ON price_reports(reported_by);

-- Community activity feed
CREATE TABLE IF NOT EXISTS community_activity (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT,
  detail TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_activity_public ON community_activity(is_public, created_at DESC);

-- Contact / feedback messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT NOT NULL,
  topic TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Collector follow graph
CREATE TABLE IF NOT EXISTS collector_follows (
  id BIGSERIAL PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, followed_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON collector_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON collector_follows(followed_id);

-- Row Level Security policies
-- These should be enabled on all tables. Examples below:

-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_collection ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE price_reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE community_activity ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE collector_follows ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read public profiles, users can update their own
-- CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (is_public = true);
-- CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User collection: users can CRUD their own, anyone can read for price aggregation
-- CREATE POLICY "Users can manage own collection" ON user_collection FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Collection values are readable" ON user_collection FOR SELECT USING (true);

-- Wishlist: private to each user
-- CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- Price reports: anyone can read, authenticated users can insert
-- CREATE POLICY "Price reports are readable" ON price_reports FOR SELECT USING (true);
-- CREATE POLICY "Authenticated users can report" ON price_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
