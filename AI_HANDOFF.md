# AI Handoff: Yashraj Rathor Portfolio

## 1. Project Overview
- **Project:** Personal Portfolio Website for Yashraj Radheshyam Rathor.
- **Goal:** Create a brutalist, modern, and high-impact portfolio for a Data Engineer / ML practitioner.
- **Tech Stack:** Static HTML, Vanilla JavaScript, generated Tailwind CSS, Supabase Auth/database, a Vercel config function, and a token-based appearance system.
- **Theme/Aesthetic:** Brutalist/editorial identity with six themes (`midnight`, `minimal`, `accent`, `forest`, `ember`, `orchid`), centralized CSS tokens, curated typography, full-width horizontal cards, and raw edges.
- **Local Dev Server:** Run `npm install`, `npm run build`, then `python -m http.server 8000 --directory dist` from the project root when testing. Do not assume a background server is still running.

## 2. Work Accomplished
- **Content Migration:** Extracted facts from the provided resume and mapped them accurately across the site.
- **Hero & About Sections:** Updated with name, target roles (Data Engineer, ML), and professional summary (SIES GST, 9.3 CGPA).
- **Projects Section:** Refactored from a standard grid into full-width horizontal stacked cards with large numeric accents (`01`, `02`, `03`). Fixed alignment issues where the list was improperly nested in the header flex container.
- **Skills Section:** Categorized skills into columns (Languages, Agentic AI, Cloud & Data Eng, CS Fundamentals).
- **Certifications Section:** Purged placeholder data. Retained only the 3 authentic certifications explicitly documented in the resume (J.P. Morgan, AWS Academy, Tata Group).
- **Security Audit:** 
  - Added a baseline `Content-Security-Policy` (CSP) in `<head>`.
   - Mitigated reverse tabnabbing by applying `rel="noopener noreferrer"` to all `target="_blank"` anchor tags (LinkedIn, GitHub).
- **Admin Editor:** Added `admin.html` and `admin.js` for authenticated editing and shared publishing of all public content categories. `content.js` contains the versioned seed and `content-store.js` validates local offline drafts under `yashraj-portfolio-content:v1`.
- **Public Rendering:** `index.html` is a safe structural shell. `main.js` renders the committed seed immediately, then replaces it with the validated public Supabase row when configured; it never exposes an unsaved local admin draft to public visitors.
- **Appearance System:** `appearance.js`, `style.css`, and `tailwind.config.js` provide the six theme palettes, selected-font loading, radius/motion/hero switches, contrast-safe accent handling, and reduced-motion support.
- **Admin Preview:** The dashboard sends validated draft content to `index.html?preview=1` with same-origin `postMessage`; preview drafts are not persisted.
- **Resume Management:** The editor supports PDF selection, header validation, preview, download, removal, and a separate published URL field. Embedded PDFs are validated and published with the shared content row; a committed asset URL is recommended for larger files.
- **Supabase/Vercel:** `supabase/schema.sql` defines the public content row, administrator allow-list, trigger, grants, and RLS. `supabase-client.js` uses only a browser-safe anon/publishable key. `api/config.js` exposes `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Vercel environment variables.
- **Production CSS:** `package.json`, `build.mjs`, and `vercel.json` compile Tailwind utilities into `dist/style.css`; the production site no longer loads Tailwind Play CDN.

## 3. Current File State
- `index.html`: Contains the public structure and render targets; visible content is seeded locally and upgraded from the shared content model.
- `style.css`: Tailwind input plus centralized theme tokens, responsive/accessibility rules, typography aliases, and the refreshed motion/image system.
- `appearance.js`: Applies validated appearance settings and loads only the selected font families.
- `tailwind.config.js`: Contains theme colors (primary, surface, text) and font family configuration.
- `main.js`: Renders the content model, loads published Supabase content, handles navigation/contact submission, and provides scroll/reveal/image enhancements.
- `admin.html` / `admin.js`: Supabase-authenticated editor with allow-list checks, shared save, offline draft fallback, collection ordering, delete confirmation, unsaved-change warnings, isolated live preview, reset, import/export, appearance controls, and PDF management.
- `content.js` / `content-store.js`: Public-safe defaults and versioned storage/validation.

## 4. Pending / Next Steps for Future AI Agents
1. **Deployment configuration:** The owner must create the Supabase project, run `supabase/schema.sql`, create the Auth user, add that user's UUID to `public.portfolio_admins`, and set `SUPABASE_URL` plus `SUPABASE_ANON_KEY` in Vercel.
2. **Resume Publication:** Add a real `.pdf` file to the repository and enter its published relative path in the Resume panel when provided by the user.
3. **Contact delivery:** Confirm the Web3Forms recipient/provider configuration before production use; the current access key is a public form identifier, not a server secret.

## 5. Known Context / Variables
- **User Email:** `yashrajrathor2005@gmail.com`
- **User LinkedIn:** `linkedin.com/in/yashrajrr`
- **User GitHub:** `github.com/yashrajrr`
