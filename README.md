# WatchVault V2

WatchVault è una piattaforma Next.js per collezionisti di orologi con collezione personale, manutenzione, community, marketplace e profili.

## Stack

- Next.js 15 / React 19 / TypeScript
- Supabase Auth + PostgreSQL + Storage + RLS
- Render Web Service (Node 22)

## Supabase

Il backend V2 è sul progetto Supabase `wrzazkgwsldtvsgztgbl`. L'architettura database e le regole di sicurezza sono documentate in `supabase/WATCHVAULT_V2.md`.

Il frontend usa esclusivamente la publishable key. `SUPABASE_SECRET_KEY` è server-only e non deve mai essere importata da componenti client.

## Variabili locali

```bash
cp .env.example .env.local
npm install
npm run dev
```

Compila almeno:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Le variabili `SUPABASE_*` senza prefisso `NEXT_PUBLIC_` sono riservate a codice server-side.

## Render

`render.yaml` configura il servizio Node in Frankfurt, esegue installazione dipendenze + `npm run build`, avvia con `npm start` e usa `/` come health check.

Prima del deploy imposta le environment variables nel servizio Render. Non salvare chiavi secret nella repository.

## V2 backend disponibile

- Supabase Auth: registrazione, login, email verification e password recovery
- profili e avatar
- catalogo marche/modelli
- collezioni e schede orologio
- privacy public/followers/private
- immagini e documenti
- storico valore
- manutenzioni e reminder
- social graph, post, commenti, like, salvataggi e discussioni
- rating modelli
- marketplace e preferiti
- conversazioni e messaggi
- notifiche, blocchi e segnalazioni
- ruoli moderator/admin e audit amministrativo
- ricerca globale predisposta nel client data layer

## Sicurezza

Tutte le 32 tabelle pubbliche hanno RLS attiva. Le policy separano letture pubbliche, contenuti follower-only, dati owner-only e operazioni admin. I documenti sono in bucket privato. Dopo l'installazione dello schema V2 il Supabase Security Advisor non segnala problemi.
