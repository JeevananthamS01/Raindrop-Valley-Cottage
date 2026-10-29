(() => {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    guests: document.getElementById("guests"),
    checkin: document.getElementById("checkin"),
    checkout: document.getElementById("checkout"),
    message: document.getElementById("message"),
  };
  const status = document.getElementById("formStatus");

  const patterns = {
    name: /^[A-Za-zÀ-ÖØ-öø-ÿ ]{2,50}$/,
    email:
      /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/,
    phone: /^(?:(?:\+91|91)[ -]?)?[6-9]\d{9}$/,
    guests: /^[0-9]{1,2}$/,
    message: /^[\s\S]{10,1500}$/,
  };

  const todayLocal = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  fields.checkin.min = todayLocal();
  fields.checkout.min = todayLocal();

  function validateField(key) {
    const field = fields[key];
    const value = field.value.trim();
    let message = "";

    switch (key) {
      case "name":
        if (!value) message = "Please enter your name.";
        else if (!patterns.name.test(value))
          message =
            "Use 2–50 characters with letters and spaces (basic punctuation is allowed).";
        break;
      case "email":
        if (!value) message = "Please enter your email address.";
        else if (!patterns.email.test(value))
          message = "Please enter a valid email address.";
        break;
      case "phone":
        if (!value) message = "Please enter your phone number.";
        else if (!patterns.phone.test(value.replace(/\s+/g, " ").trim()))
          message =
            "Enter a valid 10-digit Indian mobile number, optionally with +91.";
        break;
      case "guests": {
        const guests = Number(value);
        if (!value) message = "Please enter the number of guests.";
        else if (
          !patterns.guests.test(value) ||
          !Number.isInteger(guests) ||
          guests < 1 ||
          guests > 30
        )
          message = "Enter a whole number between 1 and 30.";
        break;
      }
      case "checkin":
        if (!value) message = "Please choose a check-in date.";
        else if (value < todayLocal())
          message = "Check-in cannot be in the past.";
        if (fields.checkout.value && value && fields.checkout.value <= value) {
          setFieldState("checkout", "Check-out must be after check-in.");
        } else if (fields.checkout.value) {
          setFieldState("checkout", "");
        }
        if (value) fields.checkout.min = value;
        break;
      case "checkout":
        if (!value) message = "Please choose a check-out date.";
        else if (value < todayLocal())
          message = "Check-out cannot be in the past.";
        else if (fields.checkin.value && value <= fields.checkin.value)
          message = "Check-out must be after check-in.";
        break;
      case "message":
        if (!value) message = "Please add a message.";
        else if (value.length < 10)
          message = "Please enter at least 10 characters.";
        else if (value.length > 1500)
          message = "Please keep your message under 1,500 characters.";
        else if (
          /<\/?[a-z][\s\S]*?>|javascript:|data:text\/html|onerror\s*=|onload\s*=/i.test(
            value,
          )
        )
          message = "Please remove HTML, script, or unsafe content.";
        break;
      default:
        break;
    }

    setFieldState(key, message);
    return !message;
  }

  function setFieldState(key, message) {
    const field = fields[key];
    const wrapper = field.closest(".form-field");
    const error = wrapper.querySelector(".field-error");
    error.textContent = message;
    wrapper.classList.toggle("is-invalid", Boolean(message));
    wrapper.classList.toggle(
      "is-valid",
      !message && field.value.trim().length > 0,
    );
    field.setAttribute("aria-invalid", String(Boolean(message)));
  }

  Object.entries(fields).forEach(([key, field]) => {
    field.addEventListener("input", () => {
      validateField(key);
      status.textContent = "";
      status.className = "form-status";
    });
    field.addEventListener("blur", () => validateField(key));
    field.addEventListener("change", () => validateField(key));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const results = Object.keys(fields).map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      status.textContent =
        "Please correct the highlighted fields and try again.";
      status.className = "form-status error";
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    // Front-end demo only. Connect an API/email service to deliver this enquiry.
    const enquiry = Object.fromEntries(new FormData(form).entries());
    console.info("Validated cottage enquiry (demo only):", enquiry);
    form.reset();
    fields.checkin.min = todayLocal();
    fields.checkout.min = todayLocal();
    Object.keys(fields).forEach((key) => setFieldState(key, ""));
    status.textContent =
      "Thank you! Your details passed validation. This demo does not send the enquiry yet; connect a backend or email service to receive bookings.";
    status.className = "form-status success";
  });
})();
