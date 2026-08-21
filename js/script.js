/* =========================================================
   DrishtiPathFoundation — script.js
   Vanilla JavaScript only. No frameworks, no backend.

   This file is loaded on every page. Each init function
   checks whether its target element exists before running,
   so it is safe to include on pages that don't use that
   particular feature.

   Sections:
   1. Mobile Navigation + Sticky Header
   2. Scroll-to-top Button
   3. Slideshows — Hero Photos (Home/About) + Top Donors (Home)
   4. Animated Impact Counters (Home page)
   5. Certificate Modal / Lightbox
   6. Contact Form Validation
   7. Donate Page — Copy-to-clipboard buttons (UPI ID, bank details)
   8. Donor Table — Excel loading, search, sort (donors.html)
   9. Monthly Subscription Gate — Maintenance + Payment overlay
   10. Admin Panel — Subscription approvals (admin.html)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initSubscriptionGate(); // runs first so the overlay (if any) appears before other setup
  initNavigation();
  initScrollTopButton();
  initHeroSlideshow();
  initDonorSlideshow();
  initImpactCounters();
  initCertificateModal();
  initContactForm();
  initCopyButtons(); // must run after initSubscriptionGate() so its Copy button gets wired too
  initDonorTable();
  initAdminPanel();
});

/* ---------------------------------------------------------
   1. Mobile Navigation + Sticky Header shadow
   --------------------------------------------------------- */
function initNavigation() {
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  var header = document.getElementById('siteHeader');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile menu after a link is tapped
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Add a shadow to the header once the page is scrolled
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

/* ---------------------------------------------------------
   2. Scroll-to-top Button
   --------------------------------------------------------- */
function initScrollTopButton() {
  var btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------
   3. Slideshows — Hero Photos + Top Donors
   Both the Home/About hero photo slider and the Top Donors
   slider share this one generic engine: auto-advance every
   5 seconds, prev/next buttons, clickable indicator dots,
   pause on hover, loops forever.
   --------------------------------------------------------- */

// Generic slideshow engine. Pass the container id, the CSS class used by
// each slide inside it, and the ids of its dots/prev/next controls.
function createSlideshow(containerId, slideSelector, dotsId, prevId, nextId) {
  var slider = document.getElementById(containerId);
  if (!slider) return;

  var slides = Array.prototype.slice.call(slider.querySelectorAll(slideSelector));
  var dotsWrap = document.getElementById(dotsId);
  var prevBtn = document.getElementById(prevId);
  var nextBtn = document.getElementById(nextId);
  var current = 0;
  var intervalId = null;
  var AUTOPLAY_DELAY = 5000; // 5 seconds

  if (!slides.length) return;

  // Build indicator dots dynamically
  slides.forEach(function (_, index) {
    var dot = document.createElement('span');
    dot.className = 'dot' + (index === 0 ? ' active' : '');
    dot.setAttribute('data-index', index);
    dot.addEventListener('click', function () {
      goToSlide(index);
      resetAutoplay();
    });
    dotsWrap.appendChild(dot);
  });

  var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('.dot'));

  function showSlide(index) {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }

  function goToSlide(index) {
    current = (index + slides.length) % slides.length;
    showSlide(current);
  }

  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }

  function startAutoplay() {
    intervalId = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  function resetAutoplay() {
    clearInterval(intervalId);
    startAutoplay();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { prevSlide(); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { nextSlide(); resetAutoplay(); });

  // Pause on hover for better readability, resume on mouse leave
  slider.addEventListener('mouseenter', function () { clearInterval(intervalId); });
  slider.addEventListener('mouseleave', function () { startAutoplay(); });

  showSlide(current);
  startAutoplay();
}

// Hero photo slideshow — used on the Home page hero and the About Us intro image
function initHeroSlideshow() {
  createSlideshow('heroSlider', '.hero-slide', 'heroSliderDots', 'heroSliderPrev', 'heroSliderNext');
}

// Top Donors slideshow — Home page only
function initDonorSlideshow() {
  createSlideshow('donorSlider', '.donor-slide', 'sliderDots', 'sliderPrev', 'sliderNext');
}

/* ---------------------------------------------------------
   4. Animated Impact Counters
   Numbers count up from 0 once the section scrolls into view.
   --------------------------------------------------------- */
function initImpactCounters() {
  var counters = document.querySelectorAll('.counter-number');
  if (!counters.length) return;

  var animated = false;

  function animateCounters() {
    if (animated) return;
    animated = true;

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10) || 0;
      var duration = 1800; // ms
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var value = Math.floor(progress * target);
        counter.childNodes[0].nodeValue = value.toLocaleString('en-IN');
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.childNodes[0].nodeValue = target.toLocaleString('en-IN');
        }
      }
      requestAnimationFrame(step);
    });
  }

  var section = document.querySelector('.impact-section');
  if (!section) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  } else {
    // Fallback for very old browsers
    animateCounters();
  }
}

