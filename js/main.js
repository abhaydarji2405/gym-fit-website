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

// ...navbar hamburger/menu logic removed: only single link shown for all views...

/* ============================================================
   3. POPUP HELPERS
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

  // Auto-close success after 10 s
  if (type === "success") {
    setTimeout(closePopup, 10000);
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
  4. FORM VALIDATION & SUBMISSION
   ============================================================ */
const form = $("#subscribeForm");
const firstNameInput = $("#firstName");
const emailInput = $("#email");
const firstNameError = $("#firstNameError");
const emailError = $("#emailError");
const heroSubmitError = $("#heroSubmitError");
const heroSubmitBtn = $("#heroSubmitBtn");

let isHeroSubscribeLoading = false;

/* ---- Hero Subscribe: State + UI helpers ---- */
function setHeroSubscribeLoadingState(isLoading) {
  isHeroSubscribeLoading = isLoading;

  if (!heroSubmitBtn) {
    return;
  }

  heroSubmitBtn.disabled = isLoading;
  heroSubmitBtn.classList.toggle("is-loading", isLoading);
  heroSubmitBtn.setAttribute("aria-busy", String(isLoading));
}

/* ---- Hero Subscribe: Validation helpers ---- */
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

function clearHeroSubmitError() {
  if (heroSubmitError) {
    heroSubmitError.textContent = "";
  }
}

/* ---- Hero Subscribe: Event bindings ---- */
function bindHeroSubscribeEvents() {
  // Live: clear field and submit errors while typing.
  firstNameInput?.addEventListener("input", () => {
    clearError(firstNameInput, firstNameError);
    clearHeroSubmitError();
  });

  emailInput?.addEventListener("input", () => {
    clearError(emailInput, emailError);
    clearHeroSubmitError();
  });
}

bindHeroSubscribeEvents();

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isHeroSubscribeLoading) {
    return;
  }

  const firstName = firstNameInput.value.trim();
  const email = emailInput.value.trim();
  let valid = true;

  clearHeroSubmitError();

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

  setHeroSubscribeLoadingState(true);

  // ---- Store subscriber data ----
  const subscriber = {
    firstName,
    email,
    subscribedAt: new Date().toISOString(),
  };

  // TODO: HERO SECTION SUBSCRIBE

  // await new Promise((resolve) => setTimeout(resolve, 5000));

  // Log for debug
  console.log("New subscriber:", subscriber);

  const isSuccess = true;

  if (!isSuccess) {
    setHeroSubscribeLoadingState(false);
    if (heroSubmitError) {
      heroSubmitError.textContent =
        "Something went wrong. Please try again in a moment.";
    }
    return;
  }

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
  if (heroSubmitError) {
    heroSubmitError.textContent = "";
  }
  setHeroSubscribeLoadingState(false);
});

/* ============================================================
   6. MENTORSHIP CAROUSEL  (mobile swipeable, desktop grid)
   ============================================================ */
const msTrack = $("#mentorshipTrack");
const msPrevBtn = $("#msPrev");
const msNextBtn = $("#msNext");
const msDotEls = $$(".ms-dot");
const msCardEls = $$(".ms-card", msTrack);
const msTotal = msCardEls.length;
let msCurrent = 0;

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
msTrack?.addEventListener(
  "touchstart",
  (e) => {
    msTouchStartX = e.touches[0].clientX;
  },
  { passive: true },
);

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
const checkoutSubmitBtn = $("#checkoutSubmitBtn");
const checkoutSelectedCard = $("#checkoutSelectedCard");
const checkoutPlanQuestions = $("#checkoutPlanQuestions");

const checkoutName = $("#checkoutName");
const checkoutPhone = $("#checkoutPhone");
const checkoutEmail = $("#checkoutEmail");
const checkoutNote = $("#checkoutNote");
const checkoutDatePicker = $("#checkoutDatePicker");
const checkoutDateButton = $("#checkoutDateButton");
const checkoutDateInput = $("#checkoutDate");
const checkoutDatePopover = $("#checkoutDatePopover");
const checkoutDatePrev = $("#checkoutDatePrev");
const checkoutDateNext = $("#checkoutDateNext");
const checkoutDateMonth = $("#checkoutDateMonth");
const checkoutDateGrid = $("#checkoutDateGrid");
const checkoutTimePicker = $("#checkoutTimePicker");
const checkoutTimeButton = $("#checkoutTimeButton");
const checkoutTimeInput = $("#checkoutTime");
const checkoutTimePopover = $("#checkoutTimePopover");
const checkoutTimeList = $("#checkoutTimeList");

const checkoutQuestionLabels = [
  $("#checkoutQuestion1Label"),
  $("#checkoutQuestion2Label"),
  $("#checkoutQuestion3Label"),
  $("#checkoutQuestion4Label"),
  $("#checkoutQuestion5Label"),
];

const checkoutQuestionInputs = [
  $("#checkoutQuestion1"),
  $("#checkoutQuestion2"),
  $("#checkoutQuestion3"),
  $("#checkoutQuestion4"),
  $("#checkoutQuestion5"),
];

const checkoutNameError = $("#checkoutNameError");
const checkoutPhoneError = $("#checkoutPhoneError");
const checkoutEmailError = $("#checkoutEmailError");
const checkoutNoteError = $("#checkoutNoteError");
const checkoutDateError = $("#checkoutDateError");
const checkoutTimeError = $("#checkoutTimeError");
const checkoutQuestionErrors = [
  $("#checkoutQuestion1Error"),
  $("#checkoutQuestion2Error"),
  $("#checkoutQuestion3Error"),
  $("#checkoutQuestion4Error"),
  $("#checkoutQuestion5Error"),
];

