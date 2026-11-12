# Yashraj Rathor - Data Engineering Portfolio

A high-performance, single-page professional portfolio built with a core focus on **Data Engineering** and **Machine Learning** projects. Designed using an "Electric Brutalism" architectural aesthetic, this project prioritizes clean structural layouts and lightweight client-side interactions.

---

## Features & Architecture

*   **Responsive Brutalism Design:** A premium, responsive visual language that keeps the project's raw editorial identity while supporting three centralized themes: Midnight Professional, Minimal Light, and Modern Accent.
*   **Lean Production Front End:** Built with Vanilla JavaScript and semantic HTML5. Tailwind utility classes are compiled into a static stylesheet during the Vercel build; no React or Vue runtime is shipped.
*   **Authenticated Shared Admin Editor:** `/admin` (with `admin.html` as the static entry point) provides Vercel-backed login and publishing for site metadata, hero/about content, projects, skills, experience, education, certifications, achievements, contact details, footer links, personal details, appearance, typography, and resume metadata.
*   **Live Draft Preview:** The dashboard sends validated, unsaved drafts to an isolated public-page preview without writing them to storage.
*   **Appearance Controls:** Theme, accent, heading/body font, radius, animation, hero layout, section visibility, and navigation visibility are stored in the same validated content model.
*   **Secured Form Engine:** The Contact section has been heavily armored against spam and cross-site scripting:
     *   **Web3Forms Backed:** Uses Web3Forms to process requests without a custom server.
    *   **Invisible Honeypots:** Bait fields included in the DOM specifically capture web-scraping spam bots without disrupting real users.
    *   **Rate-Limiter:** An integrated timer utilizing HTML5 `localStorage` restricts users to **max 3 messages per 10 minutes** to prevent mail-bombing and rapid-fire API spam.
    *   **XSS Escaping:** Input data is sanitized (`<` and `>`) via regex before transmission.
*   **Modular Component Organization:** Industry-standard separation of concerns logic — structural components (`index.html`), generated styling (`tailwind.config.js` / `style.css`), and dynamic interactions (`main.js`).

---

## Tech Stack

*   **Core:** HTML5, Vanilla JS (ES6)
*   **Styling:** Tailwind CSS production build & Custom CSS overrides
*   **API / Handlers:** Web3Forms (AJAX POST)
*   **Typography:** Selected Google Fonts loaded on demand (`Inter`, `Manrope`, `Plus Jakarta Sans`, `DM Sans`, `Space Grotesk`, `IBM Plex Sans`, `Source Sans 3`, `Public Sans`, and `Lora`)
*   **Icons:** Google Material Symbols

---

## Project Structure

```
├── .gitignore               # Deployment & OS junk exclusions
├── index.html               # Main entry point 
├── main.js                  # Global DOM manipulations & secure form handlers
├── appearance.js            # Theme tokens and on-demand font loading
├── admin/                    # Clean /admin entry point for static Vercel hosting
├── admin.html               # Authenticated shared content editor
├── admin.js                 # Admin editor UI and import/export actions
├── api/auth/                 # Vercel login, session, and logout functions
├── api/content.js            # Protected publishing and public content reads
├── lib/auth.js               # Signed Vercel session cookie helpers
├── content.js               # Versioned default content model
├── content-store.js         # Validation and localStorage persistence
├── style.css                # Tailwind input and base visual logic
├── tailwind.config.js       # Brutalist theme definitions, colors, and fonts
├── package.json              # Production build and verification scripts
├── build.mjs                 # Copies the static site into dist/
├── vercel.json               # Vercel build/output configuration
├── DESIGN.md                # UI/UX philosophy & brand guidelines
├── asset/                   # Certificates, Profile Images, Web Assets
└── README.md                # Project documentation
```

---

## Running Locally

The site is a static front end with Vercel Functions for administrator login, logout, and publishing. Published content is stored in Vercel Blob.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yashrajrr/portfolio.git
    cd portfolio
    ```
2.  **Install dependencies and compile the deployable site**
    ```bash
    npm install
    npm run build
    ```
3.  **Preview the static site**
    If you have Python installed, run:
    ```bash
    python -m http.server 8000 --directory dist
    ```
    *(Alternatively, use `npx serve dist`. Use a server rather than opening the HTML file directly so browser storage behaves consistently.)*
4.  **View Site**
Navigate to `http://localhost:8000`

To use admin login, publishing, and public saved content locally, connect the project to Vercel, pull its Development variables with `npx vercel env pull .env.local`, then run `npm run dev:local`. This local runner serves the built site and the same API handlers used by Vercel.

### Managing website content

1. Connect a Vercel Blob store to the project and configure the administrator environment variables listed below.
2. Deploy the site, then open `/admin` (or `admin.html`) and sign in.
3. Edit any field, reorder or remove collection items, and select **Save changes** to publish the shared portfolio content.
4. Use **Live preview** to inspect the actual public renderer with unsaved changes, or **Export JSON** to keep a portable backup.
5. Use **Import JSON** to restore an exported content file in another browser.

The Appearance panel provides six colour themes, independent heading/body font selectors, accent colour, radius, motion, hero layout, and visibility controls. The Resume panel manages structured resume content separately from an uploaded PDF. Embedded PDF uploads are limited to 1 MB to stay within browser storage quotas; once published, the validated PDF data is available to public visitors through the shared content row. A committed PDF asset and published relative URL is recommended for larger files.

The public page reads the latest published content from Vercel Blob. The committed seed content remains the fallback if storage is unavailable. Admin login uses a signed, HttpOnly session cookie, with credentials and signing secret held in Vercel environment variables. When publishing is unavailable, a validated draft can be kept in browser `localStorage` and retried later. Embedded PDFs remain limited to 1 MB. The Web3Forms access key is deployment configuration, not an editable admin field.

### Vercel setup

1. Create and connect a Vercel Blob store to the project. Vercel supplies the Blob access token to its functions.
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the Vercel project environment. Use a long, unique password.
3. Set `SESSION_SECRET` to a random secret with at least 32 characters. Keep all three values private and redeploy after changing them.
4. Open `/admin`, sign in with the configured email and password, and publish the initial content. Login sessions expire after 12 hours.

The first successful save creates the shared content record in Blob. To reset the published portfolio to seed content, select **Reset draft to defaults** in the editor and save it.

---

## Contact Modifications
The form endpoint and subject can be edited from the Admin Editor. The Web3Forms access key remains in the public page because this static site has no server-side secret boundary; configure the recipient and provider according to your Web3Forms account before production use.
