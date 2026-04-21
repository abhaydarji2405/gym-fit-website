/* ============================================================
   main.js  –  Slider + Form Validation + Popups
   ============================================================ */

'use strict';

/* ---- Helpers ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. INTERSECTION OBSERVER  (scroll-in animations)
   ============================================================ */
const animEls = $$('[data-animate]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

animEls.forEach((el, i) => {
  // stagger delay
  el.style.transitionDelay = `${i * 0.8}s`;
  observer.observe(el);
});

/* ============================================================
   2. NAVBAR – hamburger toggle
   ============================================================ */
const hamburger = $('#hamburger');
const navLinks  = $('.nav-links');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('mobile-open');
});

// Close mobile menu when a link is clicked
$$('.nav-links a').forEach((a) =>
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
  })
);

/* ============================================================
   3. SLIDER
   ============================================================ */
const track    = $('#sliderTrack');
const prevBtn  = $('#prevBtn');
const nextBtn  = $('#nextBtn');
const slides   = $$('.slide', track);
const total    = slides.length;
let   current  = 0;
let   autoPlay = null;

function getSlideWidth() {
  // Each slide is 84% of viewport minus gap; match CSS gap: 18px
  return slides[0].getBoundingClientRect().width + 18;
}

function goTo(index) {
  current = (index + total) % total;

  // Move track
  const offset = current * getSlideWidth();
  track.style.transform = `translateX(-${offset}px)`;

  // Active class for brightness effect
  slides.forEach((s, i) => s.classList.toggle('active', i === current));
}

function startAutoPlay() {
  autoPlay = setInterval(() => goTo(current + 1), 4000);
}

function stopAutoPlay() {
  clearInterval(autoPlay);
}

nextBtn?.addEventListener('click', () => { stopAutoPlay(); goTo(current + 1); startAutoPlay(); });
prevBtn?.addEventListener('click', () => { stopAutoPlay(); goTo(current - 1); startAutoPlay(); });

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { stopAutoPlay(); goTo(current + 1); startAutoPlay(); }
  if (e.key === 'ArrowLeft')  { stopAutoPlay(); goTo(current - 1); startAutoPlay(); }
});

// Touch / swipe support
let touchStartX = 0;
track?.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

track?.addEventListener('touchend', (e) => {
  const delta = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) > 40) {
    stopAutoPlay();
    delta > 0 ? goTo(current + 1) : goTo(current - 1);
    startAutoPlay();
  }
});

// Recalculate on resize (slide widths change with viewport)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => goTo(current), 100);
});

// Init
goTo(0);
startAutoPlay();

/* ============================================================
   4. POPUP HELPERS
   ============================================================ */
const overlay    = $('#popupOverlay');
const popup      = $('#popup');
const popupClose = $('#popupClose');
const popupIcon  = $('#popupIcon');
const popupTitle = $('#popupTitle');
const popupMsg   = $('#popupMsg');

function showPopup(type, title, message) {
  popup.className = `popup ${type}`;
  popupIcon.textContent  = type === 'success' ? '🎉' : '⚠️';
  popupTitle.textContent = title;
  popupMsg.textContent   = message;
  overlay.classList.add('active');

  // Auto-close success after 4 s
  if (type === 'success') {
    setTimeout(closePopup, 4000);
  }
}

function closePopup() {
  overlay.classList.remove('active');
}

popupClose?.addEventListener('click', closePopup);
overlay?.addEventListener('click', (e) => {
  if (e.target === overlay) closePopup();
});

/* ============================================================
   5. FORM VALIDATION & SUBMISSION
   ============================================================ */
const form           = $('#subscribeForm');
const firstNameInput = $('#firstName');
const emailInput     = $('#email');
const firstNameError = $('#firstNameError');
const emailError     = $('#emailError');

// Live: clear error as user types
firstNameInput?.addEventListener('input', () => clearError(firstNameInput, firstNameError));
emailInput?.addEventListener('input',     () => clearError(emailInput,     emailError));

function clearError(input, errorEl) {
  input.classList.remove('error-field');
  errorEl.textContent = '';
  // Re-trigger animation on next error
  errorEl.style.animation = 'none';
}

function setError(input, errorEl, msg) {
  input.classList.add('error-field');
  errorEl.textContent = msg;
  // Retrigger shake animation
  errorEl.style.animation = 'none';
  requestAnimationFrame(() => {
    errorEl.style.animation = '';
  });
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const firstName = firstNameInput.value.trim();
  const email     = emailInput.value.trim();
  let   valid     = true;

  // --- Validate First Name ---
  if (!firstName) {
    setError(firstNameInput, firstNameError, 'First name is required.');
    valid = false;
  } else if (firstName.length < 2) {
    setError(firstNameInput, firstNameError, 'Name must be at least 2 characters.');
    valid = false;
  } else {
    clearError(firstNameInput, firstNameError);
  }

  // --- Validate Email ---
  if (!email) {
    setError(emailInput, emailError, 'Email address is required.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setError(emailInput, emailError, 'Please enter a valid email.');
    valid = false;
  } else {
    clearError(emailInput, emailError);
  }

  if (!valid) {
    // showPopup(
    //   'error',
    //   'OOPS!',
    //   'Please fill in all required fields correctly before subscribing.'
    // );
    return;
  }

  // ---- Store subscriber data ----
  const subscriber = {
    firstName,
    email,
    subscribedAt: new Date().toISOString(),
  };

  // Persist to localStorage (append to existing list)
  const existing = JSON.parse(localStorage.getItem('subscribers') || '[]');
  existing.push(subscriber);
  localStorage.setItem('subscribers', JSON.stringify(existing));

  // Log for debug
  console.log('New subscriber:', subscriber);

  // ---- Success ----
  showPopup(
    'success',
    'YOU\'RE IN!',
    `Welcome to the tribe, ${firstName}! Check your inbox at ${email} for what's next.`
  );

  // Clear form
  form.reset();
  clearError(firstNameInput, firstNameError);
  clearError(emailInput, emailError);
});