const paymentOverlay = $("#paymentOverlay");
const paymentModal = $(".payment-modal");
const paymentClose = $("#paymentClose");
const paymentStatusIcon = $("#paymentStatusIcon");
const paymentStatusTitle = $("#paymentStatusTitle");
const paymentStatusMessage = $("#paymentStatusMessage");
const paymentQueryMessage = $("#paymentQueryMessage");
const paymentQueryDetails = $("#paymentQueryDetails");
const paymentExternalMessage = $("#paymentExternalMessage");

let selectedMentorshipCard = null;
let isCheckoutLoading = false;
let selectedCheckoutPlan = null;
let checkoutPlansConfig = null;
let currentCalendarMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1,
);
let selectedAvailabilityDate = "";
const availableSlotsByDate = new Map();
const availableDateKeys = new Set();
const availabilityCacheByPlanId = new Map();
const availabilityFetchPromisesByPlanId = new Map();
const availabilityWindowResponseCache = new Map();
const availabilityWindowInFlightByKey = new Map();
let hasStartedAvailabilityPreload = false;

const defaultCheckoutPlanConfig = {
  plans: [
    {
      id: "consultation_call_99",
      matchTitle: "CONSULTATION CALL",
      displayTitle: "Consultation Call $99",
      pretext:
        "Take 2 minutes to fill this out before booking. It helps me show up to our call prepared so we can make the most of our time together.",
      questions: [
        "What is your main goal right now?",
        "What has stopped you from achieving it so far?",
        "How many days per week can you train?",
        "Do you have any injuries or limitations?",
        "What is your current training experience?",
      ],
    },
    {
      id: "transformation_12_week_687",
      matchTitle: "12-WEEK TRANSFORMATION",
      displayTitle: "12-WEEK TRANSFORMATION $687",
      pretext:
        "Fill this out so I understand where you are before we speak. The more honest you are, the more value I can give you on our call.",
      questions: [
        "What is your goal for the 12 weeks?",
        "How many days per week can you train and for how long?",
        "Do you have gym access?",
        "What does your diet look like currently?",
        "Why now - what has changed that made you take action?",
      ],
    },
    {
      id: "monthly_coaching_299",
      matchTitle: "MONTHLY COACHING",
      displayTitle: "MONTHLY COACHING $299",
      pretext:
        "Before you book, answer a few quick questions so I can understand your situation and come prepared with a clear plan for you.",
      questions: [
        "What does your ideal physique look like?",
        "What is your training history?",
        "What has and hasn't worked for you in the past?",
        "What does your schedule look like week to week?",
        "Why do you want a coach rather than doing it alone?",
      ],
    },
  ],
};

/* ---- Checkout: State + Field Error Helpers ---- */
function setCheckoutLoadingState(isLoading) {
  isCheckoutLoading = isLoading;

  if (!checkoutSubmitBtn) {
    return;
  }

  checkoutSubmitBtn.disabled = isLoading;
  checkoutSubmitBtn.classList.toggle("is-loading", isLoading);
  checkoutSubmitBtn.setAttribute("aria-busy", String(isLoading));
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
  clearCheckoutFieldError(checkoutDateButton, checkoutDateError);
  clearCheckoutFieldError(checkoutTimeButton, checkoutTimeError);
  checkoutQuestionInputs.forEach((input, index) => {
    clearCheckoutFieldError(input, checkoutQuestionErrors[index]);
  });
}

/* ---- Checkout: Plan + Config Helpers ---- */
function getSelectedCardData(cardEl) {
  const title =
    $(".ms-card-title", cardEl)?.textContent?.trim() ?? "Unknown Plan";
  const matchedPlan = getPlanByCardTitle(title);

  return {
    title,
    price: $(".ms-price-amount", cardEl)?.textContent?.trim() ?? "",
    priceType: $(".ms-price-type", cardEl)?.textContent?.trim() ?? "",
    planId: matchedPlan?.id ?? "",
  };
}

function getCalendlyConfig() {
  const cfg = window.CALENDLY_CONFIG ?? {};

  return {
    token: cfg.token ?? "",
    apiBaseUrl: cfg.apiBaseUrl ?? "https://api.calendly.com",
    availabilityWindowDays: Number(cfg.availabilityWindowDays ?? 7),
    eventTypeUri: cfg.eventTypeUri ?? "",
  };
}

function getCalendlyEventTypeUri(planId) {
  void planId;
  const cfg = getCalendlyConfig();
  return cfg.eventTypeUri ?? "";
}

function getCalendlyAuthHeaders() {
  const cfg = getCalendlyConfig();

  if (!cfg.token) {
    throw new Error(
      "Calendly token is missing in window.CALENDLY_CONFIG.token.",
    );
  }

  return {
    Authorization: `Bearer ${cfg.token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function ensureCheckoutPlansLoaded() {
  if (checkoutPlansConfig?.plans?.length) {
    return checkoutPlansConfig;
  }

  try {
    const response = await fetch("assets/checkout-plans.json", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Plan config request failed with status ${response.status}.`,
      );
    }

    const parsedConfig = await response.json();
    if (
      !Array.isArray(parsedConfig?.plans) ||
      parsedConfig.plans.length === 0
    ) {
      throw new Error("Plan config file does not include valid plans.");
    }

    checkoutPlansConfig = parsedConfig;
  } catch (error) {
    console.error(
      "Failed to load assets/checkout-plans.json. Falling back to defaults.",
      error,
    );
    checkoutPlansConfig = defaultCheckoutPlanConfig;
  }

  return checkoutPlansConfig;
}

