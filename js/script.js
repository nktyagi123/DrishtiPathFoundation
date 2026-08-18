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
   3. Top Donors Slideshow (Home page)
   4. Animated Impact Counters (Home page)
   5. Certificate Modal / Lightbox
   6. Contact Form Validation
   7. Donate Page — Copy-to-clipboard buttons (UPI ID, bank details)
   8. Donor Table — Excel loading, search, sort (donors.html)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initScrollTopButton();
  initDonorSlideshow();
  initImpactCounters();
  initCertificateModal();
  initContactForm();
  initCopyButtons();
  initDonorTable();
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
   3. Top Donors Slideshow
   Auto-advances every 5 seconds, supports prev/next
   buttons and clickable indicator dots. Loops forever.
   --------------------------------------------------------- */
function initDonorSlideshow() {
  var slider = document.getElementById('donorSlider');
  if (!slider) return;

  var slides = Array.prototype.slice.call(slider.querySelectorAll('.donor-slide'));
  var dotsWrap = document.getElementById('sliderDots');
  var prevBtn = document.getElementById('sliderPrev');
  var nextBtn = document.getElementById('sliderNext');
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
