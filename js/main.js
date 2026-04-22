/* ============================================================
   main.js  –  Slider + Form Validation + Popups
   ============================================================ */

"use strict";

/* ---- Helpers ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. INTERSECTION OBSERVER  (scroll-in animations)
   ============================================================ */
const animEls = $$("[data-animate]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);

animEls.forEach((el, i) => {
  // If element has an explicit delay attribute, honour it; otherwise stagger
  const customDelay = el.dataset.animateDelay;
  el.style.transitionDelay =
    customDelay !== undefined ? `${customDelay}s` : `${i * 0.2}s`;
  observer.observe(el);
});

/* ============================================================
   2. NAVBAR – hamburger toggle
   ============================================================ */
const hamburger = $("#hamburger");
const navLinks = $(".nav-links");

hamburger?.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("mobile-open");
});

// Close mobile menu when a link is clicked
$$(".nav-links a").forEach((a) =>
  a.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("mobile-open");
  }),
);

/* ============================================================
   3. SLIDER
   ============================================================ */
const track = $("#sliderTrack");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const slides = $$(".slide", track);
const total = slides.length;
let current = 0;
let autoPlay = null;

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
  slides.forEach((s, i) => s.classList.toggle("active", i === current));
}

function startAutoPlay() {
  autoPlay = setInterval(() => goTo(current + 1), 4000);
}

function stopAutoPlay() {
  clearInterval(autoPlay);
}

nextBtn?.addEventListener("click", () => {
  stopAutoPlay();
  goTo(current + 1);
  startAutoPlay();
});
prevBtn?.addEventListener("click", () => {
  stopAutoPlay();
  goTo(current - 1);
  startAutoPlay();
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    stopAutoPlay();
    goTo(current + 1);
    startAutoPlay();
  }
  if (e.key === "ArrowLeft") {
    stopAutoPlay();
    goTo(current - 1);
    startAutoPlay();
  }
});

// Touch / swipe support
let touchStartX = 0;
track?.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
  },
  { passive: true },
);

track?.addEventListener("touchend", (e) => {
  const delta = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) > 40) {
    stopAutoPlay();
    delta > 0 ? goTo(current + 1) : goTo(current - 1);
    startAutoPlay();
  }
});

// Recalculate on resize (slide widths change with viewport)
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => goTo(current), 100);
});

// Init
goTo(0);
startAutoPlay();

/* ============================================================
   4. POPUP HELPERS
   ============================================================ */
const overlay = $("#popupOverlay");
const popup = $("#popup");
const popupClose = $("#popupClose");
const popupIcon = $("#popupIcon");
const popupTitle = $("#popupTitle");
const popupMsg = $("#popupMsg");

function showPopup(type, title, message) {
  popup.className = `popup ${type}`;
  popupIcon.textContent = type === "success" ? "🎉" : "⚠️";
  popupTitle.textContent = title;
  popupMsg.textContent = message;
  overlay.classList.add("active");

  // Auto-close success after 4 s
  if (type === "success") {
    setTimeout(closePopup, 4000);
  }
}

function closePopup() {
  overlay.classList.remove("active");
}

popupClose?.addEventListener("click", closePopup);
overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) closePopup();
});

/* ============================================================
   5. FORM VALIDATION & SUBMISSION
   ============================================================ */
const form = $("#subscribeForm");
const firstNameInput = $("#firstName");
const emailInput = $("#email");
const firstNameError = $("#firstNameError");
const emailError = $("#emailError");

// Live: clear error as user types
firstNameInput?.addEventListener("input", () =>
  clearError(firstNameInput, firstNameError),
);
emailInput?.addEventListener("input", () => clearError(emailInput, emailError));

function clearError(input, errorEl) {
  input.classList.remove("error-field");
  errorEl.textContent = "";
  // Re-trigger animation on next error
  errorEl.style.animation = "none";
}