function getPlanByCardTitle(cardTitle) {
  const normalizedTitle = (cardTitle ?? "").trim().toUpperCase();
  const plans = checkoutPlansConfig?.plans ?? [];
  return (
    plans.find(
      (plan) =>
        (plan.matchTitle ?? "").trim().toUpperCase() === normalizedTitle,
    ) ?? null
  );
}

function renderSelectedPlanQuestions(plan) {
  selectedCheckoutPlan = plan;

  checkoutPlanQuestions.textContent = "";

  if (!plan?.questions?.length) {
    checkoutQuestionLabels.forEach((labelEl, index) => {
      labelEl.textContent = `Question ${index + 1}`;
    });
    return;
  }

  const hint = document.createElement("p");
  hint.className = "checkout-plan-questions-hint";
  hint.textContent = plan?.pretext ?? "";
  checkoutPlanQuestions.appendChild(hint);

  checkoutQuestionLabels.forEach((labelEl, index) => {
    const questionText = plan.questions[index] ?? `Question ${index + 1}`;
    labelEl.textContent = questionText;
  });
}

/* ---- Checkout: Date/Time + Availability Helpers ---- */
function normalizeToDateKey(dateObj) {
  const year = dateObj.getFullYear();
  const month = `${dateObj.getMonth() + 1}`.padStart(2, "0");
  const day = `${dateObj.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateKeyFromIso(isoDateTime) {
  const parsed = new Date(isoDateTime);
  return normalizeToDateKey(parsed);
}

function getLocalDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLocalTimeLabel(isoDateTime) {
  const parsedDate = new Date(isoDateTime);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid time";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(parsedDate);
}

function getAvailabilityCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.collection)) {
    return payload.collection;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function getTodayStartDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function cloneAvailabilitySnapshot(snapshot) {
  const clonedSlotsByDate = new Map();
  snapshot.slotsByDate.forEach((slots, dateKey) => {
    clonedSlotsByDate.set(dateKey, [...slots]);
  });

  return {
    slotsByDate: clonedSlotsByDate,
    dateKeys: new Set(snapshot.dateKeys),
  };
}

function applyAvailabilitySnapshot(snapshot) {
  availableSlotsByDate.clear();
  availableDateKeys.clear();

  snapshot.slotsByDate.forEach((slots, dateKey) => {
    availableSlotsByDate.set(dateKey, [...slots]);
    availableDateKeys.add(dateKey);
  });
}

function resetSchedulingSelection() {
  selectedAvailabilityDate = "";
  checkoutDateInput.value = "";
  checkoutDateButton.textContent = "Select a date";
  checkoutDateButton.classList.remove("is-selected");

  checkoutTimeInput.value = "";
  checkoutTimeButton.textContent = "Select a date first";
  checkoutTimeButton.classList.remove("is-selected");
  checkoutTimeButton.disabled = true;
  checkoutTimeList.innerHTML = "";
  setTimePickerOpen(false);

  clearCheckoutFieldError(checkoutDateButton, checkoutDateError);
  clearCheckoutFieldError(checkoutTimeButton, checkoutTimeError);
}

function setDatePickerOpen(isOpen) {
  checkoutDatePopover.hidden = !isOpen;
  checkoutDateButton.setAttribute("aria-expanded", String(isOpen));
}

function setTimePickerOpen(isOpen) {
  checkoutTimePopover.hidden = !isOpen;
  checkoutTimeButton.setAttribute("aria-expanded", String(isOpen));
}

function renderTimeOptionsForDate(dateKey) {
  const slots = availableSlotsByDate.get(dateKey) ?? [];
  checkoutTimeInput.value = "";
  checkoutTimeButton.classList.remove("is-selected");
  checkoutTimeList.innerHTML = "";

  if (!slots.length) {
    checkoutTimeButton.textContent = "No available times for this date";
    checkoutTimeButton.disabled = true;
    setTimePickerOpen(false);
    return;
  }

  checkoutTimeButton.textContent = "Select a time";
  checkoutTimeButton.disabled = false;

  slots.forEach((slotIso) => {
    const slotButton = document.createElement("button");
    slotButton.type = "button";
    slotButton.className = "checkout-time-option";
    slotButton.textContent = getLocalTimeLabel(slotIso);

    slotButton.addEventListener("click", () => {
      checkoutTimeInput.value = slotIso;
      checkoutTimeButton.textContent = getLocalTimeLabel(slotIso);
      checkoutTimeButton.classList.add("is-selected");
      clearCheckoutFieldError(checkoutTimeButton, checkoutTimeError);
      setTimePickerOpen(false);
    });

    checkoutTimeList.appendChild(slotButton);
  });
}

function selectAvailabilityDate(dateKey) {
  selectedAvailabilityDate = dateKey;
  checkoutDateInput.value = dateKey;
  checkoutDateButton.classList.add("is-selected");
  checkoutDateButton.textContent = getLocalDateLabel(dateKey);

  $$(".checkout-date-cell", checkoutDateGrid).forEach((cellButton) => {
    if (cellButton.classList.contains("checkout-date-cell--empty")) {
      return;
    }
    const isSelected = cellButton.dataset.dateKey === dateKey;
    cellButton.classList.toggle("is-selected", isSelected);
  });

  renderTimeOptionsForDate(dateKey);
  setDatePickerOpen(false);
  clearCheckoutFieldError(checkoutDateButton, checkoutDateError);
}

function renderCalendarGrid() {
  checkoutDateGrid.innerHTML = "";

  const year = currentCalendarMonth.getFullYear();
  const month = currentCalendarMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstDayOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStart = getTodayStartDate();
  const todayKey = normalizeToDateKey(todayStart);

  checkoutDateMonth.textContent = currentCalendarMonth.toLocaleDateString(
    undefined,
    {
      month: "long",
      year: "numeric",
    },
  );

  for (let empty = 0; empty < firstDayOffset; empty += 1) {
    const blank = document.createElement("span");
    blank.className = "checkout-date-cell checkout-date-cell--empty";
    checkoutDateGrid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateObj = new Date(year, month, day);
    const dateKey = normalizeToDateKey(dateObj);
    const hasSlots = availableDateKeys.has(dateKey);
    const isPastDate = dateObj < todayStart;
    const isDisabled = isPastDate || !hasSlots;

    const dayButton = document.createElement("button");
    dayButton.type = "button";
    dayButton.className = "checkout-date-cell";
    dayButton.textContent = String(day);
    dayButton.disabled = isDisabled;
    dayButton.dataset.dateKey = dateKey;

    if (dateKey === selectedAvailabilityDate) {
      dayButton.classList.add("is-selected");
    }

    if (dateKey === todayKey) {
      dayButton.classList.add("is-today");
    }

    if (isDisabled) {
      dayButton.classList.add("is-disabled");
    }

    dayButton.addEventListener("click", () => selectAvailabilityDate(dateKey));
    checkoutDateGrid.appendChild(dayButton);
  }
}

/* ---- Checkout: Calendly Availability Fetch + Cache ---- */
async function fetchCalendlyAvailability(planId) {
  const eventTypeUri = getCalendlyEventTypeUri(planId);
  if (!eventTypeUri) {
    throw new Error(`Calendly event type URI missing for plan id: ${planId}.`);
  }

  const cfg = getCalendlyConfig();

  // Calendly API constraint: range must be <= 7 days and start_time must be future.
  // To load a larger horizon (2 months), we fetch multiple 7-day windows and merge results.
  const MAX_CALENDLY_RANGE_DAYS = 7;
  const TARGET_LOOKAHEAD_DAYS = 60;
  const FUTURE_START_BUFFER_MINUTES = 5;
  const requestedWindowDays = Number.isFinite(cfg.availabilityWindowDays)
    ? cfg.availabilityWindowDays
    : TARGET_LOOKAHEAD_DAYS;
  const safeTotalWindowDays = Math.max(
    TARGET_LOOKAHEAD_DAYS,
    Math.max(1, Math.floor(requestedWindowDays)),
  );

  const start = new Date();
  start.setMinutes(start.getMinutes() + FUTURE_START_BUFFER_MINUTES, 0, 0);

  const fullRangeEnd = new Date(start);
  fullRangeEnd.setDate(fullRangeEnd.getDate() + safeTotalWindowDays);

  const mergedCollection = [];
  let windowStart = new Date(start);

  while (windowStart < fullRangeEnd) {
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + MAX_CALENDLY_RANGE_DAYS);
    if (windowEnd > fullRangeEnd) {
      windowEnd.setTime(fullRangeEnd.getTime());
    }

    const windowStartIso = windowStart.toISOString();
    const windowEndIso = windowEnd.toISOString();
    const windowRequestKey = `${eventTypeUri}|${windowStartIso}|${windowEndIso}`;

    const cachedWindowCollection =
      availabilityWindowResponseCache.get(windowRequestKey);
    if (cachedWindowCollection) {
      mergedCollection.push(...cachedWindowCollection);
    } else {
      let inFlightPromise =
        availabilityWindowInFlightByKey.get(windowRequestKey);

      if (!inFlightPromise) {
        const params = new URLSearchParams({
          event_type: eventTypeUri,
          start_time: windowStartIso,
          end_time: windowEndIso,
        });

        inFlightPromise = fetch(
          `${cfg.apiBaseUrl}/event_type_available_times?${params.toString()}`,
          {
            method: "GET",
            headers: getCalendlyAuthHeaders(),
          },
        )
          .then(async (response) => {
            if (!response.ok) {
              const failureText = await response.text();
              throw new Error(
                `Calendly availability request failed (${response.status}) for ${windowStartIso} to ${windowEndIso}: ${failureText}`,
              );
            }

            const data = await response.json();
            const normalizedCollection = getAvailabilityCollection(data);
            availabilityWindowResponseCache.set(
              windowRequestKey,
              normalizedCollection,
            );
            return normalizedCollection;
          })
          .finally(() => {
            availabilityWindowInFlightByKey.delete(windowRequestKey);
          });

        availabilityWindowInFlightByKey.set(windowRequestKey, inFlightPromise);
      }

      const windowCollection = await inFlightPromise;
      mergedCollection.push(...windowCollection);
    }

    windowStart = new Date(windowEnd);
    windowStart.setSeconds(windowStart.getSeconds() + 1);
  }

  const slotsByDate = new Map();
  const dateKeys = new Set();

  mergedCollection.forEach((slotItem) => {
    const slotIso = slotItem?.start_time ?? slotItem?.startTime ?? "";
    const slotStatus = slotItem?.status ?? "available";
    const parsedSlotDate = new Date(slotIso);

    if (
      !slotIso ||
      Number.isNaN(parsedSlotDate.getTime()) ||
      slotStatus !== "available"
    ) {
      return;
    }

    const dateKey = getDateKeyFromIso(slotIso);
    const list = slotsByDate.get(dateKey) ?? [];
    list.push(slotIso);
    slotsByDate.set(dateKey, list);
    dateKeys.add(dateKey);
  });

  slotsByDate.forEach((slots, dateKey) => {
    const dedupedAndSortedSlots = [...new Set(slots)].sort(
      (a, b) => new Date(a) - new Date(b),
    );
    slotsByDate.set(dateKey, dedupedAndSortedSlots);
  });

  return {
    slotsByDate,
    dateKeys,
  };
}

function primeAvailabilityForPlan(planId) {
  if (!planId) {
    return Promise.resolve(null);
  }

  const cachedSnapshot = availabilityCacheByPlanId.get(planId);
  if (cachedSnapshot) {
    return Promise.resolve(cachedSnapshot);
  }

  const activePromise = availabilityFetchPromisesByPlanId.get(planId);
  if (activePromise) {
    return activePromise;
  }

  const fetchPromise = fetchCalendlyAvailability(planId)
    .then((snapshot) => {
      availabilityCacheByPlanId.set(
        planId,
        cloneAvailabilitySnapshot(snapshot),
      );
      return snapshot;
    })
    .finally(() => {
      availabilityFetchPromisesByPlanId.delete(planId);
    });

  availabilityFetchPromisesByPlanId.set(planId, fetchPromise);
  return fetchPromise;
}

function preloadCalendlyAvailability() {
  if (hasStartedAvailabilityPreload) {
    return;
  }

  hasStartedAvailabilityPreload = true;

  void ensureCheckoutPlansLoaded()
    .then((planConfig) => {
      const planIds = (planConfig?.plans ?? [])
        .map((plan) => plan?.id)
        .filter(
          (planId) => typeof planId === "string" && planId.trim().length > 0,
        );

      if (!planIds.length) {
        return;
      }

      planIds.forEach((planId) => {
        void primeAvailabilityForPlan(planId).catch((error) => {
          console.error(
            `Failed to preload Calendly availability for plan ${planId}:`,
            error,
          );
        });
      });
    })
    .catch((error) => {
      console.error("Failed to preload Calendly availability.", error);
    });
}

async function loadPlanAvailability(planId) {
  resetSchedulingSelection();
  checkoutDateButton.textContent = "Loading available dates...";
  checkoutDateButton.disabled = true;

  try {
    const snapshot = await primeAvailabilityForPlan(planId);
    if (snapshot) {
      applyAvailabilitySnapshot(snapshot);
    }

    checkoutDateButton.disabled = false;

    if (!availableDateKeys.size) {
      checkoutDateButton.textContent = "No available dates";
      checkoutDateButton.disabled = true;
      setCheckoutFieldError(
        checkoutDateButton,
        checkoutDateError,
        "No available dates for this plan right now. Please try another plan or come back later.",
      );
    } else {
      checkoutDateButton.textContent = "Select a date";
      clearCheckoutFieldError(checkoutDateButton, checkoutDateError);
    }
  } catch (error) {
    console.error("Failed to fetch Calendly availability:", error);
    checkoutDateButton.textContent = "Availability unavailable";
    checkoutDateButton.disabled = true;
    setCheckoutFieldError(
      checkoutDateButton,
      checkoutDateError,
      "Could not load date availability. Please check Calendly configuration.",
    );
  }

  renderCalendarGrid();
}

/* ---- Checkout: Modal Controls ---- */
async function openCheckoutModal(cardEl) {
  selectedMentorshipCard = cardEl;
  await ensureCheckoutPlansLoaded();

  const cardData = getSelectedCardData(cardEl);

  checkoutSelectedCard.innerHTML = `
    <span class="checkout-selected-label">Selected Plan:</span>
    <span class="checkout-selected-plan">${cardData.title}</span>
    <span class="checkout-selected-amount">${cardData.price}${cardData.priceType ? ` ${cardData.priceType}` : ""}</span>
  `;

  const selectedPlan =
    getPlanByCardTitle(cardData.title) ?? checkoutPlansConfig.plans[0] ?? null;
  renderSelectedPlanQuestions(selectedPlan);

  checkoutForm.reset();
  resetCheckoutValidation();
  currentCalendarMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  renderCalendarGrid();

  checkoutOverlay.classList.add("active");
  checkoutOverlay.setAttribute("aria-hidden", "false");

  if (selectedPlan?.id) {
    void loadPlanAvailability(selectedPlan.id);
  }
}

function closeCheckoutModal() {
  checkoutOverlay.classList.remove("active");
  checkoutOverlay.setAttribute("aria-hidden", "true");
  setDatePickerOpen(false);
}

/* ---- Checkout: Payment Status Modal ---- */
function showPaymentStatus(isSuccess) {
  paymentModal.className = `payment-modal ${isSuccess ? "success" : "failed"}`;
  setPaymentStatusIcon(isSuccess);

  if (isSuccess) {
    paymentStatusTitle.textContent = "Payment Successful";
    paymentStatusMessage.textContent =
      "Payment successful. We will contact you soon.";
  } else {
    paymentStatusTitle.textContent = "Payment Failed";
    paymentStatusMessage.textContent =
      "Payment failed. Please try again after some time. If amount is debited, our team will verify and contact you.";
  }

  if (paymentQueryMessage) {
    paymentQueryMessage.textContent = "";
    paymentQueryMessage.hidden = true;
  }

  if (paymentQueryDetails) {
    paymentQueryDetails.innerHTML = "";
    paymentQueryDetails.hidden = true;
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

function showPaymentFailedModal(externalMessage = "", options = {}) {
  const queryMessage = options.queryMessage ?? "";
  const queryEntries = Array.isArray(options.queryEntries)
    ? options.queryEntries
    : [];

  paymentModal.className = "payment-modal failed";
  setPaymentStatusIcon(false);
  paymentStatusTitle.textContent = "Payment Failed";
  paymentStatusMessage.textContent = "Payment failed. Please try again later.";

  if (paymentQueryMessage) {
    paymentQueryMessage.textContent = queryMessage.trim();
    paymentQueryMessage.hidden = !queryMessage.trim();
  }

  if (paymentQueryDetails) {
    paymentQueryDetails.innerHTML = "";
    queryEntries.forEach(([rawKey, rawValue]) => {
      const row = document.createElement("div");
      row.className = "payment-query-details-row";

      const keyEl = document.createElement("span");
      keyEl.className = "payment-query-details-key";
      keyEl.textContent = `${formatQueryParamKey(rawKey)}:`;

      const valueEl = document.createElement("span");
      valueEl.className = "payment-query-details-value";
      valueEl.textContent = rawValue || "-";

      row.appendChild(keyEl);
      row.appendChild(valueEl);
      paymentQueryDetails.appendChild(row);
    });

    paymentQueryDetails.hidden = queryEntries.length === 0;
  }

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

function setPaymentStatusIcon(isSuccess) {
  if (!paymentStatusIcon) {
    return;
  }

  const iconMarkup = isSuccess
    ? '<span class="payment-icon-symbol payment-icon-symbol--success" aria-hidden="true">&#10003;</span>'
    : '<span class="payment-icon-symbol payment-icon-symbol--failed" aria-hidden="true">&#10005;</span>';

  paymentStatusIcon.innerHTML = iconMarkup;
}

function formatQueryParamKey(key) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isTruthyQueryValue(value) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function normalizePaymentStatus(value) {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "success" || normalized === "successful") {
    return "success";
  }

  if (normalized === "fail" || normalized === "failed" || normalized === "error") {
    return "fail";
  }

  return "";
}

function openPaymentModalFromQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const shouldOpenPaymentModal = isTruthyQueryValue(params.get("payment"));

  if (!shouldOpenPaymentModal) {
    return;
  }

  const normalizedStatus = normalizePaymentStatus(params.get("status"));
  const queryEntries = [];

  params.forEach((value, key) => {
    if (key === "payment" || key === "status") {
      return;
    }
    queryEntries.push([key, value]);
  });

  if (normalizedStatus === "success") {
    showPaymentStatus(true);
    paymentStatusMessage.textContent =
      "Payment successful. We have received your request and will contact you soon.";

    if (paymentQueryMessage) {
      paymentQueryMessage.textContent =
        "Your payment was confirmed successfully. Here are your transaction details:";
      paymentQueryMessage.hidden = false;
    }

    if (paymentQueryDetails) {
      paymentQueryDetails.innerHTML = "";

      queryEntries.forEach(([rawKey, rawValue]) => {
        const row = document.createElement("div");
        row.className = "payment-query-details-row";

        const keyEl = document.createElement("span");
        keyEl.className = "payment-query-details-key";
        keyEl.textContent = `${formatQueryParamKey(rawKey)}:`;

        const valueEl = document.createElement("span");
        valueEl.className = "payment-query-details-value";
        valueEl.textContent = rawValue || "-";

        row.appendChild(keyEl);
        row.appendChild(valueEl);
        paymentQueryDetails.appendChild(row);
      });

      paymentQueryDetails.hidden = queryEntries.length === 0;
    }

    return;
  }

  showPaymentFailedModal("", {
    queryMessage:
      "We could not confirm this payment. If money was debited, please share these details with support.",
    queryEntries,
  });
}

function closePaymentStatus() {
  paymentOverlay.classList.remove("active");
  paymentOverlay.setAttribute("aria-hidden", "true");
}

/* ---- Checkout: Validation + Submit Helpers ---- */
function isValidCheckoutEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function sanitizePhoneInput(value) {
  return value.replace(/[^0-9()\s-]/g, "");
}

function validateCheckoutForm() {
  const nameVal = checkoutName.value.trim();
  const phoneVal = checkoutPhone.value.trim();
  const emailVal = checkoutEmail.value.trim();
  const noteVal = checkoutNote.value.trim();
  const selectedDate = checkoutDateInput.value.trim();
  const selectedTime = checkoutTimeInput.value.trim();
  let isValid = true;

  resetCheckoutValidation();

  if (!nameVal) {
    setCheckoutFieldError(checkoutName, checkoutNameError, "Name is required.");
    isValid = false;
  }

  if (!phoneVal) {
    setCheckoutFieldError(
      checkoutPhone,
      checkoutPhoneError,
      "Mobile number is required.",
    );
    isValid = false;
  }

  if (!emailVal) {
    setCheckoutFieldError(
      checkoutEmail,
      checkoutEmailError,
      "Email is required.",
    );
    isValid = false;
  } else if (!isValidCheckoutEmail(emailVal)) {
    setCheckoutFieldError(
      checkoutEmail,
      checkoutEmailError,
      "Please enter a valid email.",
    );
    isValid = false;
  }

  if (!selectedDate) {
    setCheckoutFieldError(
      checkoutDateButton,
      checkoutDateError,
      "Date is required.",
    );
    isValid = false;
  }

  if (!selectedTime) {
    setCheckoutFieldError(
      checkoutTimeButton,
      checkoutTimeError,
      "Time is required.",
    );
    isValid = false;
  }

  checkoutQuestionInputs.forEach((input, index) => {
    if (!input.value.trim()) {
      setCheckoutFieldError(
        input,
        checkoutQuestionErrors[index],
        "This answer is required.",
      );
      isValid = false;
    }
  });

  /* if (!noteVal) {
    setCheckoutFieldError(checkoutNote, checkoutNoteError, "Note is required.");
    isValid = false;
  } */

  return isValid;
}

function getCheckoutPhoneNumber() {
  return checkoutPhone.value.trim();
}

async function submitCalendlyInvitee(bookingPayload) {
  // TODO: For production, call your backend endpoint and keep Calendly token server-side.
  const cfg = getCalendlyConfig();
  const eventTypeUri = getCalendlyEventTypeUri(
    bookingPayload.selectedCard.planId,
  );

  if (!eventTypeUri) {
    throw new Error("Missing Calendly event type URI for selected plan.");
  }

  const calendlyBody = {
    event_type: eventTypeUri,
    start_time: bookingPayload.startTime,
    invitee: {
      name: bookingPayload.name,
      email: bookingPayload.email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  const response = await fetch(`${cfg.apiBaseUrl}/invitees`, {
    method: "POST",
    headers: getCalendlyAuthHeaders(),
    body: JSON.stringify(calendlyBody),
  });

  if (!response.ok) {
    const failureText = await response.text();
    throw new Error(
      `Calendly booking failed (${response.status}): ${failureText}`,
    );
  }

  return response.json();
}

/* ---- Checkout: Event bindings ---- */
function bindCheckoutPopoverEvents() {
  checkoutDateButton?.addEventListener("click", () => {
    if (checkoutDateButton.disabled) {
      return;
    }

    renderCalendarGrid();

    const shouldOpen = checkoutDatePopover.hidden;
    setDatePickerOpen(shouldOpen);
    setTimePickerOpen(false);
  });

  checkoutDatePrev?.addEventListener("click", () => {
    currentCalendarMonth = new Date(
      currentCalendarMonth.getFullYear(),
      currentCalendarMonth.getMonth() - 1,
      1,
    );
    renderCalendarGrid();
  });

  checkoutDateNext?.addEventListener("click", () => {
    currentCalendarMonth = new Date(
      currentCalendarMonth.getFullYear(),
      currentCalendarMonth.getMonth() + 1,
      1,
    );
    renderCalendarGrid();
  });

  checkoutTimeButton?.addEventListener("click", () => {
    if (checkoutTimeButton.disabled) {
      return;
    }

    const shouldOpen = checkoutTimePopover.hidden;
    setTimePickerOpen(shouldOpen);
    setDatePickerOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!checkoutDatePicker?.contains(event.target)) {
      setDatePickerOpen(false);
    }

    if (!checkoutTimePicker?.contains(event.target)) {
      setTimePickerOpen(false);
    }
  });
}

function bindCheckoutModalEvents() {
  $$(".ms-apply-btn").forEach((btn) => {
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
}

function bindCheckoutFieldValidationEvents() {
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

  checkoutTimeButton?.addEventListener("focus", () =>
    clearCheckoutFieldError(checkoutTimeButton, checkoutTimeError),
  );

  checkoutQuestionInputs.forEach((input, index) => {
    input?.addEventListener("input", () => {
      clearCheckoutFieldError(input, checkoutQuestionErrors[index]);
    });
  });
}

function bindCheckoutSubmitEvent() {
  checkoutForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isCheckoutLoading) {
      return;
    }

    if (!validateCheckoutForm()) {
      return;
    }

    setCheckoutLoadingState(true);

    const selectedCardData = selectedMentorshipCard
      ? getSelectedCardData(selectedMentorshipCard)
      : { title: "Unknown Plan", price: "", priceType: "" };

    const planQuestions = checkoutQuestionInputs.map((input, index) => ({
      question:
        checkoutQuestionLabels[index]?.textContent?.trim() ??
        `Question ${index + 1}`,
      answer: input.value.trim(),
    }));

    const checkoutPayload = {
      selectedCard: selectedCardData,
      name: checkoutName.value.trim(),
      mobileNumber: getCheckoutPhoneNumber(),
      email: checkoutEmail.value.trim(),
      selectedDate: checkoutDateInput.value.trim(),
      startTime: checkoutTimeInput.value.trim(),
      note: checkoutNote.value.trim(),
      planQuestions,
    };

    console.log("Mentorship checkout selected plan:", selectedCheckoutPlan);
    console.log("Mentorship checkout submit:", checkoutPayload);
    console.log("Checkout answers:", planQuestions);
    // TODO: PAYMENT SUBMIT
    try {
      // const calendlyResponse = await submitCalendlyInvitee(checkoutPayload);
      const calendlyResponse = {
        resource: {
          event: "https://calendly.com/api/v1/events/ABC123",
          uri: "https://calendly.com/api/v1/invitees/INVITE123",
        },
      };
      const eventUri = calendlyResponse?.resource?.event ?? "Hi";
      const inviteeUri = calendlyResponse?.resource?.uri ?? "Hi";
      const modalExternalMessage = [
        eventUri ? `Event: ${eventUri}` : "",
        inviteeUri ? `Invitee: ${inviteeUri}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      setCheckoutLoadingState(false);
      closeCheckoutModal();
      showPaymentSuccessModal(modalExternalMessage);
      checkoutForm.reset();
      resetSchedulingSelection();
      resetCheckoutValidation();
    } catch (error) {
      console.error("Calendly booking error:", error);
      setCheckoutLoadingState(false);
      showPaymentFailedModal(
        error instanceof Error ? error.message : "Calendly booking failed.",
      );
    }
  });
}

