# WatchVault migrations

The connected V2 database was initialized directly while the schema was being designed and validated. Before merging this branch to `main`, export the finalized remote schema into a timestamped Supabase migration so future environments can be reproduced exactly. Do not use the legacy root `schema.sql` as the V2 source of truth.