function setError(input, errorEl, msg) {
  input.classList.add("error-field");
  errorEl.textContent = msg;
  // Retrigger shake animation
  errorEl.style.animation = "none";
  requestAnimationFrame(() => {
    errorEl.style.animation = "";
  });
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const firstName = firstNameInput.value.trim();
  const email = emailInput.value.trim();
  let valid = true;

  // --- Validate First Name ---
  if (!firstName) {
    setError(firstNameInput, firstNameError, "First name is required.");
    valid = false;
  } else if (firstName.length < 2) {
    setError(
      firstNameInput,
      firstNameError,
      "Name must be at least 2 characters.",
    );
    valid = false;
  } else {
    clearError(firstNameInput, firstNameError);
  }

  // --- Validate Email ---
  if (!email) {
    setError(emailInput, emailError, "Email address is required.");
    valid = false;
  } else if (!isValidEmail(email)) {
    setError(emailInput, emailError, "Please enter a valid email.");
    valid = false;
  } else {
    clearError(emailInput, emailError);
  }

  if (!valid) {
    /*     showPopup(
      'error',
      'OOPS!',
      'Please fill in all required fields correctly before subscribing.'
    ); */
    return;
  }

  // ---- Store subscriber data ----
  const subscriber = {
    firstName,
    email,
    subscribedAt: new Date().toISOString(),
  };

  // TODO: Subscriber Form

  // Log for debug
  console.log("New subscriber:", subscriber);

  // ---- Success ----
  showPopup(
    "success",
    "YOU'RE IN!",
    `Welcome to the tribe, ${firstName}! Check your inbox at ${email} for what's next.`,
  );

  // Clear form
  form.reset();
  clearError(firstNameInput, firstNameError);
  clearError(emailInput, emailError);
});

/* ============================================================
   6. MENTORSHIP CAROUSEL  (mobile swipeable, desktop grid)
   ============================================================ */
const msTrack    = $("#mentorshipTrack");
const msPrevBtn  = $("#msPrev");
const msNextBtn  = $("#msNext");
const msDotEls   = $$(".ms-dot");
const msCardEls  = $$(".ms-card", msTrack);
const msTotal    = msCardEls.length;
let   msCurrent  = 0;

function isMobileView() {
  return window.innerWidth <= 767;
}

function getMsViewportWidth() {
  // Card is flex: 0 0 100% of the viewport, so card offsetWidth === viewport offsetWidth
  return document.querySelector(".mentorship-viewport")?.offsetWidth ?? 0;
}

function msGoTo(index) {
  msCurrent = ((index % msTotal) + msTotal) % msTotal;

  if (isMobileView()) {
    const offset = msCurrent * getMsViewportWidth();
    msTrack.style.transform = `translateX(-${offset}px)`;
  }

  // Update dots
  msDotEls.forEach((d, i) => d.classList.toggle("active", i === msCurrent));
}

msPrevBtn?.addEventListener("click", () => msGoTo(msCurrent - 1));
msNextBtn?.addEventListener("click", () => msGoTo(msCurrent + 1));

// Dot click navigation
msDotEls.forEach((dot, i) => dot.addEventListener("click", () => msGoTo(i)));

// Touch / swipe on the track
let msTouchStartX = 0;
msTrack?.addEventListener("touchstart", (e) => {
  msTouchStartX = e.touches[0].clientX;
}, { passive: true });

msTrack?.addEventListener("touchend", (e) => {
  if (!isMobileView()) return;
  const delta = msTouchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) > 40) {
    delta > 0 ? msGoTo(msCurrent + 1) : msGoTo(msCurrent - 1);
  }
});

// On resize: re-apply correct position or clear transform for desktop
let msResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(msResizeTimer);
  msResizeTimer = setTimeout(() => {
    if (isMobileView()) {
      msGoTo(msCurrent);
    } else {
      msTrack.style.transform = "";
      msCurrent = 0;
      msDotEls.forEach((d, i) => d.classList.toggle("active", i === 0));
    }
  }, 120);
});

// Init
msGoTo(0);

/* ============================================================
   7. MENTORSHIP CHECKOUT MODAL + PAYMENT STATUS
   ============================================================ */
const checkoutOverlay = $("#checkoutOverlay");
const checkoutModal = $(".checkout-modal");
const checkoutClose = $("#checkoutClose");
const checkoutForm = $("#checkoutForm");
const checkoutSelectedCard = $("#checkoutSelectedCard");

const checkoutName = $("#checkoutName");
const checkoutPhone = $("#checkoutPhone");
const checkoutEmail = $("#checkoutEmail");
const checkoutNote = $("#checkoutNote");

