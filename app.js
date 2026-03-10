/* RemoteEdge — App JavaScript */

(function () {
  "use strict";

  /* ========================================
     SUPABASE CONFIG
     ======================================== */
  var SUPABASE_URL = "https://adfxertqtrisgyujmjkm.supabase.co"; // e.g. "https://xyzcompany.supabase.co"
  var SUPABASE_KEY = "sb_publishable_mCTFFkVk8j2NV-DFtq1ahQ_xIHG1N1A"; // anon/public key (safe for frontend)

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
      // Spin icon on toggle for a satisfying switch
      themeToggle.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      themeToggle.style.transform = "rotate(360deg)";
      setTimeout(function () {
        themeToggle.style.transition = "";
        themeToggle.style.transform = "";
      }, 500);
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

  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 10) {
        nav.classList.add("nav--scrolled");
      } else {
        nav.classList.remove("nav--scrolled");
      }
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

    counters.forEach(function (counter, index) {
      var target = parseInt(counter.getAttribute("data-target"), 10);
      var duration = 1600;
      var startTime = null;
      // Stagger each counter
      var delay = index * 200;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime - delay;
        if (elapsed < 0) {
          requestAnimationFrame(step);
          return;
        }
        var progress = Math.min(elapsed / duration, 1);
        // Ease out expo for smoother deceleration
        var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        counter.textContent = Math.round(target * eased);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target;
          // Brief scale pulse on completion
          var item = counter.closest(".stat-item");
          if (item) {
            item.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
            item.style.transform = "scale(1.08)";
            setTimeout(function () {
              item.style.transform = "scale(1)";
            }, 200);
          }
        }
      }

      requestAnimationFrame(step);
    });
  }

  window.addEventListener("scroll", animateCounters, { passive: true });
  animateCounters();

  /* ========================================
     SCROLL REVEAL — staggered by group
     ======================================== */
  var revealElements = document.querySelectorAll(".fade-in");
  if (revealElements.length > 0 && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger siblings in grids
            var el = entry.target;
            var parent = el.parentElement;
            var siblings = parent
              ? Array.from(parent.querySelectorAll(":scope > .fade-in.js-reveal-hidden"))
              : [];
            var idx = siblings.indexOf(el);
            var delay = idx >= 0 ? idx * 100 : 0;

            setTimeout(function () {
              el.classList.remove("js-reveal-hidden");
              el.classList.add("js-reveal-visible");
            }, delay);

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -60px 0px" }
    );

    revealElements.forEach(function (el) {
      el.classList.add("js-reveal-hidden");

      // Assign directional reveals for variety
      if (el.closest(".stats-section") || el.closest(".form-section")) {
        el.setAttribute("data-reveal", "scale");
      } else if (el.closest(".hero-visual")) {
        el.setAttribute("data-reveal", "scale");
      }
      // Grid children: alternate left/right on even/odd
      var parent = el.parentElement;
      if (parent && (parent.classList.contains("why-grid") || parent.classList.contains("categories-grid"))) {
        var gridSiblings = Array.from(parent.querySelectorAll(":scope > .fade-in"));
        var gridIdx = gridSiblings.indexOf(el);
        if (gridIdx % 2 === 1) {
          el.setAttribute("data-reveal", "right");
        }
      }

      observer.observe(el);
    });
  }

  /* ========================================
     HERO SHAPE PARALLAX
     Store base transforms, apply parallax via rAF-guarded scroll.
     ======================================== */
  var heroShapes = document.querySelectorAll(".hero-shape");
  if (heroShapes.length > 0) {
    var speeds = [0.03, -0.02, 0.015];
    var baseTransforms = [];
    heroShapes.forEach(function (shape) {
      baseTransforms.push(getComputedStyle(shape).transform || "none");
    });

    var parallaxTicking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (!parallaxTicking) {
          parallaxTicking = true;
          requestAnimationFrame(function () {
            var scrollY = window.scrollY;
            heroShapes.forEach(function (shape, i) {
              var speed = speeds[i] || 0.02;
              var base = baseTransforms[i];
              var translateY = "translateY(" + (scrollY * speed) + "px)";
              shape.style.transform = (base !== "none" ? base + " " : "") + translateY;
            });
            parallaxTicking = false;
          });
        }
      },
      { passive: true }
    );
  }

  /* ========================================
     CONVERSATIONAL FORM
     ======================================== */
  var convoWrapper = document.getElementById("convo-wrapper");
  var formSuccess = document.getElementById("form-success");

  if (convoWrapper) {
    // All step numbers in order. Step 4 (school details) is conditional.
    var ALL_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    var CONDITIONAL_STEP = 4; // school details — only if student
    var LAST_STEP = 15;
    var isStudent = false;
    var currentStep = 1;
    var isSubmitting = false;

    var progressBar = document.getElementById("convo-progress-bar");
    var stepCount = document.getElementById("convo-step-count");
    var btnNext = document.getElementById("convo-next");
    var btnBack = document.getElementById("convo-back");
    var enterHint = document.getElementById("convo-enter-hint");
    var fileInput = document.getElementById("cf-resume");
    var fileLabel = document.getElementById("convo-file-label");
    var fileText = document.getElementById("convo-file-text");
    var fileArea = document.getElementById("convo-file-area");

    function getActiveSteps() {
      return ALL_STEPS.filter(function (s) {
        if (s === CONDITIONAL_STEP && !isStudent) return false;
        return true;
      });
    }

    // Choice buttons (role, experience, availability, student)
    setupChoiceGroup("cf-role-choices", "cf-role");
    setupChoiceGroup("cf-experience-choices", "cf-experience");
    setupChoiceGroup("cf-availability-choices", "cf-availability");
    setupChoiceGroup("cf-student-choices", "cf-student", function (value) {
      isStudent = value === "yes";
    });

    function setupChoiceGroup(groupId, hiddenId, onSelect) {
      var group = document.getElementById(groupId);
      var hidden = document.getElementById(hiddenId);
      if (!group || !hidden) return;
      group.addEventListener("click", function (e) {
        var btn = e.target.closest(".convo-choice");
        if (!btn) return;
        group.querySelectorAll(".convo-choice").forEach(function (b) {
          b.classList.remove("selected");
        });
        btn.classList.add("selected");
        hidden.value = btn.getAttribute("data-value");
        // Clear error
        var err = group.closest(".convo-fields").querySelector(".convo-error");
        if (err) err.classList.remove("visible");
        // Callback
        if (onSelect) onSelect(btn.getAttribute("data-value"));
        // Auto-advance after a short delay for choice buttons
        setTimeout(function () { goNext(); }, 350);
      });
    }

    // File input handling
    if (fileInput && fileLabel && fileText) {
      fileInput.addEventListener("change", function () {
        if (this.files && this.files.length > 0) {
          fileText.textContent = this.files[0].name;
          fileLabel.classList.add("has-file");
          var err = fileInput.closest(".convo-field").querySelector(".convo-error");
          if (err) err.classList.remove("visible");
        } else {
          fileText.textContent = "Choose a file or drag it here";
          fileLabel.classList.remove("has-file");
        }
      });

      // Drag and drop
      if (fileArea) {
        ["dragenter", "dragover"].forEach(function (evt) {
          fileArea.addEventListener(evt, function (e) {
            e.preventDefault();
            fileArea.classList.add("drag-active");
          });
        });
        ["dragleave", "drop"].forEach(function (evt) {
          fileArea.addEventListener(evt, function (e) {
            e.preventDefault();
            fileArea.classList.remove("drag-active");
          });
        });
      }
    }

    // Clear errors on input
    convoWrapper.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        el.classList.remove("error");
        var err = el.closest(".convo-field, .convo-fields");
        if (err) {
          var errMsg = err.querySelector(".convo-error");
          if (errMsg) errMsg.classList.remove("visible");
        }
      });
    });

    // Navigation
    btnNext.addEventListener("click", goNext);
    btnBack.addEventListener("click", goBack);

    // Keyboard: Enter to advance
    document.addEventListener("keydown", function (e) {
      // Only act if convo form is visible
      if (convoWrapper.offsetParent === null) return;
      if (formSuccess && !formSuccess.hidden) return;

      if (e.key === "Enter") {
        var active = document.activeElement;
        // Allow Shift+Enter for newlines in textareas
        if (active && active.tagName === "TEXTAREA" && e.shiftKey) return;
        // Don't intercept Enter in textareas without Shift
        if (active && active.tagName === "TEXTAREA" && !e.shiftKey) {
          e.preventDefault();
          goNext();
          return;
        }
        // Prevent double-submission
        if (active && active.tagName === "BUTTON") return;
        e.preventDefault();
        goNext();
      }
    });

    function getStepEl(n) {
      return convoWrapper.querySelector('.convo-step[data-step="' + n + '"]');
    }

    function updateUI() {
      var activeSteps = getActiveSteps();
      var idx = activeSteps.indexOf(currentStep);
      var total = activeSteps.length;

      progressBar.style.width = (((idx + 1) / total) * 100) + "%";
      stepCount.textContent = (idx + 1) + " of " + total;
      btnBack.hidden = currentStep === 1;

      var isLast = currentStep === activeSteps[activeSteps.length - 1];
      if (isLast) {
        btnNext.innerHTML = 'Submit application <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.3 4L6 11.3 2.7 8"/></svg>';
      } else {
        btnNext.innerHTML = 'Continue <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
      }

      // Show/hide enter hint for textarea steps
      var stepEl = getStepEl(currentStep);
      if (stepEl && stepEl.querySelector("textarea")) {
        enterHint.innerHTML = 'Press <kbd>Enter</kbd> to continue';
      } else {
        enterHint.innerHTML = 'Press <kbd>Enter</kbd>';
      }
    }

    function validateStep(n) {
      var stepEl = getStepEl(n);
      if (!stepEl) return true;
      var valid = true;

      // Check required inputs/selects/textareas
      stepEl.querySelectorAll("[data-required]").forEach(function (el) {
        var val = el.value ? el.value.trim() : "";
        if (!val) {
          el.classList.add("error");
          var err = el.closest(".convo-field, .convo-fields");
          if (err) {
            var errMsg = err.querySelector(".convo-error");
            if (errMsg) errMsg.classList.add("visible");
          }
          // Shake
          el.classList.remove("shake");
          void el.offsetWidth;
          el.classList.add("shake");
          valid = false;
        }
        // Email validation
        if (el.getAttribute("data-type") === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          el.classList.add("error");
          var err2 = el.closest(".convo-field");
          if (err2) {
            var errMsg2 = err2.querySelector(".convo-error");
            if (errMsg2) errMsg2.classList.add("visible");
          }
          valid = false;
        }
      });

      // Check file input on resume step
      if (n === LAST_STEP && fileInput) {
        if (!fileInput.files || fileInput.files.length === 0) {
          var err = fileInput.closest(".convo-field").querySelector(".convo-error");
          if (err) err.classList.add("visible");
          valid = false;
        }
      }

      return valid;
    }

    function transitionStep(from, to, direction) {
      var fromEl = getStepEl(from);
      var toEl = getStepEl(to);
      if (!fromEl || !toEl) return;

      var exitClass = direction === "forward" ? "exiting-left" : "exiting-right";
      var enterClass = direction === "forward" ? "active" : "entering-from-left";

      fromEl.classList.remove("active", "entering-from-left");
      fromEl.classList.add(exitClass);

      setTimeout(function () {
        fromEl.classList.remove(exitClass);
        fromEl.style.display = "none";
        toEl.style.display = "";
        toEl.classList.remove("exiting-left", "exiting-right");
        toEl.classList.add(enterClass);

        // Focus first input
        setTimeout(function () {
          var firstInput = toEl.querySelector("input:not([type=hidden]):not([type=file]), select, textarea");
          if (firstInput) firstInput.focus();
        }, 100);
      }, 280);
    }

    function getNextStep() {
      var activeSteps = getActiveSteps();
      var idx = activeSteps.indexOf(currentStep);
      if (idx < activeSteps.length - 1) return activeSteps[idx + 1];
      return null;
    }

    function getPrevStep() {
      var activeSteps = getActiveSteps();
      var idx = activeSteps.indexOf(currentStep);
      if (idx > 0) return activeSteps[idx - 1];
      return null;
    }

    function goNext() {
      if (isSubmitting) return;

      if (!validateStep(currentStep)) return;

      var activeSteps = getActiveSteps();
      var isLast = currentStep === activeSteps[activeSteps.length - 1];
      if (isLast) {
        submitForm();
        return;
      }

      var prev = currentStep;
      currentStep = getNextStep();
      updateUI();
      transitionStep(prev, currentStep, "forward");
    }

    function goBack() {
      if (currentStep <= 1 || isSubmitting) return;
      var prev = currentStep;
      currentStep = getPrevStep();
      updateUI();
      transitionStep(prev, currentStep, "backward");
    }

    function submitForm() {
      isSubmitting = true;
      btnNext.innerHTML = "Sending your application\u2026";
      btnNext.classList.add("submitting");
      btnNext.setAttribute("disabled", "true");

      var headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      };

      // Upload resume
      var resumePromise;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        var file = fileInput.files[0];
        var fileName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        resumePromise = fetch(SUPABASE_URL + "/storage/v1/object/resumes/" + encodeURIComponent(fileName), {
          method: "POST",
          headers: Object.assign({}, headers, { "Content-Type": file.type }),
          body: file
        }).then(function (res) {
          if (!res.ok) return null;
          return SUPABASE_URL + "/storage/v1/object/public/resumes/" + encodeURIComponent(fileName);
        }).catch(function () { return null; });
      } else {
        resumePromise = Promise.resolve(null);
      }

      resumePromise.then(function (resumeUrl) {
        var data = {
          first_name: document.getElementById("cf-firstName").value.trim(),
          last_name: document.getElementById("cf-lastName").value.trim(),
          email: document.getElementById("cf-email").value.trim(),
          phone: document.getElementById("cf-phone").value.trim(),
          state: document.getElementById("cf-state").value,
          role: document.getElementById("cf-role").value,
          experience: document.getElementById("cf-experience").value,
          availability: document.getElementById("cf-availability").value,
          is_student: isStudent,
          school_name: isStudent ? document.getElementById("cf-schoolName").value.trim() : null,
          school_email: isStudent ? document.getElementById("cf-schoolEmail").value.trim() : null,
          interest_spark: document.getElementById("cf-interest").value.trim(),
          learning_approach: document.getElementById("cf-learning").value.trim(),
          conflict_resolution: document.getElementById("cf-conflict").value.trim(),
          work_style: document.getElementById("cf-workstyle").value.trim(),
          additional_info: document.getElementById("cf-additional").value.trim() || null,
          resume_url: resumeUrl
        };

        return fetch(SUPABASE_URL + "/rest/v1/applications", {
          method: "POST",
          headers: Object.assign({}, headers, {
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          }),
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error("Insert failed");
        });
      }).then(function () {
        convoWrapper.hidden = true;
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("Application submitted successfully!");
      }).catch(function () {
        showToast("We couldn't submit your application. Check your connection and try again.");
        isSubmitting = false;
        btnNext.removeAttribute("disabled");
        btnNext.classList.remove("submitting");
        btnNext.innerHTML = 'Submit application <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.3 4L6 11.3 2.7 8"/></svg>';
      });
    }

    // Initialize
    updateUI();
    // Focus first input on load if visible
    var firstStep = getStepEl(1);
    if (firstStep) {
      var firstInput = firstStep.querySelector("input");
      if (firstInput) {
        setTimeout(function () {
          if (firstStep.getBoundingClientRect().top < window.innerHeight) {
            firstInput.focus();
          }
        }, 500);
      }
    }
  }


  /* ========================================
     TOAST NOTIFICATION
     ======================================== */
  function showToast(message) {
    var existing = document.querySelector(".toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add("visible");
      });
    });

    setTimeout(function () {
      toast.classList.remove("visible");
      setTimeout(function () {
        toast.remove();
      }, 500);
    }, 4000);
  }

  /* ========================================
     FAQ SMOOTH EXPAND / COLLAPSE
     CSS handles opening via grid-template-rows.
     JS intercepts closing to animate before removing [open].
     ======================================== */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var summary = item.querySelector(".faq-question");
    if (!summary) return;

    summary.addEventListener("click", function (e) {
      if (item.open && !item.classList.contains("faq-closing")) {
        e.preventDefault();
        item.classList.add("faq-closing");

        var answer = item.querySelector(".faq-answer");
        if (!answer) return;

        function onEnd(evt) {
          if (evt.propertyName !== "grid-template-rows") return;
          item.classList.remove("faq-closing");
          item.open = false;
          answer.removeEventListener("transitionend", onEnd);
        }

        answer.addEventListener("transitionend", onEnd);
      }
    });
  });

  /* ========================================
     CONSOLE EASTER EGG
     ======================================== */
  console.log(
    "%c✦ RemoteEdge %c\n" +
    "The future of work is where you are.\n\n" +
    "Curious about what's under the hood?\n" +
    "We'd love to hear from you → hello@remoteedge.com",
    "font-family: Georgia, serif; font-size: 18px; font-weight: bold; font-style: italic; color: #1B4332;",
    "font-family: sans-serif; font-size: 12px; color: #5C5A52;"
  );
})();
