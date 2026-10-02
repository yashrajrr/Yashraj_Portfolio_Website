# AI Handoff: Yashraj Rathor Portfolio

## 1. Project Overview
- **Project:** Personal Portfolio Website for Yashraj Radheshyam Rathor.
- **Goal:** Create a brutalist, modern, and high-impact portfolio for a Data Engineer / ML practitioner.
- **Tech Stack:** Static HTML, Vanilla JavaScript, Tailwind CSS (currently via Play CDN).
- **Theme/Aesthetic:** Brutalist, dark mode default (`bg-surface`, `bg-primary` accents), full-width horizontal cards, raw edges.
- **Local Dev Server:** A Python HTTP server is currently running in the background on port `3000` (`python -m http.server 3000`).

## 2. Work Accomplished
- **Content Migration:** Extracted facts from the provided resume and mapped them accurately across the site.
- **Hero & About Sections:** Updated with name, target roles (Data Engineer, ML), and professional summary (SIES GST, 9.3 CGPA).
- **Projects Section:** Refactored from a standard grid into full-width horizontal stacked cards with large numeric accents (`01`, `02`, `03`). Fixed alignment issues where the list was improperly nested in the header flex container.
- **Skills Section:** Categorized skills into columns (Languages, Agentic AI, Cloud & Data Eng, CS Fundamentals).
- **Certifications Section:** Purged placeholder data. Retained only the 3 authentic certifications explicitly documented in the resume (J.P. Morgan, AWS Academy, Tata Group).
- **Security Audit:** 
  - Added a baseline `Content-Security-Policy` (CSP) in `<head>`.
  - Mitigated reverse tabnabbing by applying `rel="noopener noreferrer"` to all `target="_blank"` anchor tags (LinkedIn, GitHub).

## 3. Current File State
- `index.html`: Contains all content and structure.
- `style.css`: Contains custom CSS variables and the `.brutal-shadow` utility class.
- `tailwind.config.js`: Contains theme colors (primary, surface, text) and font family configuration.
- `main.js`: Contains logic for smooth scrolling and intersection observers for animations.

## 4. Pending / Next Steps for Future AI Agents
1. **Tailwind Production Build:** The site currently relies on the Tailwind Play CDN (`https://cdn.tailwindcss.com`) which is not recommended for production. The next agent should consider migrating this to a Node.js/PostCSS build pipeline to generate a minified, static CSS file.
2. **Resume Download Link:** The "Download Resume" button should be updated to link to a real `.pdf` file once provided by the user.
3. **Asset Links:** Project and Certification images are currently placeholders (e.g. `asset/Yashraj_JP_MORGAN_Quantitative Research Job Simulation.jpg`). If these files don't exist in the `asset` directory, they need to be populated or the `img` tags need to be removed/hidden until the assets are provided.
4. **Mobile Optimization:** While Tailwind responsive classes (`md:`, `lg:`) are heavily used, the next agent should verify the layout remains pixel-perfect on mobile viewports.

## 5. Known Context / Variables
- **User Email:** `yashrajrathor2005@gmail.com`
- **User LinkedIn:** `linkedin.com/in/yashrajrr`
- **User GitHub:** `github.com/yashrajrr`
