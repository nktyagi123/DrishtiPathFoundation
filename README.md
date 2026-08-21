# DrishtiPathFoundation Website

A complete, responsive NGO Trust website built with **HTML5, CSS3, and vanilla JavaScript only** — no frameworks, no backend, no build step. Just open `index.html` in a browser.

## 1. How to Open and Run the Website

No installation or build process is required.

- **Simplest way:** double-click `index.html` (or any other `.html` file) to open it in your browser.
- **Recommended way (for the donor Excel feature to work):** serve the folder with a local web server, because browsers block `fetch()` requests to local files (`file://...`) for security reasons. Two easy options:
  - **VS Code:** install the "Live Server" extension, right-click `index.html` → "Open with Live Server".
  - **Python (if installed):** run `python -m http.server 8000` inside the project folder, then visit `http://localhost:8000`.

If you skip the local server and open `index.html` directly, the whole site still works — the **View Donators** page will automatically show its built-in sample data instead of reading `data/donors.xlsx` (see section 9 below).

## Project Structure

```text
DrishtiPathFoundation/
│
├── index.html          Home page (hero, about teaser, impact, focus areas, top donors, CTA)
├── about.html           About Us (mission, vision, values, certificate)
├── directors.html        Our Directors (3 director cards)
├── donate.html          Donate page (UPI QR code + UPI ID)
├── donors.html          View Donators (table loaded from Excel, search/sort)
├── contact.html         Contact Us (info + validated contact form)
│
├── css/
│   └── style.css        All site styling (CSS variables, responsive layout)
│
├── js/
│   └── script.js        All site behaviour (nav, slideshow, counters, modal, form, donor table)
│
├── images/
│   ├── logo-placeholder.png
│   ├── hero-placeholder.jpg      background behind the Home page hero text
│   ├── hero-placeholder/         hero1.jpg – hero6.jpg (Home + About photo slideshow)
│   ├── directors/        director1.jpg, director2.jpg, director3.jpg
│   ├── donors/           donor1.jpg – donor5.jpg
│   ├── certificate/      certificate.jpg
│   └── qr/               upi-qr.png
│
└── data/
    └── donors.xlsx       Donor records (ID, Name, City, Amount, Date)
```

## 2. How to Replace the NGO Logo

Replace `images/logo-placeholder.png` with your real logo (recommended: a square image, at least 200×200px). Keep the same filename, or update the `src="images/logo-placeholder.png"` reference in the `<header>` of every `.html` page.

## 2a. How to Update the Hero Photo Slideshow

The Home page hero and the About Us intro image both show the same auto-advancing photo slideshow (fades between photos every 5 seconds, with arrows and dots — the same component used for the Top Donators slideshow).

To update the photos:
1. Add or replace images in `images/hero-placeholder/`, named sequentially: `hero1.jpg`, `hero2.jpg`, `hero3.jpg`, etc.
2. If you add or remove photos (not just replace them 1-for-1), update the list of `<div class="hero-slide">...</div>` blocks inside the `.hero-slider` in **both** `index.html` and `about.html` to match — keep the two lists identical.

The slideshow logic lives once in `js/script.js` as `initHeroSlideshow()` (built on the shared `createSlideshow()` engine also used by the Top Donators slideshow), so no JavaScript changes are needed when you just swap photos.

The separate `images/hero-placeholder.jpg` file (no folder) is a different image — it's the static background behind the hero section's text on the Home page. Replace it separately if you want to change that too.

## 3. How to Replace Director Images

Replace the files in `images/directors/`:
- `director1.jpg` → Sohit Sagar
- `director2.jpg` → Meghraj Singh Rana
- `director3.jpg` → Priyanka

Keep the same filenames so no HTML changes are needed. To update names/positions/descriptions, edit the director cards directly inside `directors.html`.

## 4. How to Replace Top Donor Images

