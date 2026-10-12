# HOTELER Global Branded Hotel Index v0.2

## Corrected product definition
HOTELER is first a global branded-hotel database and map. SEO and affiliate monetization sit on top of that database; they are not the primary product.

## Benchmarking idea taken from TierStay
- Map-first hotel discovery
- Chain/brand membership context
- Hotel locations as the fundamental unit

## HOTELER differentiation
- Worldwide scope, not only a small curated set
- Group → brand → property normalization
- Loyalty program and official-site URL
- Affiliate routing only when a commercial relationship exists
- Korean-language SEO pages generated from the same hotel master DB
- Future HOTELER Partners creator attribution layer

## Intended ingestion scale
Start with Marriott, Hilton, Accor, IHG, Hyatt and GHA ecosystems, then add Wyndham, Choice, Radisson, H World, Jin Jiang, Minor, Four Seasons, Mandarin Oriental, Rosewood, H10 and other independent global/regional chains.

## SEO principle
Do not index arbitrary filter combinations. Create indexable pages for stable entities and proven search demand:
- /groups/{group}
- /brands/{brand}
- /countries/{country}
- /cities/{city}
- /hotel/{property}
- selected /cities/{city}/{brand} combinations

## Files
- index.html: interactive concept prototype
- data/hotels.json: 32 sample properties used only to test the UI/data model
- data/groups.json: initial hotel ecosystem metadata
- DB_SCHEMA.sql: draft production data model

## Next build
1. Automated official hotel directory ingestion
2. Deduplication / canonical property identity
3. Geocoding and map clustering
4. Affiliate routing configuration
5. Next.js static/ISR SEO page generation
6. Change detection for openings, closings and brand migration