/* ---------------------------------------------------------
   5. Certificate Modal / Lightbox
   --------------------------------------------------------- */
function initCertificateModal() {
  var trigger = document.getElementById('certificateTrigger');
  var modal = document.getElementById('certificateModal');
  if (!trigger || !modal) return;

  var closeBtn = modal.querySelector('.modal-close');

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close when clicking the dark overlay (outside the image box)
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

/* ---------------------------------------------------------
   6. Contact Form Validation
   No backend available, so we validate on the client,
   prevent the page reload, and show a success message.
   --------------------------------------------------------- */
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var successMsg = document.getElementById('formSuccess');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var isValid = true;

    var fields = [
      { input: form.querySelector('#name'), rule: function (v) { return v.trim().length >= 2; } },
      { input: form.querySelector('#email'), rule: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); } },
      { input: form.querySelector('#phone'), rule: function (v) { return /^[0-9+\-\s]{7,15}$/.test(v.trim()); } },
      { input: form.querySelector('#message'), rule: function (v) { return v.trim().length >= 10; } }
    ];

    fields.forEach(function (field) {
      if (!field.input) return;
      var group = field.input.closest('.form-group');
      if (!field.rule(field.input.value)) {
        group.classList.add('invalid');
        isValid = false;
      } else {
        group.classList.remove('invalid');
      }
    });

    if (!isValid) {
      if (successMsg) successMsg.classList.remove('show');
      return;
    }

    // No backend: simply reset the form and show a success message
    form.reset();
    if (successMsg) {
      successMsg.classList.add('show');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () { successMsg.classList.remove('show'); }, 6000);
    }
  });

  // Remove the invalid state as soon as the user starts fixing a field
  form.querySelectorAll('input, textarea').forEach(function (input) {
    input.addEventListener('input', function () {
      var group = input.closest('.form-group');
      if (group) group.classList.remove('invalid');
    });
  });
}

/* ---------------------------------------------------------
   7. Donate Page — Copy-to-clipboard buttons
   Handles every button with class="copy-btn" and a
   data-copy-target="<id>" attribute (UPI ID, bank account
   number, IFSC code, etc.) — add more the same way if needed.
   --------------------------------------------------------- */
function initCopyButtons() {
  var copyButtons = document.querySelectorAll('.copy-btn[data-copy-target]');
  if (!copyButtons.length) return;

  copyButtons.forEach(function (copyBtn) {
    var targetEl = document.getElementById(copyBtn.getAttribute('data-copy-target'));
    if (!targetEl) return;

    copyBtn.addEventListener('click', function () {
      var text = targetEl.textContent.trim();

      function fallbackCopy() {
        var temp = document.createElement('textarea');
        temp.value = text;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand('copy'); } catch (err) { /* ignore */ }
        document.body.removeChild(temp);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      var originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () { copyBtn.textContent = originalText; }, 2000);
    });
  });
}

