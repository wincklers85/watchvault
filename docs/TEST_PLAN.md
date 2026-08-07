# WatchVault V2 test plan

Before merge to `main`:

1. `npm install` and `npm run build` on a clean checkout.
2. Register a new user, confirm email, login, logout and password recovery.
3. Verify profile edit and avatar upload.
4. Create/read/update/delete an owned watch; verify a second user cannot modify it.
5. Verify public/followers/private watch visibility with two accounts.
6. Upload watch images and a private document; verify document isolation.
7. Create maintenance history and next-due reminder.
8. Create post/comment/like/save/follow flows and verify follower-only visibility.
9. Create marketplace draft/published/reserved/sold listing, favorite it and start a conversation.
10. Verify messages are visible only to conversation members.
11. Verify reports, blocks and notifications.
12. Promote a test account to admin server-side and verify moderation/admin access; verify normal users are denied.
13. Run Supabase Security and Performance Advisors.
14. Deploy the feature branch to Render and smoke-test desktop/mobile routes.
