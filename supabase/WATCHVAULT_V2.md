# WatchVault V2 — Supabase backend

Project ref: `wrzazkgwsldtvsgztgbl`.

## Database

The V2 backend uses PostgreSQL with RLS enabled on every table in `public`. The deployed schema contains 32 public tables and 57 public-schema RLS policies.

Core domains:

- Identity: `profiles`
- Catalogue: `brands`, `watch_models`
- Collection: `collections`, `collection_items`, `watches`, `watch_images`, `watch_documents`, `watch_change_log`, `watch_value_history`
- Maintenance: `watch_service_history`, `watch_reminders`
- Social: `follows`, `brand_follows`, `model_follows`, `posts`, `post_images`, `comments`, `likes`, `saved_posts`, `discussions`, `model_reviews`
- Marketplace: `marketplace_listings`, `marketplace_images`, `marketplace_favorites`
- Messaging: `conversations`, `conversation_members`, `messages`
- Safety/moderation: `user_blocks`, `reports`, `notifications`, `admin_actions`

## Storage

Buckets:

- `avatars` — public images, owner writes
- `watches` — public watch images, owner writes
- `marketplace` — public listing images, owner writes
- `posts` — public post images, owner writes
- `documents` — private; owner/admin only

Uploads must use an authenticated user's UUID as the first path segment. MIME types and size limits are enforced at bucket level.

## Privacy model

Watch visibility is `public`, `followers`, or `private`. Serial number, purchase price, documents and private notes are never exposed through a separate public projection; direct row reads are governed by watch RLS and private documents have their own owner-only RLS/storage policy.

Administrative authorization is read from `profiles.role`, not user-editable auth metadata. The helper used by RLS lives in the non-exposed `private` schema.

## Render variables

Browser-safe:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Server-only:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Never prefix the secret key with `NEXT_PUBLIC_` and never commit it.

## Security verification

After the V2 schema was installed, Supabase Security Advisor returned no findings. All public tables have RLS enabled. Re-run Security and Performance Advisors after every schema/policy change.
