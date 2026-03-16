/* RemoteEdge — Complete Application Page */

(function () {
  "use strict";

  /* ========================================
     SUPABASE CONFIG
     ======================================== */
  var SUPABASE_URL = "https://adfxertqtrisgyujmjkm.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZnhlcnRxdHJpc2d5dWptamttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDMxOTEsImV4cCI6MjA4ODU3OTE5MX0.08smbO5WzXw1eAbBXwhqKOa4RmbEqggH2Yxc8uj5SI8";

  var headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY
  };

  /* ========================================
     THEME TOGGLE (minimal — match main site)
     ======================================== */
  var root = document.documentElement;

  /* ========================================
     GET APPLICATION ID FROM URL
     ======================================== */
  var params = new URLSearchParams(window.location.search);
  var applicationId = params.get("id");

  var loadingState = document.getElementById("loading-state");
  var errorState = document.getElementById("error-state");
  var completedState = document.getElementById("completed-state");
  var completionForm = document.getElementById("completion-form");
  var applicantNameEl = document.getElementById("applicant-name");

  if (!applicationId) {
    loadingState.hidden = true;
    errorState.hidden = false;
    return;
  }

  /* ========================================
     LOAD APPLICATION
     ======================================== */
  fetch(SUPABASE_URL + "/rest/v1/applications?id=eq." + applicationId + "&select=id,first_name,status", {
    headers: headers
  }).then(function (res) {
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  }).then(function (rows) {
    if (!rows || rows.length === 0) {
      loadingState.hidden = true;
      errorState.hidden = false;
      return;
    }

    var app = rows[0];

    if (app.status === "completed") {
      loadingState.hidden = true;
      completedState.hidden = false;
      return;
    }

    // Show the form
    loadingState.hidden = true;
    completionForm.hidden = false;
    applicantNameEl.textContent = app.first_name;
    initForm(app.id);
  }).catch(function () {
    loadingState.hidden = true;
    errorState.hidden = false;
  });

  /* ========================================
     CONVERSATIONAL FORM (completion steps)
     ======================================== */
  function initForm(appId) {
    var convoWrapper = document.getElementById("convo-wrapper");
    var formSuccess = document.getElementById("form-success");

    var ALL_STEPS = [1, 2, 3, 4, 5, 6, 7, 8];
    var LAST_STEP = 8;
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

    // Choice groups
    setupChoiceGroup("cf-experience-choices", "cf-experience");
    setupChoiceGroup("cf-availability-choices", "cf-availability");

    function setupChoiceGroup(groupId, hiddenId) {
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
        var err = group.closest(".convo-fields").querySelector(".convo-error");
        if (err) err.classList.remove("visible");
        setTimeout(function () { goNext(); }, 350);
      });
    }

    // File input
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
      if (convoWrapper.offsetParent === null) return;
      if (formSuccess && !formSuccess.hidden) return;

      if (e.key === "Enter") {
        var active = document.activeElement;
        if (active && active.tagName === "TEXTAREA" && e.shiftKey) return;
        if (active && active.tagName === "TEXTAREA" && !e.shiftKey) {
          e.preventDefault();
          goNext();
          return;
        }
        if (active && active.tagName === "BUTTON") return;
        e.preventDefault();
        goNext();
      }
    });

    function getStepEl(n) {
      return convoWrapper.querySelector('.convo-step[data-step="' + n + '"]');
    }

    function updateUI() {
      var idx = ALL_STEPS.indexOf(currentStep);
      var total = ALL_STEPS.length;

      progressBar.style.width = (((idx + 1) / total) * 100) + "%";
      stepCount.textContent = (idx + 1) + " of " + total;
      btnBack.hidden = currentStep === 1;

      var isLast = currentStep === LAST_STEP;
      if (isLast) {
        btnNext.innerHTML = 'Submit application <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.3 4L6 11.3 2.7 8"/></svg>';
      } else {
        btnNext.innerHTML = 'Continue <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
      }

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

      stepEl.querySelectorAll("[data-required]").forEach(function (el) {
        var val = el.value ? el.value.trim() : "";
        if (!val) {
          el.classList.add("error");
          var err = el.closest(".convo-field, .convo-fields");
          if (err) {
            var errMsg = err.querySelector(".convo-error");
            if (errMsg) errMsg.classList.add("visible");
          }
          el.classList.remove("shake");
          void el.offsetWidth;
          el.classList.add("shake");
          valid = false;
        }
      });

      // File validation on last step
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

      fromEl.classList.remove("active", "entering-from-left");
      fromEl.classList.add(exitClass);

      setTimeout(function () {
        fromEl.classList.remove(exitClass);
        fromEl.style.display = "none";
        toEl.style.display = "";
        toEl.classList.remove("exiting-left", "exiting-right");
        toEl.classList.add(direction === "forward" ? "active" : "entering-from-left");

        setTimeout(function () {
          var firstInput = toEl.querySelector("input:not([type=hidden]):not([type=file]), select, textarea");
          if (firstInput) firstInput.focus();
        }, 100);
      }, 280);
    }

    function goNext() {
      if (isSubmitting) return;
      if (!validateStep(currentStep)) return;

      if (currentStep === LAST_STEP) {
        submitForm();
        return;
      }

      var prev = currentStep;
      var idx = ALL_STEPS.indexOf(currentStep);
      currentStep = ALL_STEPS[idx + 1];
      updateUI();
      transitionStep(prev, currentStep, "forward");
    }

    function goBack() {
      if (currentStep <= 1 || isSubmitting) return;
      var prev = currentStep;
      var idx = ALL_STEPS.indexOf(currentStep);
      currentStep = ALL_STEPS[idx - 1];
      updateUI();
      transitionStep(prev, currentStep, "backward");
    }

    function submitForm() {
      isSubmitting = true;
      btnNext.innerHTML = "Finishing up\u2026";
      btnNext.classList.add("submitting");
      btnNext.setAttribute("disabled", "true");

      // Upload resume first
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
          experience: document.getElementById("cf-experience").value,
          availability: document.getElementById("cf-availability").value,
          interest_spark: document.getElementById("cf-interest").value.trim(),
          learning_approach: document.getElementById("cf-learning").value.trim(),
          conflict_resolution: document.getElementById("cf-conflict").value.trim(),
          work_style: document.getElementById("cf-workstyle").value.trim(),
          additional_info: document.getElementById("cf-additional").value.trim() || null,
          resume_url: resumeUrl,
          status: "completed",
          completed_at: new Date().toISOString()
        };

        return fetch(SUPABASE_URL + "/rest/v1/applications?id=eq." + appId, {
          method: "PATCH",
          headers: Object.assign({}, headers, {
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          }),
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error("Update failed");
        });
      }).then(function () {
        convoWrapper.hidden = true;
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("Application completed successfully!");
        setTimeout(launchConfetti, 600);
      }).catch(function () {
        showToast("Something went wrong. Please check your connection and try again.");
        isSubmitting = false;
        btnNext.removeAttribute("disabled");
        btnNext.classList.remove("submitting");
        btnNext.innerHTML = 'Submit application <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.3 4L6 11.3 2.7 8"/></svg>';
      });
    }

    // Initialize
    updateUI();
    var firstStep = getStepEl(1);
    if (firstStep) {
      var firstInput = firstStep.querySelector("input");
      if (firstInput) {
        setTimeout(function () { firstInput.focus(); }, 300);
      }
    }
  }

  /* ========================================
     CONFETTI
     ======================================== */
  function launchConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var colors = ['#1B4332', '#A84830', '#2D6A4F', '#C96B55', '#C49234', '#52B788'];
    var particles = [];
    for (var i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 300,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 2,
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.vy += 0.14;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rot += p.rv;
        p.opacity -= 0.007;
        if (p.opacity <= 0) continue;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  /* ========================================
     TOAST
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
      setTimeout(function () { toast.remove(); }, 500);
    }, 4000);
  }

})();
