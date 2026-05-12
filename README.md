# Political Integrity Bill — public campaign site

Single-page static site for the **Political Integrity (Misinformation Accountability) Bill** (NZ, 2026).

- **One file**: `index.html` — plain HTML + Tailwind via CDN, no build step.
- **Hosting**: Cloudflare Pages (free, unlimited bandwidth, custom domain).
- **Comments**: Cusdis (public, no sign-in for readers).

---

## Preview locally

Just double-click `index.html` and it'll open in your browser, or:

```bash
# from this folder
python -m http.server 5500
# then visit http://localhost:5500
```

---

## Deploy to Cloudflare Pages

### One-time setup

1. **Create a new GitHub repo** (private or public is fine):
   - Go to https://github.com/new
   - Name it something like `misinfo-bill-site`
   - Don't add a README, .gitignore, or license — keep it empty

2. **Push this folder to GitHub:**

   ```bash
   cd "C:/Users/Jeremy.VanRyswyk/OneDrive - Architectus/Documents/Miss Information Bill/site"
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/vanman989/misinfo-bill-site.git
   git push -u origin main
   ```

3. **Connect Cloudflare Pages:**
   - Sign in at https://dash.cloudflare.com (free account is fine)
   - Workers & Pages → **Create application** → **Pages** → **Connect to Git**
   - Authorise GitHub, pick the `misinfo-bill-site` repo
   - Build settings:
     - **Framework preset:** None
     - **Build command:** *(leave blank)*
     - **Build output directory:** `/`
   - Click **Save and Deploy**

4. The site goes live at `https://misinfo-bill-site.pages.dev` (or whatever subdomain Cloudflare assigns) within ~30 seconds.

### Going forward

Whenever I (or you) edit `index.html` and push to `main`, Cloudflare auto-redeploys. No further action.

---

## Set up Cusdis comments

The site has a Cusdis embed in the **Public comments** section with a placeholder app ID. Until you replace it, comments won't load.

1. Sign up at https://cusdis.com (free tier: 1 site, 100 approved comments / month — plenty for a campaign site)
2. Create a project → it'll give you an **App ID** (looks like `12345678-abcd-...`)
3. Open `index.html` and find this line (search for `REPLACE_WITH_CUSDIS_APP_ID`):

   ```html
   data-app-id="REPLACE_WITH_CUSDIS_APP_ID"
   ```

4. Replace the placeholder with your real App ID.
5. Commit, push — comments now work.

### About Cusdis (heads-up)

Cusdis is convenient but the project hasn't had a release since Nov 2021 and the creator has hinted at wanting to sell it. If long-term continuity matters, options are:

- **Self-host Cusdis** on Railway or Cloudflare Workers (free tier) — ~10 min of setup
- **Custom Cloudflare Workers + D1 comment system** — ~50 lines of code, full control, free tier
- **Switch to Giscus** (GitHub-backed) — actively maintained but requires GitHub login (barrier for general public)

Tell me when you want to swap and I'll rebuild that block.

---

## Custom domain (optional)

Once you have a domain (e.g. `honestpolitics.nz`):

1. Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain**
2. Add the domain; if it's also on Cloudflare, DNS is one click. Otherwise, follow the CNAME instructions.
3. HTTPS is automatic.

---

## Editing the bill text

The bill text in `index.html` is a condensed presentation. The **source of truth** is the markdown at:

```
Documents/Miss Information Bill/SS/02-Draft-Bill.md
```

If you change the markdown, tell me and I'll mirror the changes into the HTML. The two should never drift far apart.

---

## File layout

```
site/
├── index.html      ← the entire site (HTML + inline Tailwind config + a few lines of JS)
└── README.md       ← this file
```

No package.json, no node_modules, no build pipeline. By design.

---

## What's left to do (in order)

1. **You** — sign up for Cusdis, paste the App ID into `index.html`.
2. **You** — create the GitHub repo and push (commands above).
3. **You** — connect Cloudflare Pages (UI clicks above).
4. **Both** — share the `*.pages.dev` URL with the people whose feedback you want, then iterate.
5. **Optional later** — register a real domain, swap Cusdis for something more resilient, add per-section comment threads if you want feedback localised.
