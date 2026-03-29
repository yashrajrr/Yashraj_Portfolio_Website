# Yashraj Rathor - Data Engineering Portfolio

A high-performance, single-page professional portfolio built with a core focus on **Data Engineering** and **Machine Learning** projects. Designed using an "Electric Brutalism" architectural aesthetic, this project prioritizes clean structural layouts and lightweight client-side interactions.

---

## Features & Architecture

*   **Responsive Brutalism Design:** A unique, dark-mode-first visual language strictly following the `DESIGN.md` rules (0px border radius, high-frequency "Electric Indigo" typography contrasts, and physical drop shadows).
*   **Zero-Dependency Front End:** Built entirely using Vanilla JavaScript, semantic HTML5, and utility classes delivered via Tailwind CSS. No heavy React or Vue framework payload.
*   **Secured Form Engine:** The Contact section has been heavily armored against spam and cross-site scripting:
    *   **FormSubmit Backed:** Uses FormSubmit's native ML infrastructure to process requests without a server.
    *   **Invisible Honeypots:** Bait fields included in the DOM specifically capture web-scraping spam bots without disrupting real users.
    *   **Rate-Limiter:** An integrated timer utilizing HTML5 `localStorage` restricts users to **max 3 messages per 10 minutes** to prevent mail-bombing and rapid-fire API spam.
    *   **XSS Escaping:** Input data is sanitized (`<` and `>`) via regex before transmission.
*   **Modular Component Organization:** Industry-standard separation of concerns logic — structural components (`index.html`), utility styling (`tailwind.config.js` / `style.css`), and dynamic interactions (`main.js`).

---

## Tech Stack

*   **Core:** HTML5, Vanilla JS (ES6)
*   **Styling:** Tailwind CSS (via CDN) & Custom CSS overrides
*   **API / Handlers:** FormSubmit (AJAX POST)
*   **Typography:** Google Fonts (`Public Sans`, `Inter`)
*   **Icons:** Google Material Symbols

---

## Project Structure

```
├── .gitignore               # Deployment & OS junk exclusions
├── index.html               # Main entry point 
├── main.js                  # Global DOM manipulations & secure form handlers
├── style.css                # Base visual logic 
├── tailwind.config.js       # Brutalist theme definitions, colors, and fonts
├── DESIGN.md                # UI/UX philosophy & brand guidelines
├── asset/                   # Certificates, Profile Images, Web Assets
└── README.md                # Project documentation
```

---

## Running Locally

Because this project uses pure client-side static rendering, setting it up is instant.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yashrajrr/portfolio.git
    cd portfolio
    ```
2.  **Launch a Local Server**
    If you have Python installed, run:
    ```bash
    python -m http.server 8000
    ```
    *(Alternatively, use `npx serve` or simply open `index.html` in your web browser).*
3.  **View Site**
    Navigate to `http://localhost:8000`

---

## Contact Modifications
To update the target inbox for the contact form:
1. Open `index.html`.
2. Locate the `<form>` tracking the `action` attribute pointing to `formsubmit.co`.
3. Swap the secure hash string inside the URL with your raw email address.
4. Submit a test iteration locally to activate FormSubmit's verification protocol. Replace your raw email with the new secure hash generated in your inbox.