/* ---------------------------------------------------------
   8. Donor Table — Excel loading, search, filter, sort
   --------------------------------------------------------- */

// -------- Fallback dataset --------
// Used automatically if data/donors.xlsx cannot be read.
// This happens most commonly when index.html/donors.html is opened
// directly from the file system (file:// protocol), since browsers
// block file reads made from local pages for security reasons.
// UPDATE the actual donor records inside data/donors.xlsx — this
// array only exists as a safety net so the page never looks empty.
var FALLBACK_DONORS = [
  { id: 1, name: 'Rajesh Kumar', city: 'Delhi', amount: 25000, date: '2026-01-12' },
  { id: 2, name: 'Neha Gupta', city: 'Mumbai', amount: 18000, date: '2026-01-20' },
  { id: 3, name: 'Amit Agarwal', city: 'Jaipur', amount: 32000, date: '2026-02-02' },
  { id: 4, name: 'Sunita Sharma', city: 'Lucknow', amount: 12000, date: '2026-02-10' },
  { id: 5, name: 'Vikram Singh', city: 'Pune', amount: 27500, date: '2026-02-18' },
  { id: 6, name: 'Anjali Mehta', city: 'Ahmedabad', amount: 9000, date: '2026-03-01' },
  { id: 7, name: 'Karan Malhotra', city: 'Chandigarh', amount: 15500, date: '2026-03-09' },
  { id: 8, name: 'Pooja Nair', city: 'Kochi', amount: 21000, date: '2026-03-15' },
  { id: 9, name: 'Suresh Reddy', city: 'Hyderabad', amount: 40000, date: '2026-03-22' },
  { id: 10, name: 'Meena Iyer', city: 'Chennai', amount: 17500, date: '2026-04-05' }
];

