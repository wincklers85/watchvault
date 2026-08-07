# WatchVault V2 architecture

WatchVault remains a single Next.js application deployed as a Render Node web service. Supabase provides Auth, PostgreSQL/Data API and Storage.

The browser authenticates with the publishable key and a user JWT; PostgreSQL RLS is the primary authorization boundary. Server-only administrative operations may use `SUPABASE_SECRET_KEY`, but only behind explicit admin authorization checks. The secret key must never be imported into a client component.

Data is split into catalogue, collection, maintenance, social, marketplace, messaging and moderation domains. Sensitive owner data (serials, purchase values, private notes and documents) is protected by owner-scoped RLS; public/follower collection visibility is evaluated separately.

The current branch is an incremental V2 migration from the MVP and intentionally remains isolated from `main` until production build, migration export and end-to-end smoke tests are complete.
