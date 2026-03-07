/* RemoteEdge — App JavaScript */

(function () {
  "use strict";

  /* ========================================
     THEME TOGGLE
     ======================================== */
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const root = document.documentElement;
  let currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  root.setAttribute("data-theme", currentTheme);
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", currentTheme);
      themeToggle.setAttribute(
        "aria-label",
        "Switch to " + (currentTheme === "dark" ? "light" : "dark") + " mode"
      );
      updateThemeIcon();
    });
  }

  function updateThemeIcon() {
    if (!themeToggle) return;
    themeToggle.innerHTML =
      currentTheme === "dark"
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  /* ========================================
     STICKY NAV SCROLL BEHAVIOR
     ======================================== */
  const nav = document.getElementById("nav");
  let lastScroll = 0;

  window.addEventListener(
    "scroll",
    function () {
      var scrollY = window.scrollY;
      if (scrollY > 10) {
        nav.classList.add("nav--scrolled");
      } else {
        nav.classList.remove("nav--scrolled");
      }
      lastScroll = scrollY;
    },
    { passive: true }
  );

  /* ========================================
     MOBILE MENU
     ======================================== */
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener("click", function () {
      var isOpen = !mobileMenu.hidden;
      mobileMenu.hidden = isOpen;
      mobileMenuToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileMenuToggle.innerHTML = isOpen
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.hidden = true;
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        mobileMenuToggle.innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      });
    });
  }

  /* ========================================
     SMOOTH SCROLL FOR ANCHOR LINKS
     ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ========================================
     STATS COUNTER ANIMATION
     ======================================== */
  var statsAnimated = false;

  function animateCounters() {
    if (statsAnimated) return;
    var counters = document.querySelectorAll("[data-target]");
    if (counters.length === 0) return;

    var firstCounter = counters[0];
    var rect = firstCounter.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.85) return;

    statsAnimated = true;

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute("data-target"), 10);
      var duration = 1200;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(step);
    });
  }

  window.addEventListener("scroll", animateCounters, { passive: true });
  // Also check on load
  animateCounters();

  /* ========================================
     SCROLL REVEAL
     ======================================== */
  var revealElements = document.querySelectorAll(".fade-in, .reveal-up");
  if (revealElements.length > 0 && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("js-reveal-hidden");
            entry.target.classList.add("js-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    revealElements.forEach(function (el) {
      el.classList.add("js-reveal-hidden");
      observer.observe(el);
    });
  }

  /* ========================================
     FORM VALIDATION & SUBMISSION
     ======================================== */
  var form = document.getElementById("application-form");
  var formSuccess = document.getElementById("form-success");

  if (form) {
    // File upload label update
    var fileInput = document.getElementById("resume");
    var fileLabel = document.querySelector(".file-label");
    var fileText = document.querySelector(".file-text");

    if (fileInput && fileLabel && fileText) {
      fileInput.addEventListener("change", function () {
        if (this.files && this.files.length > 0) {
          fileText.textContent = this.files[0].name;
          fileLabel.classList.add("has-file");
        } else {
          fileText.textContent = "Choose file or drag here";
          fileLabel.classList.remove("has-file");
        }
      });
    }

    // Real-time validation - clear errors on input
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        clearFieldError(this);
      });
      input.addEventListener("change", function () {
        clearFieldError(this);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate all fields
      var isValid = true;

      // Required text/email/tel inputs
      var requiredInputs = [
        "firstName",
        "lastName",
        "email",
        "phone",
      ];
      requiredInputs.forEach(function (name) {
        var input = document.getElementById(name);
        if (!input || !input.value.trim()) {
          showFieldError(input);
          isValid = false;
        } else if (name === "email" && !isValidEmail(input.value)) {
          showFieldError(input);
          isValid = false;
        }
      });

      // Required selects
      var requiredSelects = ["state", "role", "experience"];
      requiredSelects.forEach(function (name) {
        var select = document.getElementById(name);
        if (!select || !select.value) {
          showFieldError(select);
          isValid = false;
        }
      });

      // Required radio
      var availabilityChecked = form.querySelector(
        'input[name="availability"]:checked'
      );
      if (!availabilityChecked) {
        var errorEl = document.getElementById("availability-error");
        if (errorEl) errorEl.classList.add("visible");
        isValid = false;
      }

      if (!isValid) {
        // Scroll to first error
        var firstError = form.querySelector(".error, .form-error.visible");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // Show success
      form.hidden = true;
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: "smooth", block: "start" });

      // Show toast
      showToast("Application submitted successfully!");
    });
  }

  function showFieldError(input) {
    if (!input) return;
    input.classList.add("error");
    var errorEl = document.getElementById(input.id + "-error");
    if (errorEl) errorEl.classList.add("visible");
  }

  function clearFieldError(input) {
    if (!input) return;
    input.classList.remove("error");
    var errorEl = document.getElementById(input.id + "-error");
    if (errorEl) errorEl.classList.remove("visible");

    // Also clear availability error when a radio is selected
    if (input.name === "availability") {
      var avErr = document.getElementById("availability-error");
      if (avErr) avErr.classList.remove("visible");
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ========================================
     TOAST NOTIFICATION
     ======================================== */
  function showToast(message) {
    // Remove existing toast
    var existing = document.querySelector(".toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add("visible");
      });
    });

    // Auto-hide after 4s
    setTimeout(function () {
      toast.classList.remove("visible");
      setTimeout(function () {
        toast.remove();
      }, 400);
    }, 4000);
  }
})();