const checkoutNameError = $("#checkoutNameError");
const checkoutPhoneError = $("#checkoutPhoneError");
const checkoutEmailError = $("#checkoutEmailError");
const checkoutNoteError = $("#checkoutNoteError");

const paymentOverlay = $("#paymentOverlay");
const paymentModal = $(".payment-modal");
const paymentClose = $("#paymentClose");
const paymentStatusIcon = $("#paymentStatusIcon");
const paymentStatusTitle = $("#paymentStatusTitle");
const paymentStatusMessage = $("#paymentStatusMessage");
const paymentExternalMessage = $("#paymentExternalMessage");

let selectedMentorshipCard = null;
let itiInstance = null;

if (window.intlTelInput && checkoutPhone) {
  itiInstance = window.intlTelInput(checkoutPhone, {
    initialCountry: "ca",
    nationalMode: true,
    autoPlaceholder: "aggressive",
    strictMode: false,
    separateDialCode: true,
    utilsScript:
      "https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js",
  });
}

function clearCheckoutFieldError(input, errorEl) {
  input?.classList.remove("error-field");
  if (errorEl) {
    errorEl.textContent = "";
  }
}

function setCheckoutFieldError(input, errorEl, message) {
  input?.classList.add("error-field");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function resetCheckoutValidation() {
  clearCheckoutFieldError(checkoutName, checkoutNameError);
  clearCheckoutFieldError(checkoutPhone, checkoutPhoneError);
  clearCheckoutFieldError(checkoutEmail, checkoutEmailError);
  clearCheckoutFieldError(checkoutNote, checkoutNoteError);
}

function getSelectedCardData(cardEl) {
  return {
    title: $(".ms-card-title", cardEl)?.textContent?.trim() ?? "Unknown Plan",
    price: $(".ms-price-badge", cardEl)?.textContent?.trim() ?? "",
    priceType: $(".ms-price-label", cardEl)?.textContent?.trim() ?? "",
  };
}

function openCheckoutModal(cardEl) {
  selectedMentorshipCard = cardEl;
  const cardData = getSelectedCardData(cardEl);
  checkoutSelectedCard.innerHTML = `
    <span class="checkout-selected-label">Selected Plan:</span>
    <span class="checkout-selected-plan">${cardData.title}</span>
    <span class="checkout-selected-amount">${cardData.price}</span>
  `;
  checkoutOverlay.classList.add("active");
  checkoutOverlay.setAttribute("aria-hidden", "false");
}

function closeCheckoutModal() {
  checkoutOverlay.classList.remove("active");
  checkoutOverlay.setAttribute("aria-hidden", "true");
}

function showPaymentStatus(isSuccess) {
  paymentModal.className = `payment-modal ${isSuccess ? "success" : "failed"}`;

  if (isSuccess) {
    paymentStatusIcon.textContent = "🎉";
    paymentStatusTitle.textContent = "Payment Successful";
    paymentStatusMessage.textContent = "Payment successful. We will contact you soon.";
  } else {
    paymentStatusIcon.textContent = "⚠️";
    paymentStatusTitle.textContent = "Payment Failed";
    paymentStatusMessage.textContent =
      "Payment failed. Please try again after some time. If amount is debited, our team will verify and contact you.";
  }

  if (paymentExternalMessage) {
    paymentExternalMessage.textContent = "";
    paymentExternalMessage.hidden = true;
  }

  paymentOverlay.classList.add("active");
  paymentOverlay.setAttribute("aria-hidden", "false");
}

function showPaymentSuccessModal(externalMessage = "") {
  showPaymentStatus(true);
  if (paymentExternalMessage && externalMessage.trim()) {
    paymentExternalMessage.textContent = externalMessage.trim();
    paymentExternalMessage.hidden = false;
  }
}

function showPaymentFailedModal(externalMessage = "") {
  paymentModal.className = "payment-modal failed";
  paymentStatusIcon.textContent = "⚠️";
  paymentStatusTitle.textContent = "Payment Failed";
  paymentStatusMessage.textContent = "Payment failed. Please try again later.";

  if (paymentExternalMessage && externalMessage.trim()) {
    paymentExternalMessage.textContent = externalMessage.trim();
    paymentExternalMessage.hidden = false;
  } else if (paymentExternalMessage) {
    paymentExternalMessage.textContent = "";
    paymentExternalMessage.hidden = true;
  }

  paymentOverlay.classList.add("active");
  paymentOverlay.setAttribute("aria-hidden", "false");
}

function closePaymentStatus() {
  paymentOverlay.classList.remove("active");
  paymentOverlay.setAttribute("aria-hidden", "true");
}

function isValidCheckoutEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function sanitizePhoneInput(value) {
  return value.replace(/[^0-9\s-]/g, "");
}

function validateCheckoutForm() {
  const nameVal = checkoutName.value.trim();
  const phoneVal = checkoutPhone.value.trim();
  const emailVal = checkoutEmail.value.trim();
  const noteVal = checkoutNote.value.trim();
  let isValid = true;

  resetCheckoutValidation();

  if (!nameVal) {
    setCheckoutFieldError(checkoutName, checkoutNameError, "Name is required.");
    isValid = false;
  }

  if (!phoneVal) {
    setCheckoutFieldError(checkoutPhone, checkoutPhoneError, "Mobile number is required.");
    isValid = false;
  }
  // Phone format validation intentionally disabled for now.
  // else if (itiInstance && !itiInstance.isValidNumber()) {
  //   setCheckoutFieldError(checkoutPhone, checkoutPhoneError, "Please enter a valid mobile number.");
  //   isValid = false;
  // }

  if (!emailVal) {
    setCheckoutFieldError(checkoutEmail, checkoutEmailError, "Email is required.");
    isValid = false;
  } else if (!isValidCheckoutEmail(emailVal)) {
    setCheckoutFieldError(checkoutEmail, checkoutEmailError, "Please enter a valid email.");
    isValid = false;
  }

  /* if (!noteVal) {
    setCheckoutFieldError(checkoutNote, checkoutNoteError, "Note is required.");
    isValid = false;
  } */

  return isValid;
}

function getPhoneWithCountryCode() {
  if (itiInstance) {
    return itiInstance.getNumber();
  }
  return checkoutPhone.value.trim();
}

$$(".ms-learn-btn").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    const card = event.currentTarget.closest(".ms-card");
    if (card) {
      openCheckoutModal(card);
    }
  });
});

