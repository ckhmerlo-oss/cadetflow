# Demo Environment (demo.cadetflow.com)



Public playground for CadetFlow using a **dedicated Supabase project** and the same Next.js deployment with host-aware routing.



## Architecture



| Host | Supabase project | Login |

|------|------------------|-------|

| `cadetflow.com` | Production (`ejzvpknayvkggswejgkm`) | Email + password |

| `demo.cadetflow.com` | Demo (`gnxycfheypaciwwzcokj`) | Persona picker |



## One-time setup



### 1. Supabase demo project (`gnxycfheypaciwwzcokj`)

**Important:** The demo database must use the **CadetFlow schema** from this repo (`companies.company_name`, etc.). If the project was created from a Supabase starter or V2 template, you will see errors like `column "company_name" does not exist` when running `demo-seed.sql`.

**Fix wrong schema (one-time):**

1. SQL editor → run [`supabase/demo-schema-rebuild.sql`](../supabase/demo-schema-rebuild.sql)
2. From repo root:
   ```bash
   supabase link --project-ref gnxycfheypaciwwzcokj
   supabase db push
   ```
   This applies all CadetFlow migrations (~200 files). Expect several minutes.

**Then seed the demo:**

1. Link CLI (if not already):
   ```bash
   supabase link --project-ref gnxycfheypaciwwzcokj
   ```

2. **Wipe existing data** (after CadetFlow schema is in place):
   ```bash
   psql "$DEMO_DATABASE_URL" -f supabase/demo-wipe.sql
   ```
   Or SQL editor → [`supabase/demo-wipe.sql`](../supabase/demo-wipe.sql)

3. **Apply demo seed**:
   ```bash
   psql "$DEMO_DATABASE_URL" -f supabase/demo-seed.sql
   ```

4. Deploy edge functions to the demo project:

   - `process-email-queue`

   - `send-email`



6. Auth → URL configuration:

   - Site URL: `https://demo.cadetflow.com`

   - Redirect URLs: `https://demo.cadetflow.com/auth/callback`, `http://demo.localhost:3000/auth/callback`



### What `demo-wipe.sql` removes vs keeps



| Removed | Preserved |
|---------|-----------|
| All `auth.users` / identities / sessions | Table schema, RLS, functions |
| All public app rows (profiles, reports, work orders, etc.) | `offense_types`, `sports`, `notification_event_types` |
| — | `legal_document_versions`, `room_inspection_item_templates`, `app_options` |

Storage files are not cleared by SQL (Supabase blocks direct `storage.objects` deletes). Empty buckets via the Storage dashboard if needed.



Barracks rooms are recreated by `demo-seed.sql` (via `seed_barracks_rooms_catalog()`).



### 2. Vercel



1. Add domain `demo.cadetflow.com` to the CadetFlow project.

2. Set environment variables (Production):



```

NEXT_PUBLIC_SUPABASE_URL_DEMO=https://gnxycfheypaciwwzcokj.supabase.co

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEMO=<demo publishable key>

SUPABASE_SERVICE_ROLE_KEY_DEMO=<demo service role key — server only, never commit>

NEXT_PUBLIC_SITE_URL_DEMO=https://demo.cadetflow.com

DEMO_INTERNAL_PASSWORD=password123

```



Production Supabase vars stay unchanged. Do **not** overwrite production `.env.local` with demo keys.



### 3. DNS



Point `demo.cadetflow.com` CNAME to Vercel.



## Local demo testing



1. Add to `hosts`: `127.0.0.1 demo.localhost`

2. Point demo env vars at the demo project (or set `CADETFLOW_DEMO_MODE=true`).

3. Run `npm run dev` and open `http://demo.localhost:3000/login`.



The app already uses host-aware Supabase clients in `utils/supabase/` — do not replace them with the default Supabase starter templates.



## Nightly reset (midnight America/New_York)



- Migration `20260729000001_demo_reset_job.sql` installs `maybe_reset_demo_environment()` and an hourly pg_cron job.

- Reset runs only when `system_settings.is_demo_environment = true` (set by `demo-seed.sql`).

- Full reseed after truncate:

  ```bash

  psql "$DEMO_DATABASE_URL" -f supabase/demo-seed.sql

  ```



Manual full wipe + reseed:



```bash

psql "$DEMO_DATABASE_URL" -f supabase/demo-wipe.sql

psql "$DEMO_DATABASE_URL" -f supabase/demo-seed.sql

```



## Release checklist



On each production release:



1. `supabase db push` → production project

2. `supabase link --project-ref gnxycfheypaciwwzcokj && supabase db push` → demo project

3. If demo data was truncated: re-run `demo-wipe.sql` + `demo-seed.sql`



## Security notes



- `/api/demo/login` returns 404 on non-demo hosts.

- Demo password (`DEMO_INTERNAL_PASSWORD`) is server-only; never exposed to the browser.

- Demo auth cookies are scoped to the demo Supabase project and do not work on production.

- Never run `demo-wipe.sql` against the production project.