function initCheckoutFeature() {
  preloadCalendlyAvailability();
  bindCheckoutPopoverEvents();
  bindCheckoutModalEvents();
  bindCheckoutFieldValidationEvents();
  bindCheckoutSubmitEvent();
  openPaymentModalFromQueryParams();
}

initCheckoutFeature();

/* ============================================================
   8. FLOATING QUERY WIDGET
   ============================================================ */
const floatingQueryBtn = $("#floatingQueryBtn");
const questionsSendMessageBtn = $("#questionsSendMessageBtn");
const floatingQueryOverlay = $("#floatingQueryOverlay");
const floatingQueryClose = $("#floatingQueryClose");
const floatingQueryContent = $("#floatingQueryContent");
const floatingQueryForm = $("#floatingQueryForm");
const floatingQuerySuccess = $("#floatingQuerySuccess");
const floatingQuerySubmitError = $("#floatingQuerySubmitError");
const floatingQuerySubmitBtn = $("#floatingQuerySubmitBtn");

const queryName = $("#queryName");
const queryEmail = $("#queryEmail");
const queryMessage = $("#queryMessage");

const queryNameError = $("#queryNameError");
const queryEmailError = $("#queryEmailError");
const queryMessageError = $("#queryMessageError");

let isFloatingQueryLoading = false;