checkoutClose?.addEventListener("click", closeCheckoutModal);
checkoutOverlay?.addEventListener("click", (event) => {
  if (event.target === checkoutOverlay) {
    closeCheckoutModal();
  }
});

paymentClose?.addEventListener("click", closePaymentStatus);
paymentOverlay?.addEventListener("click", (event) => {
  if (event.target === paymentOverlay) {
    closePaymentStatus();
  }
});

checkoutName?.addEventListener("input", () =>
  clearCheckoutFieldError(checkoutName, checkoutNameError),
);
checkoutPhone?.addEventListener("input", (event) => {
  const cleanedValue = sanitizePhoneInput(event.target.value);
  if (event.target.value !== cleanedValue) {
    event.target.value = cleanedValue;
  }
  clearCheckoutFieldError(checkoutPhone, checkoutPhoneError);
});
checkoutEmail?.addEventListener("input", () =>
  clearCheckoutFieldError(checkoutEmail, checkoutEmailError),
);
checkoutNote?.addEventListener("input", () =>
  clearCheckoutFieldError(checkoutNote, checkoutNoteError),
);

checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateCheckoutForm()) {
    return;
  }

  const selectedCardData = selectedMentorshipCard
    ? getSelectedCardData(selectedMentorshipCard)
    : { title: "Unknown Plan", price: "", priceType: "" };

  const checkoutPayload = {
    selectedCard: selectedCardData,
    name: checkoutName.value.trim(),
    mobileNumber: getPhoneWithCountryCode(),
    email: checkoutEmail.value.trim(),
    note: checkoutNote.value.trim(),
  };

  console.log("Mentorship checkout submit:", checkoutPayload);

  // TODO: Integrate your real payment gateway result here.
  // Replace this with gateway callback response.
  const paymentSuccess = true;

  const modalExternalMessage = ""; //TODO: Add any content like transaction ID or anything else.

  if (paymentSuccess) {
    closeCheckoutModal();
    showPaymentSuccessModal(modalExternalMessage);
    checkoutForm.reset();
    resetCheckoutValidation();
    if (itiInstance) {
      itiInstance.setCountry("ca");
    }
  } else {
    closeCheckoutModal();
    showPaymentFailedModal(modalExternalMessage);
  }
});
