-- HOTELER Global Hotel Index - draft relational schema

CREATE TABLE hotel_groups (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  loyalty_program TEXT,
  official_url TEXT,
  source_url TEXT,
  verified_at TIMESTAMPTZ
);

CREATE TABLE brands (
  id BIGSERIAL PRIMARY KEY,
  hotel_group_id BIGINT REFERENCES hotel_groups(id),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  segment TEXT,
  brand_type TEXT, -- hard brand / soft brand / collection / alliance
  official_url TEXT,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE hotels (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ko TEXT,
  hotel_group_id BIGINT REFERENCES hotel_groups(id),
  brand_id BIGINT REFERENCES brands(id),
  country_code CHAR(2) NOT NULL,
  country_name TEXT NOT NULL,
  city_name TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  official_url TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- open / announced / temporarily_closed / closed
  opened_at DATE,
  last_verified_at TIMESTAMPTZ,
  source_url TEXT
);

CREATE TABLE affiliate_programs (
  id BIGSERIAL PRIMARY KEY,
  hotel_group_id BIGINT REFERENCES hotel_groups(id),
  network TEXT NOT NULL,
  program_name TEXT NOT NULL,
  link_template TEXT,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE hotel_affiliate_routes (
  hotel_id BIGINT REFERENCES hotels(id),
  affiliate_program_id BIGINT REFERENCES affiliate_programs(id),
  destination_url TEXT,
  tracking_key TEXT,
  active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY(hotel_id, affiliate_program_id)
);

-- Important SEO rule: searchable filters are not automatically indexable.
-- Index pages are curated separately so thin combinations do not explode.
CREATE TABLE seo_landings (
  id BIGSERIAL PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  page_type TEXT NOT NULL, -- group / brand / country / city / hotel / curated_combo
  entity_id BIGINT,
  title TEXT NOT NULL,
  h1 TEXT NOT NULL,
  meta_description TEXT,
  body_intro TEXT,
  indexable BOOLEAN DEFAULT TRUE,
  canonical_url TEXT
);
