# Kanata HVAC — static site

Production-ready static site. Three pages (`index.html`, `services.html`, `contact.html`)
plus shared CSS, `main.js`, and `assets/`. No build step required.

## Deploy to Vercel

**Option A — drag & drop (fastest)**
1. Go to https://vercel.com/new
2. Drag this whole folder onto the page (or upload the zip).
3. Vercel detects a static site automatically — just click **Deploy**.

**Option B — Vercel CLI**
```
npm i -g vercel
cd deploy
vercel        # follow prompts; accept the static-site defaults
vercel --prod # publish to your production URL
```

**Option C — Git**
Push this folder to a GitHub repo and "Import Project" in Vercel.
No framework preset needed — choose **Other**, leave build command empty,
and set the output directory to the folder root.

## Notes
- `index.html` is the home page and is served at `/` automatically.
- `vercel.json` enables clean URLs (`/services` instead of `/services.html`). No other config needed.
- The contact + hero quote forms currently show a success message on submit
  but are not yet wired to send email. To collect submissions, point the
  `<form>` at a handler (e.g. Vercel serverless function, Formspree, or
  Vercel Forms) — happy to set that up.
- Fonts load from Google Fonts over the network.


<!-- Redeploy trigger: ship api/reviews.js serverless function (2026-06-12) -->