function initDonorTable() {
  var tableBody = document.getElementById('donorTableBody');
  if (!tableBody) return; // Only run on donors.html

  var searchInput = document.getElementById('donorSearch');
  var cityFilter = document.getElementById('cityFilter');
  var sortSelect = document.getElementById('sortSelect');
  var statusEl = document.getElementById('donorStatus');

  var allDonors = [];

  loadDonorData(function (donors, source) {
    allDonors = donors;
    populateCityFilter(allDonors);
    renderDonorTable(allDonors);
    if (statusEl) {
      statusEl.textContent = source === 'excel'
        ? 'Showing ' + donors.length + ' donor record(s) loaded from data/donors.xlsx'
        : 'Showing ' + donors.length + ' sample donor record(s) (fallback data — could not read data/donors.xlsx, likely because the page was opened directly as a file). Serve the site through a local server to load the Excel file.';
    }
  });

  function populateCityFilter(donors) {
    if (!cityFilter) return;
    var cities = Array.from(new Set(donors.map(function (d) { return d.city; }))).sort();
    cities.forEach(function (city) {
      var opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      cityFilter.appendChild(opt);
    });
  }

  function getFilteredSortedDonors() {
    var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var city = cityFilter ? cityFilter.value : '';
    var sortBy = sortSelect ? sortSelect.value : 'default';

    var result = allDonors.filter(function (d) {
      var matchesName = !term || d.name.toLowerCase().indexOf(term) !== -1;
      var matchesCity = !city || d.city === city;
      return matchesName && matchesCity;
    });

    if (sortBy === 'amount-desc') {
      result.sort(function (a, b) { return b.amount - a.amount; });
    } else if (sortBy === 'amount-asc') {
      result.sort(function (a, b) { return a.amount - b.amount; });
    } else if (sortBy === 'name-asc') {
      result.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else if (sortBy === 'date-desc') {
      result.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    }

    return result;
  }

  function renderDonorTable() {
    var donors = getFilteredSortedDonors();
    tableBody.innerHTML = '';

    if (!donors.length) {
      var emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="5" class="no-results">No donor records match your search.</td>';
      tableBody.appendChild(emptyRow);
      return;
    }

    donors.forEach(function (donor, index) {
      var row = document.createElement('tr');
      row.innerHTML =
        '<td>' + (index + 1) + '</td>' +
        '<td>' + escapeHtml(donor.name) + '</td>' +
        '<td>' + escapeHtml(donor.city) + '</td>' +
        '<td>&#8377;' + donor.amount.toLocaleString('en-IN') + '</td>' +
        '<td>' + formatDate(donor.date) + '</td>';
      tableBody.appendChild(row);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(value) {
    var d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  if (searchInput) searchInput.addEventListener('input', renderDonorTable);
  if (cityFilter) cityFilter.addEventListener('change', renderDonorTable);
  if (sortSelect) sortSelect.addEventListener('change', renderDonorTable);
}

/**
 * Attempts to load donor records from data/donors.xlsx using the
 * SheetJS (xlsx) library loaded via CDN in donors.html.
 * Falls back to FALLBACK_DONORS if:
 *   - the SheetJS library did not load (e.g. no internet connection), or
 *   - the fetch request fails (commonly when opening the page via
 *     file:// instead of a local web server), or
 *   - the workbook has no readable rows.
 *
 * callback(donors, source) is called with source = 'excel' | 'fallback'
 */
function loadDonorData(callback) {
  var EXCEL_PATH = 'data/donors.xlsx';

  if (typeof XLSX === 'undefined' || typeof fetch === 'undefined') {
    callback(FALLBACK_DONORS, 'fallback');
    return;
  }

  fetch(EXCEL_PATH)
    .then(function (response) {
      if (!response.ok) throw new Error('Excel file not found');
      return response.arrayBuffer();
    })
    .then(function (buffer) {
      var workbook = XLSX.read(buffer, { type: 'array' });
      var firstSheetName = workbook.SheetNames[0];
      var sheet = workbook.Sheets[firstSheetName];
      var rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      var donors = rows.map(function (row, index) {
        return {
          id: row.ID || row.Id || row.id || index + 1,
          name: row.Name || row.name || 'Unknown',
          city: row.City || row.city || 'Unknown',
          amount: Number(row.Amount || row.amount || 0),
          date: row.Date || row.date || ''
        };
      }).filter(function (d) { return d.name && d.name !== 'Unknown'; });

      if (!donors.length) throw new Error('No rows found in donors.xlsx');
      callback(donors, 'excel');
    })
    .catch(function () {
      callback(FALLBACK_DONORS, 'fallback');
    });
}

/* ---------------------------------------------------------
   9. Monthly Subscription Gate — Maintenance + Payment overlay

   IMPORTANT — this is a soft, client-side-only reminder lock, not
   real security or real payment processing. GitHub Pages serves
   static files with no backend, so there is nothing that can verify
   a payment actually happened, and no shared storage that a visitor's
   browser and the admin's browser both see — only localStorage,
   which is private to each individual browser. Treat this as a
   monthly nudge + a single-browser approval workflow, not as real
   access control or a site-wide kill switch.

   How it works:
   - Each calendar month has a "period" key like "2026-08".
   - On every page load (except admin.html), if this browser isn't
     marked "granted" for the current period, a full-screen overlay
     covers the page: a maintenance notice, then (via "Renew Now") a
     payment screen with the UPI ID/QR, then (via "I've Paid") a
     "waiting for admin approval" screen. Paying no longer unlocks
     the site by itself — it only submits a claim.
   - The admin logs into admin.html (Section 10 below) on the SAME
     browser and either approves/rejects that claim, or grants/
     revokes access directly at any time. Because it's all
     localStorage, this only affects gating on that one browser/
     device — it does not reach other visitors. Two tabs of the SAME
     browser do share it though, so approving in an "admin" tab and
     clicking "Check Again" in the gated tab will unlock it live.
   --------------------------------------------------------- */

// UPDATE LATER:
// 1. upiId / qrImage — point these at whoever should receive the
//    monthly fee.
// 2. adminUsername / adminPassword — change these before publishing.
//    This is a public JS file, so anyone who views it can read the
//    credentials; this login is a workflow gate, not real security.
var SUBSCRIPTION_CONFIG = {
  feeAmount: 499,
  upiId: '7830260919@ptsbi',
  qrImage: 'images/qr/upi-qr-nitin.jpeg',
  adminUsername: 'nktyagi123',
  adminPassword: 'tyagi@321'
};

var SUB_ACCESS_KEY = 'dpf_sub_access';        // JSON: { status: 'granted'|'revoked'|'none', period: 'YYYY-MM' }
var SUB_CLAIMS_KEY = 'dpf_sub_claims';        // JSON array of { id, period, submittedAt, status }
var SUB_ADMIN_SESSION_KEY = 'dpf_sub_admin_session'; // sessionStorage flag, cleared when the tab closes

function getCurrentPeriod() {
  var now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
}

function formatCurrentMonthLabel() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function formatClaimTime(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getSubAccess() {
  try {
    return JSON.parse(localStorage.getItem(SUB_ACCESS_KEY)) || { status: 'none', period: '' };
  } catch (e) {
    return { status: 'none', period: '' };
  }
}

function setSubAccess(status, period) {
  localStorage.setItem(SUB_ACCESS_KEY, JSON.stringify({ status: status, period: period }));
}

function getSubClaims() {
  try {
    return JSON.parse(localStorage.getItem(SUB_CLAIMS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function setSubClaims(claims) {
  localStorage.setItem(SUB_CLAIMS_KEY, JSON.stringify(claims));
}

// A manual "revoked" always wins (lets the admin lock the site mid-month
// even if it was already granted); otherwise it must be granted for the
// current period specifically — a grant from last month doesn't carry over.
function isSubscriptionUnlocked() {
  var access = getSubAccess();
  if (access.status === 'revoked') return false;
  return access.status === 'granted' && access.period === getCurrentPeriod();
}

function initSubscriptionGate() {
  if (document.body.classList.contains('admin-page')) return; // admin.html is never gated
  if (isSubscriptionUnlocked()) return;
  renderSubscriptionOverlay();
}

function renderSubscriptionOverlay() {
  var cfg = SUBSCRIPTION_CONFIG;
  var monthLabel = formatCurrentMonthLabel();
  var currentPeriod = getCurrentPeriod();

  var overlay = document.createElement('div');
  overlay.className = 'subscription-overlay';
  overlay.innerHTML =
    '<div class="subscription-box">' +
      '<div id="subMaintenanceScreen" class="subscription-screen">' +
        '<div class="subscription-icon">🛠️</div>' +
        '<h2>Site Under Maintenance</h2>' +
        '<p>The monthly subscription for <strong>' + monthLabel + '</strong> has not been renewed yet. ' +
          'The site will be back online as soon as this is completed and approved.</p>' +
        '<button type="button" class="btn btn-primary btn-block" id="subRenewBtn">Renew Now — &#8377;' + cfg.feeAmount + '</button>' +
      '</div>' +
      '<div id="subPaymentScreen" class="subscription-screen">' +
        '<div class="subscription-icon">📱</div>' +
        '<h2>Renew Subscription</h2>' +
        '<div class="subscription-fee">&#8377;' + cfg.feeAmount + ' / month</div>' +
        '<div class="qr-box"><img src="' + cfg.qrImage + '" alt="Subscription payment UPI QR code"></div>' +
        '<div class="upi-row">' +
          '<span>UPI ID:</span>' +
          '<span class="upi-id" id="subUpiIdText">' + cfg.upiId + '</span>' +
          '<button type="button" class="copy-btn" data-copy-target="subUpiIdText">Copy</button>' +
        '</div>' +
        '<p>Scan the QR code or pay to the UPI ID above using any UPI app, then confirm below.</p>' +
        '<button type="button" class="btn btn-primary btn-block" id="subConfirmBtn">I\'ve Paid — Notify Admin</button>' +
        '<p class="subscription-note">The admin reviews and approves this before the site unlocks — see admin.html.</p>' +
      '</div>' +
      '<div id="subPendingScreen" class="subscription-screen">' +
        '<div class="subscription-icon">⏳</div>' +
        '<h2>Payment Submitted</h2>' +
        '<p>Your payment confirmation for <strong>' + monthLabel + '</strong> has been sent to the site admin. ' +
          'The site will unlock automatically once it is approved.</p>' +
        '<button type="button" class="btn btn-outline-blue btn-block" id="subRecheckBtn">Check Again</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  var screens = {
    maintenance: overlay.querySelector('#subMaintenanceScreen'),
    payment: overlay.querySelector('#subPaymentScreen'),
    pending: overlay.querySelector('#subPendingScreen')
  };

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('active', key === name);
    });
  }

  // If this browser already has a pending claim for the current period,
  // open straight on the "waiting for approval" screen.
  var latestClaimThisPeriod = getSubClaims().slice().reverse().filter(function (c) {
    return c.period === currentPeriod;
  })[0];
  showScreen(latestClaimThisPeriod && latestClaimThisPeriod.status === 'pending' ? 'pending' : 'maintenance');

  overlay.querySelector('#subRenewBtn').addEventListener('click', function () {
    showScreen('payment');
  });

  overlay.querySelector('#subConfirmBtn').addEventListener('click', function () {
    var claims = getSubClaims();
    claims.push({
      id: Date.now(),
      period: currentPeriod,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    });
    setSubClaims(claims);
    showScreen('pending');
  });

  overlay.querySelector('#subRecheckBtn').addEventListener('click', function () {
    if (isSubscriptionUnlocked()) {
      document.body.style.overflow = '';
      overlay.remove();
      return;
    }
    // Still locked — if the claim was rejected (or there's none), let them pay again.
    var latest = getSubClaims().slice().reverse().filter(function (c) {
      return c.period === currentPeriod;
    })[0];
    if (!latest || latest.status === 'rejected') showScreen('maintenance');
  });
}

/* ---------------------------------------------------------
   10. Admin Panel (admin.html) — Subscription approvals

   Client-side login (username/password from SUBSCRIPTION_CONFIG
   above) gating a small dashboard that reads/writes the same
   localStorage keys as Section 9. Lets the admin:
     - Grant or revoke access on this browser, at any time.
     - Approve or reject pending "I've Paid" claims.
   As noted in Section 9, this only controls gating on whichever
   browser/device admin.html is opened in.
   --------------------------------------------------------- */
function initAdminPanel() {
  var app = document.getElementById('adminApp');
  if (!app) return; // only runs on admin.html

  var cfg = SUBSCRIPTION_CONFIG;
  var loginView = document.getElementById('adminLoginView');
  var dashboardView = document.getElementById('adminDashboardView');
  var logoutBtn = document.getElementById('adminLogoutBtn');
  var loginBtn = document.getElementById('adminLoginBtn');
  var errorText = document.getElementById('adminLoginError');

  function showLoggedIn() {
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
    renderDashboard();
  }

  function showLoggedOut() {
    loginView.style.display = 'block';
    dashboardView.style.display = 'none';
    logoutBtn.style.display = 'none';
  }

  loginBtn.addEventListener('click', function () {
    var user = document.getElementById('adminUsername').value.trim();
    var pass = document.getElementById('adminPassword').value;

    if (user === cfg.adminUsername && pass === cfg.adminPassword) {
      sessionStorage.setItem(SUB_ADMIN_SESSION_KEY, 'true');
      errorText.style.display = 'none';
      showLoggedIn();
    } else {
      errorText.style.display = 'block';
    }
  });

  ['adminUsername', 'adminPassword'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
      if (e.key === 'Enter') loginBtn.click();
    });
  });

  logoutBtn.addEventListener('click', function () {
    sessionStorage.removeItem(SUB_ADMIN_SESSION_KEY);
    showLoggedOut();
  });

  function renderDashboard() {
    var currentPeriod = getCurrentPeriod();
    var monthLabel = formatCurrentMonthLabel();
    var access = getSubAccess();
    var statusText = document.getElementById('adminStatusText');

    if (access.status === 'revoked') {
      statusText.innerHTML = '<span class="admin-badge admin-badge-danger">Revoked</span> Access is manually locked until you grant it again.';
    } else if (access.status === 'granted' && access.period === currentPeriod) {
      statusText.innerHTML = '<span class="admin-badge admin-badge-success">Granted</span> Site is unlocked here for ' + monthLabel + '.';
    } else {
      statusText.innerHTML = '<span class="admin-badge admin-badge-warning">Locked</span> Site is showing the maintenance/payment screen (no valid grant for ' + monthLabel + ').';
    }

    renderClaims();
  }

  document.getElementById('adminGrantBtn').addEventListener('click', function () {
    setSubAccess('granted', getCurrentPeriod());
    renderDashboard();
  });

  document.getElementById('adminRevokeBtn').addEventListener('click', function () {
    setSubAccess('revoked', getCurrentPeriod());
    renderDashboard();
  });

  function renderClaims() {
    var claims = getSubClaims();
    var pendingWrap = document.getElementById('adminPendingClaims');
    var historyWrap = document.getElementById('adminClaimHistory');

    var pending = claims.filter(function (c) { return c.status === 'pending'; }).reverse();
    var history = claims.filter(function (c) { return c.status !== 'pending'; }).slice(-10).reverse();

    pendingWrap.innerHTML = pending.length ? '' : '<p class="admin-empty">No pending claims.</p>';
    pending.forEach(function (claim) {
      var row = document.createElement('div');
      row.className = 'admin-claim-row';
      row.innerHTML =
        '<div>' +
          '<strong>' + claim.period + '</strong>' +
          '<span class="admin-claim-time"> — submitted ' + formatClaimTime(claim.submittedAt) + '</span>' +
        '</div>' +
        '<div class="admin-claim-actions">' +
          '<button type="button" class="btn btn-primary" data-claim-id="' + claim.id + '" data-action="approve">Grant</button>' +
          '<button type="button" class="btn btn-outline-blue" data-claim-id="' + claim.id + '" data-action="reject">Reject</button>' +
        '</div>';
      pendingWrap.appendChild(row);
    });

    historyWrap.innerHTML = history.length ? '' : '<p class="admin-empty">No history yet.</p>';
    history.forEach(function (claim) {
      var row = document.createElement('div');
      row.className = 'admin-claim-row admin-claim-row-history';
      row.innerHTML =
        '<div>' +
          '<strong>' + claim.period + '</strong>' +
          '<span class="admin-claim-time"> — ' + formatClaimTime(claim.submittedAt) + '</span>' +
        '</div>' +
        '<span class="admin-badge admin-badge-' + (claim.status === 'approved' ? 'success' : 'danger') + '">' + claim.status + '</span>';
      historyWrap.appendChild(row);
    });

    pendingWrap.querySelectorAll('button[data-claim-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = Number(btn.getAttribute('data-claim-id'));
        var action = btn.getAttribute('data-action');
        var allClaims = getSubClaims();
        var claim = allClaims.filter(function (c) { return c.id === id; })[0];
        if (!claim) return;

        if (action === 'approve') {
          claim.status = 'approved';
          setSubAccess('granted', claim.period);
        } else {
          claim.status = 'rejected';
        }
        setSubClaims(allClaims);
        renderDashboard();
      });
    });
  }

  if (sessionStorage.getItem(SUB_ADMIN_SESSION_KEY) === 'true') {
    showLoggedIn();
  } else {
    showLoggedOut();
  }
}
