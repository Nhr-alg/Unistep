# UniStep + Supabase Setup Guide

This turns UniStep into a cloud-synced MVP: users can sign up, log in, and their problem archive follows them across devices. If Supabase isn't configured, the app still works 100% locally (no account needed).

## What you need

- A free Supabase account: https://supabase.com
- ~10 minutes

---

## Step 1: Create a Supabase project

1. Go to https://supabase.com and sign in (or create an account).
2. Click **"New Project"**.
3. Choose your organization, enter a name (e.g. `unistep`), pick a region near you.
4. Set a database password (save it — you won't need it for the frontend, but keep it safe).
5. Wait for the project to finish provisioning (usually ~1–2 minutes).

---

## Step 2: Enable Email Auth

1. In the Supabase dashboard, go to **Authentication → Settings** (left sidebar).
2. Under **"Enable email authentications"**, make sure **Email** is enabled.
3. Under **"Confirm email"**, set to **Off** for the MVP (users can sign in immediately without verifying email). You can turn it on later for production.
4. Click **Save**.

---

## Step 3: Create the archive table

1. Go to **SQL Editor** in the left sidebar.
2. Click **"New query"**.
3. Paste the following SQL and click **Run**:

```sql
-- Enable Row Level Security (RLS) extension if not already
create extension if not exists pgcrypto;

-- Table: one row per solved problem, owned by a Supabase auth user
create table if not exists archive_entries (
    id bigint not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    ts bigint not null,
    text text not null,
    answer text default '',
    tag text default 'none' check (tag in ('none', 'important', 'revision')),
    timestamp text default '',
    created_at timestamptz default now(),
    primary key (id, user_id)
);

-- Enable Row Level Security: users can only see their own rows
alter table archive_entries enable row level security;

-- Policy: users can read their own entries
create policy "Users can view their own archive entries"
    on archive_entries for select
    using (auth.uid() = user_id);

-- Policy: users can insert their own entries
create policy "Users can insert their own archive entries"
    on archive_entries for insert
    with check (auth.uid() = user_id);

-- Policy: users can update their own entries
create policy "Users can update their own archive entries"
    on archive_entries for update
    using (auth.uid() = user_id);

-- Policy: users can delete their own entries
create policy "Users can delete their own archive entries"
    on archive_entries for delete
    using (auth.uid() = user_id);
```

4. Verify you see "Success" — the table is now created with RLS.

---

## Step 4: Get your API credentials

1. Go to **Project Settings → API** (left sidebar, under "Project Settings").
2. Copy:
   - **Project URL** → this is your `SUPABASE_URL` (looks like `https://xxxxx.supabase.co`)
   - **anon public** key → this is your `SUPABASE_ANON_KEY` (starts with `eyJ...`)

---

## Step 5: Add credentials to the code

Open `index.html` in the extracted `unistep/` folder and replace the placeholders:

```html
window.SupabaseConfig = {
    url: 'https://YOUR_PROJECT_REF.supabase.co',
    anonKey: 'eyJ...YOUR_ANON_KEY...'
};
```

Save the file.

---

## Step 6: Deploy the frontend

Since UniStep is a static frontend (HTML/JS/CSS), you can host it free on:

### Option A: GitHub Pages (recommended, simplest)
1. Push the modified `unistep/` folder contents to your `Nhr-alg/Unistep` repo root (not inside a subfolder).
2. Go to repo **Settings → Pages**.
3. Source: **Deploy from a branch**, Branch: `main`, Folder: `/ (root)`.
4. Click **Save**.
5. Your site goes live at `https://nhr-alg.github.io/Unistep/`.

### Option B: Vercel / Netlify
1. Connect your GitHub repo.
2. Deploy the `unistep/` folder as the root.
3. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables if your host supports injecting them into `window.SupabaseConfig` (otherwise edit `index.html` directly as in Step 5).

---

## Step 7: Test it

1. Open your live site URL.
2. Click **Sign in** → **Create an account**.
3. Enter an email and password (this is your Supabase account).
4. Solve a problem — it should save to your archive.
5. Open the site in a different browser/device, sign in with the same email — your archive should appear.

If Supabase is misconfigured or unreachable, the app silently falls back to local-only mode. No crash, no error shown to the user.

---

## How it works (architecture)

| Layer | What it does |
|-------|--------------|
| `cloud.js` | Supabase client wrapper. Handles signup/login/logout, archive pull/push, background sync. |
| `auth_manager.js` | Local-only fallback. When Supabase isn't available, handles accounts in localStorage. |
| Supabase Auth | Manages user accounts (email/password). |
| Supabase `archive_entries` table | Stores each solved problem (text, answer preview, tag, timestamp), scoped to `auth.uid()`. |

### Security
- Row Level Security (RLS) ensures a user can only read/write their own archive rows.
- The `anon` key is safe to embed in frontend code because RLS protects the data.
- Passwords are never stored in the browser — Supabase handles auth server-side.
- Full problem derivations are recomputed locally when an archive entry is reopened; only text + answer preview syncs.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Supabase client library not loaded" | Make sure the `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2">` tag is in `index.html` **before** `cloud.js`. |
| Sign up/login fails with invalid API key | Double-check `url` and `anonKey` in `window.SupabaseConfig` — no trailing spaces. |
| Archive doesn't sync across devices | Run the SQL from Step 3 (creates the table + RLS policies). Check Supabase Logs → API for errors. |
| App works locally but not after deploying | Make sure you deployed the **contents** of `unistep/` to the repo root, not inside a `unistep/` subfolder. |

---

## Files changed

- `cloud.js` — rewritten to use Supabase instead of a custom `/api` backend.
- `index.html` — added Supabase CDN script + `window.SupabaseConfig` placeholder block; updated CSP `connect-src`.
- `app.js` — no changes needed (it calls `UniStepCloud` which is cloud-backend agnostic).
- `auth_manager.js` — no changes needed (local fallback stays intact).
