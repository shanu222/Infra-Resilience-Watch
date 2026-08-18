# Infrastructure Resilience Watch

Daily infrastructure intelligence, risks, issues and resilient solutions for Pakistan.

**Observe • Assess • Advise • Build Resilience**

## Live links after Vercel deploy

Vercel gives you one project URL. The two working portals are:

- **User Portal:** `https://YOUR-PROJECT.vercel.app/user`
- **Admin Portal:** `https://YOUR-PROJECT.vercel.app/admin`

Landing / access screen: `https://YOUR-PROJECT.vercel.app/`

Admin login: `admin` / `Admin@2026`

## Deploy on Vercel

1. Open [Vercel](https://vercel.com/new) and import this GitHub repo: [shanu222/Infra-Resilience-Watch](https://github.com/shanu222/Infra-Resilience-Watch)
2. Framework: **Vite** (auto-detected)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Click **Deploy**

Do not change the root directory. After deploy, open `/user` and `/admin` on the Vercel domain.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:8443/user and http://localhost:8443/admin
