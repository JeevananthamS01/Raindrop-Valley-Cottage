document.addEventListener("DOMContentLoaded", function () {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyOeQSj_2hRya2U44C8st8sew96guIbOKq8Tv-6sFa5XBeuhxbyA0pHRwZ2LepB8KVleQ/exec";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const status = document.getElementById("formStatus");
  const submitButton = form.querySelector(".submit-button");

  const nameInput = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  const phoneInput = form.querySelector("#phone");
  const guestsInput = form.querySelector("#guests");
  const checkinInput = form.querySelector("#checkin");
  const checkoutInput = form.querySelector("#checkout");
  const messageInput = form.querySelector("#message");

  let statusTimer;

  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  checkinInput.min = localToday;
  checkoutInput.min = localToday;

  function showStatus(message, color) {
    clearTimeout(statusTimer);

    status.textContent = message;
    status.style.color = color;

    statusTimer = setTimeout(function () {
      status.textContent = "";
    }, 5000);
  }

  function getErrorElement(input) {
    return input.closest(".form-field")?.querySelector(".field-error");
  }

  function showError(input, message) {
    const error = getErrorElement(input);

    if (error) error.textContent = message;

    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
  }

  function clearError(input) {
    const error = getErrorElement(input);

    if (error) error.textContent = "";

    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
  }

  function validateName() {
    const value = nameInput.value.trim();

    if (!value) {
      showError(nameInput, "Full name is required.");
      return false;
    }

    if (value.length < 2 || value.length > 80) {
      showError(nameInput, "Name must contain 2 to 80 characters.");
      return false;
    }

    if (!/^\p{L}+(?:[ '-]\p{L}+)*$/u.test(value)) {
      showError(
        nameInput,
        "Use letters only. Numbers and special characters are not allowed.",
      );
      return false;
    }

    clearError(nameInput);
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) {
      showError(emailInput, "Gmail address is required.");
      return false;
    }

    const gmailPattern =
      /^[a-zA-Z0-9](?:[a-zA-Z0-9._+-]*[a-zA-Z0-9])?@gmail\.com$/i;

    if (value.length > 254 || !gmailPattern.test(value)) {
      showError(
        emailInput,
        "Enter a valid Gmail address ending in @gmail.com.",
      );
      return false;
    }

    clearError(emailInput);
    return true;
  }

  function validatePhone() {
    const value = phoneInput.value.trim();

    if (!value) {
      showError(phoneInput, "Phone number is required.");
      return false;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(value)) {
      showError(
        phoneInput,
        "Enter a valid country code and number, e.g. +919876543210. No spaces or letters.",
      );
      return false;
    }

    clearError(phoneInput);
    return true;
  }

  function validateGuests() {
    const value = guestsInput.value.trim();

    if (!value) {
      showError(guestsInput, "Number of guests is required.");
      return false;
    }

    if (!/^(?:[1-9]|[12]\d|30)$/.test(value)) {
      showError(guestsInput, "Enter a whole number between 1 and 30.");
      return false;
    }

    clearError(guestsInput);
    return true;
  }

  function validateCheckin() {
    const value = checkinInput.value;

    if (!value) {
      showError(checkinInput, "Check-in date is required.");
      return false;
    }

    if (value < localToday) {
      showError(checkinInput, "Check-in date cannot be in the past.");
      return false;
    }

    clearError(checkinInput);
    return true;
  }

  function validateCheckout() {
    const value = checkoutInput.value;

    if (!value) {
      showError(checkoutInput, "Check-out date is required.");
      return false;
    }

    if (!checkinInput.value) {
      showError(checkoutInput, "Please select your check-in date first.");
      return false;
    }

    if (value <= checkinInput.value) {
      showError(checkoutInput, "Check-out must be after check-in.");
      return false;
    }

    clearError(checkoutInput);
    return true;
  }

  function validateMessage() {
    const value = messageInput.value.trim();

    if (!value) {
      clearError(messageInput);
      return true;
    }

    if (value.length > 1000) {
      showError(messageInput, "Message cannot exceed 1000 characters.");
      return false;
    }

    const words = value.split(/\s+/).filter(Boolean);

    if (words.length < 10) {
      showError(messageInput, "Please enter at least 10 words.");
      return false;
    }

    if (
      /<[^>]*>|javascript:|data:text\/html|onerror\s*=|onload\s*=/i.test(value)
    ) {
      showError(messageInput, "Please enter a valid message.");
      return false;
    }

    clearError(messageInput);
    return true;
  }

  nameInput.addEventListener("input", validateName);
  emailInput.addEventListener("input", validateEmail);
  phoneInput.addEventListener("input", validatePhone);
  guestsInput.addEventListener("input", validateGuests);
  messageInput.addEventListener("input", validateMessage);

  checkinInput.addEventListener("change", function () {
    checkoutInput.min = checkinInput.value || localToday;

    validateCheckin();

    if (checkoutInput.value) {
      validateCheckout();
    }
  });

  checkoutInput.addEventListener("change", validateCheckout);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearTimeout(statusTimer);
    status.textContent = "";

    const validations = [
      validateName(),
      validateEmail(),
      validatePhone(),
      validateGuests(),
      validateCheckin(),
      validateCheckout(),
      validateMessage(),
    ];

    if (validations.includes(false)) {
      showStatus("Please correct the highlighted fields.", "#dc3545");

      form.querySelector(".invalid")?.focus();
      return;
    }

    if (!SCRIPT_URL || SCRIPT_URL === "YOUR_DEPLOYED_WEB_APP_URL") {
      showStatus("Form submission URL is not configured.", "#dc3545");
      return;
    }

    const enquiryData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      guests: guestsInput.value.trim(),
      checkin: checkinInput.value,
      checkout: checkoutInput.value,
      message: messageInput.value.trim(),
      isTrue: true
    };

    submitButton.disabled = true;
    submitButton.textContent = "Sending enquiry...";

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(enquiryData),
      });

      form.reset();

      checkinInput.min = localToday;
      checkoutInput.min = localToday;

      form.querySelectorAll(".field-error").forEach(function (error) {
        error.textContent = "";
      });

      form.querySelectorAll(".invalid").forEach(function (input) {
        input.classList.remove("invalid");
        input.removeAttribute("aria-invalid");
      });

      showStatus(
        "Your enquiry has been submitted. We will contact you soon.",
        "#16803c",
      );
    } catch (error) {
      showStatus("Unable to send your enquiry. Please try again.", "#dc3545");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML =
        'Send enquiry <i class="fa-solid fa-arrow-right"></i>';
    }
  });
});
