# Render environment for WatchVault V2

Set these values in the Render service before deploying the V2 branch:

- `NEXT_PUBLIC_SITE_URL` = the Render/custom production URL
- `NEXT_PUBLIC_SUPABASE_URL` = WatchVault Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = browser-safe publishable key
- `SUPABASE_URL` = same Supabase project URL, server-side
- `SUPABASE_PUBLISHABLE_KEY` = publishable key, server-side if needed
- `SUPABASE_SECRET_KEY` = secret key, server-only

The secret key must never use a `NEXT_PUBLIC_` prefix. After deployment, add the production URL to Supabase Auth redirect/site URL configuration for email verification and password recovery.