Replace the files in `images/donors/` (`donor1.jpg` through `donor5.jpg`) with real donor photos. Update the corresponding name and thank-you message text inside the `.donor-slide` blocks in `index.html`.

## 5. How to Update the UPI QR Code

Replace `images/qr/upi-qr.png` with your real UPI QR code image (export it from your UPI app, e.g. Google Pay/PhonePe/BHIM/Paytm). Keep the same filename, or update the `src` in the `.qr-box` section of `donate.html`.

## 6. How to Update the UPI ID

Open `donate.html` and edit the text inside:

```html
<span class="upi-id" id="upiIdText">example@upi</span>
```

Replace `example@upi` with your real UPI ID.

## 6a. How to Update the Bank Transfer Details

The Donate page also offers a Bank Transfer option next to the UPI card. Open `donate.html` and edit the values inside the "Bank Transfer" card:

```html
<strong id="bankInstitutionText">Indian Bank</strong>        <!-- Bank Name -->
<strong id="bankNameText">DrishtiPath Foundation</strong>   <!-- Account Name -->
<strong id="bankAccText">7790377180</strong>                <!-- Account Number -->
<strong id="bankIfscText">IDIB000G515</strong>               <!-- IFSC Code -->
```

Each of these (plus the UPI ID) has a **Copy** button next to it. The copy buttons work automatically for any element with `class="copy-btn"` and a `data-copy-target="<id>"` attribute pointing at the value to copy — see `initCopyButtons()` in `js/script.js`.

## 7. How to Replace the NGO Certificate

Replace `images/certificate/certificate.jpg` with a scan/photo of your real registration certificate. It appears on `about.html` and opens in a lightbox/modal when clicked ("View Certificate").

## 8. How to Update the Donor Excel File

Edit `data/donors.xlsx` directly in Excel, Google Sheets, or LibreOffice Calc. The first sheet must contain these column headers in row 1:

| ID | Name | City | Amount | Date |
|----|------|------|--------|------|

Add, edit, or remove rows as needed — the donor table on `donors.html` reads every row automatically. No code changes are required.

## 9. Explanation of the Excel Donor-Loading Feature

Because this site has no backend or database, `donors.html` reads donor records directly in the browser using the **[SheetJS (xlsx)](https://sheetjs.com/)** JavaScript library, loaded from a CDN via a single `<script>` tag:

```html
<script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"></script>
```

This is the simplest widely-used, browser-compatible way to parse `.xlsx` files without any server-side code, database, or build tools. When the page loads, `js/script.js`:

1. Fetches `data/donors.xlsx`.
2. Parses it with SheetJS.
3. Converts the first sheet into a JavaScript array of donor objects.
4. Renders the results into the table, with search (by name), city filtering, and amount/date/name sorting.

**Note:** reading a local file with `fetch()` only works when the page is served over `http://` (a local web server) — browsers block this for pages opened directly as `file://...` for security reasons. See section 1 above for how to run a local server.

## 10. Explanation of the Fallback Donor Data

If `data/donors.xlsx` cannot be loaded — for example when the site is opened directly by double-clicking `index.html`/`donors.html` (no local server), or the SheetJS CDN script fails to load (no internet connection) — `js/script.js` automatically falls back to a hard-coded sample dataset (`FALLBACK_DONORS`) so the **View Donators** page is never empty.

The status line above the table tells you which source is currently active ("loaded from data/donors.xlsx" vs. "sample donor record(s) (fallback data...)"). To edit the fallback data itself, open `js/script.js` and update the `FALLBACK_DONORS` array near the top of the "Donor Table" section.

## Notes

- The WhatsApp floating button and footer link use `+91-9917634016` (`https://wa.me/919917634016`) on every page.
- The contact form (`contact.html`) has no backend: it validates fields client-side, prevents the page reload, and shows a success message on submit — no data is actually sent anywhere.
- All placeholder images were generated locally so the site looks complete out of the box; replace them with real photos at your convenience using the steps above.
