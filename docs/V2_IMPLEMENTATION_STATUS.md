# WatchVault V2 implementation status

## Completed in this branch

- isolated feature branch from `main`
- audited Next.js/React stack and Render blueprint
- provisioned V2 schema in the connected WatchVault Supabase project
- 32 public tables with RLS enabled
- 57 public-schema RLS policies
- private admin authorization helper
- Storage buckets and upload policies for avatars, watches, marketplace, posts and private documents
- Supabase Security Advisor clean after remediation
- migrated client configuration to publishable-key naming
- password recovery client flow
- profile privacy + avatar upload
- collection CRUD data layer adapted to V2 watch fields
- maintenance data layer adapted to `watch_service_history`
- social feed adapted to V2 posts
- marketplace data layer adapted to `marketplace_listings`
- global search data-layer function
- Render environment-variable blueprint updated

## Still required before merge to main

- export the remote V2 schema into a real reproducible migration
- complete dedicated UI routes for detailed watch pages, reminders, messaging, global search and admin console
- add multi-image UI flows for watches/posts/marketplace and private document UI
- add model community/review UI and follow/save/like/comment interactions
- add marketplace edit/status/favorite/contact UI
- add end-to-end tests for auth, CRUD, RLS/privacy and admin authorization
- run a clean production build in an environment with npm registry access
- configure the Render service environment values and deploy this branch for smoke testing

This branch must remain a draft until those checks are complete.
