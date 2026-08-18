# Infrastructure Resilience Watch

Daily infrastructure intelligence, risks, issues and resilient solutions for Pakistan.

**Observe • Assess • Advise • Build Resilience**

## Two separate links

After Vercel deploy, share these two URLs:

- **User Portal (public only):** `https://YOUR-PROJECT.vercel.app/`
- **Admin Portal (login only):** `https://YOUR-PROJECT.vercel.app/admin`

## Show published content to everyone (required for the live website)

Browser storage is not enough for a public site. This app uses **Supabase** (Postgres + file storage + live updates).

Cloudflare is not required. Supabase is the database to connect.

### 1. Create a free Supabase project

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. **New project** → name it `infra-resilience-watch` → set a database password → create.
3. Wait until the project is ready.

### 2. Create the tables

1. In Supabase go to **SQL Editor** → **New query**.
2. Paste the full contents of `supabase/schema.sql` from this repo.
3. Click **Run**.

If the storage bucket SQL fails, create a public bucket named `media` under **Storage**.

### 3. Create the admin login

1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Email: the address you will use to sign in (example `admin@your-org.pk`).
3. Password: a strong password you will remember.
4. Confirm the user if email confirmation is enabled, or turn off **Confirm email** under Authentication → Providers → Email while you are setting up.

### 4. Copy the API keys

1. **Project Settings** → **API**.
2. Copy **Project URL**.
3. Copy the **anon public** key. Do not use the service_role key in this app.

### 5. Local `.env`

Create `.env` in the project root (same folder as `package.json`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=admin@your-org.pk
```

Restart `npm run dev`. Admin login uses that email and the password you created in Supabase.

### 6. Vercel (so the live internet site uses the same database)

1. Vercel project → **Settings** → **Environment Variables**.
2. Add the same three `VITE_...` values.
3. Redeploy.

After this, anything you **Publish** in Admin is stored in Supabase and appears on the User Portal for every visitor.

If you already added the Vercel variables, **redeploy** (a new git push does this) so the live site rebuilds with those keys. Vite bakes `VITE_` values into the build.

### 7. Realtime (optional but recommended)

In Supabase: **Database** → **Replication** (or **Publications**) → enable `advisories` for supabase_realtime. The SQL file tries to do this automatically.

## Deploy on Vercel

1. Open [Vercel](https://vercel.com/new) and import this GitHub repo: [shanu222/Infra-Resilience-Watch](https://github.com/shanu222/Infra-Resilience-Watch)
2. Framework: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add the Supabase environment variables above
6. Deploy

## Local development

```bash
npm install
npm run dev
```

- User: http://localhost:8443/
- Admin: http://localhost:8443/admin

Without Supabase keys, Admin still works as a local demo (`admin` / `Admin@2026`) and is not visible to other people on the internet.
