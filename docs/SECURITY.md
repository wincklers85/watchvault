# WatchVault security notes

- Public browser code uses only the Supabase publishable key.
- Secret/service credentials are server-only and excluded by `.gitignore`.
- All public-schema tables have RLS enabled.
- Ownership checks use `auth.uid()` and explicit owner/author/seller columns.
- Admin authorization is based on `profiles.role` through a helper in the non-exposed `private` schema; user-editable auth metadata is not trusted for authorization.
- Watch documents use a private Storage bucket.
- Storage writes require the authenticated user UUID as the first object-path segment.
- Bucket MIME allowlists and file-size limits are enabled.
- User-generated text is rendered by React, not injected as raw HTML.
- Database access uses PostgREST filters/JSON payloads rather than string-built SQL.
- Run Supabase Security Advisor after every RLS/schema change.

Rate limiting for high-volume write endpoints should be added server-side/at the edge before public launch; RLS is authorization, not abuse prevention.
