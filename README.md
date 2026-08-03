# WatchVault MVP

Prima versione deployabile su Render di una piattaforma per collezionisti di orologi.

## Avvio locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

Senza Supabase l'app funziona in modalità demo e salva gli orologi aggiunti nel localStorage del browser.

## Collegare Supabase

1. Crea un progetto Supabase.
2. Apri SQL Editor ed esegui `supabase/schema.sql`.
3. Copia URL e anon key in `.env.local`.
4. In Authentication > URL Configuration aggiungi il dominio Render.

## Deploy Render

1. Carica il progetto in un repository GitHub.
2. Su Render scegli **New > Blueprint** e seleziona il repository.
3. Render legge `render.yaml`.
4. Inserisci le tre variabili richieste.

## Funzioni incluse

- Home responsive dark luxury
- Registrazione e login Supabase con fallback demo
- Dashboard
- Collezione e inserimento schede
- Registro manutenzioni
- Feed community
- Marketplace
- Profilo pubblico
- Schema PostgreSQL con RLS

## Prossimo passo tecnico

Collegare tutte le pagine CRUD direttamente alle tabelle Supabase e aggiungere upload Storage, notifiche e messaggistica.
