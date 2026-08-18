# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static NGO Trust website (DrishtiPathFoundation) built with plain HTML5, CSS3, and vanilla JavaScript only. No framework, no backend, no build step, no package manager — there is no `package.json`. The site runs by opening any `.html` file directly in a browser.

## Commands

There is no build, lint, or test tooling in this repo — none should be introduced without being asked, since "no build process required" is a hard requirement of the project (see README.md).

- **Run the site:** open `index.html` directly in a browser, or serve the folder locally (`python -m http.server 8000`, or VS Code's Live Server) — a local server is required for the Excel donor loading feature to work, since browsers block `fetch()` on `file://` pages.
- **Sanity-check JS after edits:** `node -c js/script.js` (syntax check only — there is no test suite).
- **Sanity-check HTML after edits:** no linter is configured; when editing multi-page markup, verify tag balance manually, e.g. by stripping HTML comments and stack-matching `<div>`/`</div>` pairs (comments frequently contain literal tag examples that trip up naive counting).

## Architecture

**Multi-page, no templating.** Each of the six pages (`index.html`, `about.html`, `directors.html`, `donate.html`, `donors.html`, `contact.html`) is a fully standalone HTML file. The header/nav, WhatsApp floating button, and footer markup is duplicated verbatim across all six — there is no include/partial mechanism (plain HTML has none). When changing shared chrome (nav links, footer contact info, social links, phone/email), the same edit must be repeated identically across all six files; check with `grep`/counts across `*.html` rather than editing one file at a time.

**One shared stylesheet, one shared script.** `css/style.css` and `js/script.js` are loaded on every page. `style.css` is organized into numbered sections (see its header comment) driven by CSS custom properties defined on `:root` (`--primary-blue`, `--dark-blue`, etc.) — reuse these variables rather than hardcoding colors. `script.js` registers one `DOMContentLoaded` listener that calls every `init*()` function unconditionally; each function guards itself by checking whether its target element exists (`if (!el) return`) before doing anything, so it's safe for a function written for one page to be included on all pages.

**Generic reusable slideshow engine.** `createSlideshow(containerId, slideSelector, dotsId, prevId, nextId)` in `js/script.js` is a single generic auto-advancing slideshow (5s autoplay, prev/next, dots, pause-on-hover) used by three separate slideshow instances: the Home page hero photos, the About Us intro photos (same `#heroSlider` markup pattern, reused per-page), and the Top Donors slideshow. When adding another slideshow anywhere, call `createSlideshow()` again with new ids/selectors rather than writing new slider logic.

**Hero photo list is duplicated across two pages.** The same set of `<div class="hero-slide">` blocks (pointing at `images/hero-placeholder/hero1.jpg`, `hero2.jpg`, ...) appears in both `index.html` and `about.html`. Adding/removing/reordering hero photos means editing both files identically — nothing enforces this automatically.

**Donor data has two independent sources that must stay compatible.** `donors.html` loads `data/donors.xlsx` client-side via the SheetJS CDN script (`XLSX.read`/`sheet_to_json`, expects `ID`/`Name`/`City`/`Amount`/`Date` columns). If that fetch fails (e.g. opened via `file://`, or no internet for the CDN), `loadDonorData()` in `js/script.js` silently falls back to the hardcoded `FALLBACK_DONORS` array in the same file. These two datasets are not generated from each other — when changing one, consider whether the other should change too, and check `donorStatus` text on the page to see which source is currently active.

**Copy-to-clipboard is attribute-driven, not per-button code.** Any `<button class="copy-btn" data-copy-target="someId">` automatically copies the text content of `#someId` (see `initCopyButtons()`). Used today for the UPI ID and bank account fields on `donate.html`; add new copyable fields the same way instead of writing new click handlers.

**Image assets are organized by purpose with sequential, HTML-referenced filenames** (`images/directors/director1.jpg`, `images/donors/donor1.jpg`, `images/hero-placeholder/hero1.jpg`, etc.). These filenames are hardcoded into the HTML `src` attributes — there's no manifest — so adding/removing images requires adding/removing the corresponding `<img>`/slide markup by hand, and the README documents the expected naming convention per asset type.

**No backend, ever.** The contact form (`contact.html`) validates client-side and shows a success message but sends nothing anywhere. Do not add a form action, API calls, or server-side processing — this is a stated hard constraint of the project.

## Key README sections worth knowing

`README.md` documents, per numbered section, how to replace every placeholder asset (logo, hero photos, director photos, donor photos, QR code, UPI ID, bank details, certificate) and the two donor-data mechanisms above in more detail — consult it before re-deriving those instructions.