/* ---- Floating Query: State + Field Error Helpers ---- */
function setFloatingQueryLoadingState(isLoading) {
  isFloatingQueryLoading = isLoading;

  if (!floatingQuerySubmitBtn) {
    return;
  }

  floatingQuerySubmitBtn.disabled = isLoading;
  floatingQuerySubmitBtn.classList.toggle("is-loading", isLoading);
  floatingQuerySubmitBtn.setAttribute("aria-busy", String(isLoading));
}

function clearQueryFieldError(input, errorEl) {
  input?.classList.remove("error-field");
  if (errorEl) {
    errorEl.textContent = "";
  }
}

function setQueryFieldError(input, errorEl, message) {
  input?.classList.add("error-field");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function resetFloatingQueryWidget() {
  floatingQueryForm?.reset();
  floatingQuerySubmitError.textContent = "";
  setFloatingQueryLoadingState(false);
  clearQueryFieldError(queryName, queryNameError);
  clearQueryFieldError(queryEmail, queryEmailError);
  clearQueryFieldError(queryMessage, queryMessageError);

  if (floatingQueryContent) {
    floatingQueryContent.hidden = false;
  }
  if (floatingQuerySuccess) {
    floatingQuerySuccess.hidden = true;
  }
}

function openFloatingQueryWidget() {
  floatingQueryOverlay.classList.add("active");
  floatingQueryOverlay.setAttribute("aria-hidden", "false");
}

function closeFloatingQueryWidget() {
  floatingQueryOverlay.classList.remove("active");
  floatingQueryOverlay.setAttribute("aria-hidden", "true");
  resetFloatingQueryWidget();
}

function validateFloatingQueryForm() {
  const nameVal = queryName.value.trim();
  const emailVal = queryEmail.value.trim();
  const questionVal = queryMessage.value.trim();
  let isValid = true;

  clearQueryFieldError(queryName, queryNameError);
  clearQueryFieldError(queryEmail, queryEmailError);
  clearQueryFieldError(queryMessage, queryMessageError);
  floatingQuerySubmitError.textContent = "";

  if (!nameVal) {
    setQueryFieldError(queryName, queryNameError, "Name is required.");
    isValid = false;
  }

  if (!emailVal) {
    setQueryFieldError(queryEmail, queryEmailError, "Email is required.");
    isValid = false;
  } else if (!isValidCheckoutEmail(emailVal)) {
    setQueryFieldError(
      queryEmail,
      queryEmailError,
      "Please enter a valid email.",
    );
    isValid = false;
  }

  if (!questionVal) {
    setQueryFieldError(
      queryMessage,
      queryMessageError,
      "Question is required.",
    );
    isValid = false;
  }

  return isValid;
}

/* ---- Floating Query: Event bindings ---- */
function bindFloatingQueryModalEvents() {
  floatingQueryBtn?.addEventListener("click", openFloatingQueryWidget);
  questionsSendMessageBtn?.addEventListener("click", openFloatingQueryWidget);
  floatingQueryClose?.addEventListener("click", closeFloatingQueryWidget);

  floatingQueryOverlay?.addEventListener("click", (event) => {
    if (event.target === floatingQueryOverlay) {
      closeFloatingQueryWidget();
    }
  });
}

function bindFloatingQueryFieldEvents() {
  queryName?.addEventListener("input", () =>
    clearQueryFieldError(queryName, queryNameError),
  );
  queryEmail?.addEventListener("input", () =>
    clearQueryFieldError(queryEmail, queryEmailError),
  );
  queryMessage?.addEventListener("input", () =>
    clearQueryFieldError(queryMessage, queryMessageError),
  );
}

function bindFloatingQuerySubmitEvent() {
  floatingQueryForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isFloatingQueryLoading) {
      return;
    }

    if (!validateFloatingQueryForm()) {
      return;
    }

    setFloatingQueryLoadingState(true);

    const queryPayload = {
      name: queryName.value.trim(),
      email: queryEmail.value.trim(),
      question: queryMessage.value.trim(),
    };

    console.log("Have Question submit:", queryPayload);
    // TODO: FLOATING QUERY SUBMIT

    // await new Promise((resolve) => setTimeout(resolve, 5000));
    const isSuccess = true;

    if (!isSuccess) {
      setFloatingQueryLoadingState(false);
      floatingQuerySubmitError.textContent =
        "Something went wrong. Please try again in a moment.";
      return;
    }

    floatingQuerySubmitError.textContent = "";
    setFloatingQueryLoadingState(false);

    if (floatingQueryContent) {
      floatingQueryContent.hidden = true;
    }
    if (floatingQuerySuccess) {
      floatingQuerySuccess.hidden = false;
    }
  });
}

function initFloatingQueryFeature() {
  bindFloatingQueryModalEvents();
  bindFloatingQueryFieldEvents();
  bindFloatingQuerySubmitEvent();
}

initFloatingQueryFeature();
