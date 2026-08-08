# Environment security

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is intentionally browser-visible and is protected by RLS. `SUPABASE_SECRET_KEY` bypasses RLS and must only be used in trusted server code. Never log it, commit it, send it to the browser or expose it through a `NEXT_PUBLIC_` variable.
