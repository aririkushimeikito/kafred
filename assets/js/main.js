/* ==========================================================================
   Kafred Granite & Marble Installation Services — main.js
   Vanilla JavaScript only. Every feature is progressive: the site works
   without JS; these scripts add the mobile menu, header shadow, gallery
   filters, lightbox, inquiry-form handling, reveal animation and the
   dynamic copyright year.
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Dynamic copyright year ---------- */
  var yearEl = document.getElementById("copyright-year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var desktop = window.matchMedia("(min-width: 960px)");
    var closeNav = function (returnFocus) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      if (returnFocus) { toggle.focus(); }
    };
    var openNav = function () {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      var first = nav.querySelector("a");
      if (first) { first.focus(); }
    };
    toggle.addEventListener("click", function () {
      nav.classList.contains("is-open") ? closeNav(true) : openNav();
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && !desktop.matches) { closeNav(false); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(true); }
      // Keep keyboard focus inside the open mobile menu.
      if (e.key === "Tab" && nav.classList.contains("is-open") && !desktop.matches) {
        var focusables = nav.querySelectorAll("a, button");
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); toggle.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); toggle.focus(); }
        else if (!e.shiftKey && document.activeElement === toggle) { e.preventDefault(); first.focus(); }
      }
    });
    var onChange = function () { if (desktop.matches) { closeNav(false); } };
    if (desktop.addEventListener) { desktop.addEventListener("change", onChange); } else { desktop.addListener(onChange); }
  }

  /* ---------- Hero slideshow ----------
     Crossfades between project photos. Auto-advance pauses on hover, focus,
     when the tab is hidden, or when the visitor presses pause; it is off
     entirely under prefers-reduced-motion (manual controls still work). */
  var slideshow = document.querySelector("[data-slideshow]");
  if (slideshow) {
    var slides = Array.prototype.slice.call(slideshow.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slideshow.querySelectorAll("[data-slide-to]"));
    var pauseBtn = slideshow.querySelector("[data-slide-pause]");
    var captionEl = document.querySelector("[data-slide-caption]");
    var interval = parseInt(slideshow.getAttribute("data-interval"), 10) || 5000;
    var index = 0, timer = null, userPaused = false, hovering = false;

    var loadSlide = function (n) {
      var img = slides[(n + slides.length) % slides.length].querySelector("img[data-src]");
      if (!img) { return; }
      img.srcset = img.getAttribute("data-srcset") || "";
      img.src = img.getAttribute("data-src");
      img.removeAttribute("data-src"); img.removeAttribute("data-srcset");
    };
    var loadAll = function () { slides.forEach(function (_, n) { loadSlide(n); }); };
    var goTo = function (i) {
      index = (i + slides.length) % slides.length;
      loadSlide(index); loadSlide(index + 1); loadSlide(index + 2);
      slides.forEach(function (s, n) {
        var active = n === index;
        s.classList.toggle("is-active", active);
        if (active) { s.removeAttribute("aria-hidden"); } else { s.setAttribute("aria-hidden", "true"); }
      });
      dots.forEach(function (d, n) { if (n === index) { d.setAttribute("aria-current", "true"); } else { d.removeAttribute("aria-current"); } });
      if (captionEl) { captionEl.textContent = slides[index].getAttribute("data-caption") || ""; }
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var start = function () {
      stop();
      if (reduceMotion || userPaused || hovering || document.hidden || slides.length < 2) { return; }
      timer = setInterval(function () { goTo(index + 1); }, interval);
    };
    var restart = function () { start(); };

    // Any manual navigation means the visitor is browsing: fetch every remaining slide now.
    slideshow.querySelector("[data-slide-prev]").addEventListener("click", function () { loadAll(); goTo(index - 1); restart(); });
    slideshow.querySelector("[data-slide-next]").addEventListener("click", function () { loadAll(); goTo(index + 1); restart(); });
    dots.forEach(function (d) { d.addEventListener("click", function () { loadAll(); goTo(parseInt(d.getAttribute("data-slide-to"), 10)); restart(); }); });
    if (pauseBtn) {
      if (reduceMotion) { pauseBtn.hidden = true; }
      pauseBtn.addEventListener("click", function () {
        userPaused = !userPaused;
        pauseBtn.setAttribute("aria-pressed", userPaused ? "true" : "false");
        pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
        userPaused ? stop() : start();
      });
    }
    slideshow.addEventListener("mouseenter", function () { hovering = true; stop(); });
    slideshow.addEventListener("mouseleave", function () { hovering = false; start(); });
    slideshow.addEventListener("focusin", function () { hovering = true; stop(); });
    slideshow.addEventListener("focusout", function (e) { if (!slideshow.contains(e.relatedTarget)) { hovering = false; start(); } });
    slideshow.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
    });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    var sx = null;
    slideshow.addEventListener("touchstart", function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    slideshow.addEventListener("touchend", function (e) {
      if (sx === null) { return; }
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { loadAll(); goTo(dx > 0 ? index - 1 : index + 1); restart(); }
    }, { passive: true });
    goTo(0);
    start();
  }

  /* ---------- Reveal on scroll (subtle, respects reduced motion) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Gallery filters ---------- */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    var buttons = filterBar.querySelectorAll(".filter-btn");
    var items = document.querySelectorAll("[data-filter-target] .work-item");
    var status = document.querySelector("[data-filter-status]");
    var empty = document.querySelector("[data-filter-empty]");
    var applyFilter = function (key) {
      var shown = 0;
      items.forEach(function (item) {
        var cats = (item.getAttribute("data-category") || "").split(/\s+/);
        var show = key === "all" || cats.indexOf(key) !== -1;
        item.classList.toggle("is-hidden", !show);
        if (show) { shown++; }
      });
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === key ? "true" : "false"); });
      if (status) { status.textContent = "Showing " + shown + " of " + items.length + " projects."; }
      if (empty) { empty.hidden = shown !== 0; }
    };
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () { applyFilter(btn.getAttribute("data-filter")); });
    });
    applyFilter("all");
  }

  /* ---------- Lightbox ---------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (triggers.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Enlarged project photo");
    lb.innerHTML =
      '<button type="button" class="lightbox__btn lightbox__close" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Previous photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<figure class="lightbox__figure"><img class="lightbox__img" alt="" width="1600" height="1200">' +
        '<figcaption class="lightbox__caption"></figcaption><span class="lightbox__count"></span></figure>' +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="Next photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector(".lightbox__img");
    var lbCap = lb.querySelector(".lightbox__caption");
    var lbCount = lb.querySelector(".lightbox__count");
    var closeBtn = lb.querySelector(".lightbox__close");
    var prevBtn = lb.querySelector(".lightbox__prev");
    var nextBtn = lb.querySelector(".lightbox__next");
    var current = -1, lastFocus = null;

    var visibleTriggers = function () {
      return triggers.filter(function (t) { return !t.closest(".is-hidden"); });
    };
    var show = function (index) {
      var list = visibleTriggers();
      if (!list.length) { return; }
      current = (index + list.length) % list.length;
      var t = list[current];
      var img = t.querySelector("img");
      var medium = t.getAttribute("data-src-medium");
      var needLarge = Math.max(window.innerWidth, window.innerHeight) * (window.devicePixelRatio || 1) > 1300;
      lbImg.src = (!needLarge && medium) ? medium : t.getAttribute("href");
      lbImg.alt = img ? img.alt : "";
      if (t.hasAttribute("data-width")) { lbImg.width = t.getAttribute("data-width"); lbImg.height = t.getAttribute("data-height"); }
      lbCap.textContent = t.getAttribute("data-caption") || (img ? img.alt : "");
      lbCount.textContent = (current + 1) + " / " + list.length;
      var single = list.length < 2;
      prevBtn.hidden = single; nextBtn.hidden = single;
    };
    var open = function (index) {
      lastFocus = document.activeElement;
      show(index);
      lb.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      closeBtn.focus();
    };
    var close = function () {
      lb.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      lbImg.removeAttribute("src");
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    };

    triggers.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        open(visibleTriggers().indexOf(t));
      });
    });
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { show(current - 1); });
    nextBtn.addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) { close(); } });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) { return; }
      if (e.key === "Escape") { close(); }
      else if (e.key === "ArrowLeft") { show(current - 1); }
      else if (e.key === "ArrowRight") { show(current + 1); }
      else if (e.key === "Tab") {
        var f = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Basic touch swipe
    var touchX = null;
    lb.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (touchX === null) { return; }
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 50) { show(dx > 0 ? current - 1 : current + 1); }
    }, { passive: true });
  }

  /* ---------- Inquiry form ----------
     Submits to the FormSubmit endpoint in data-endpoint (AJAX, JSON reply).
     The page reports success only when the service confirms it; otherwise it
     shows the phone and Messenger alternatives. Without JavaScript the form
     posts normally to FormSubmit, which returns the visitor to ?sent=1. */
  var form = document.getElementById("inquiry-form");
  if (form) {
    var endpoint = (form.getAttribute("data-endpoint") || "").trim() || form.getAttribute("action");
    var statusBox = document.getElementById("form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var fields = {
      name: form.querySelector("#inq-name"),
      contact: form.querySelector("#inq-contact"),
      service: form.querySelector("#inq-service"),
      message: form.querySelector("#inq-message")
    };
    var replyTo = form.querySelector("#inq-replyto");
    var fallbackLinks = ' Please call <a href="tel:+639530849511">+63 953 084 9511</a> or message us on <a href="https://m.me/kafred.services" target="_blank" rel="noopener">Facebook Messenger</a>.';
    var setError = function (field, msg) {
      var err = document.getElementById(field.id + "-error");
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) { err.textContent = msg || ""; err.classList.toggle("is-visible", !!msg); }
    };
    var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
    var validate = function () {
      var ok = true;
      Object.keys(fields).forEach(function (k) { setError(fields[k], ""); });
      if (!fields.name.value.trim()) { setError(fields.name, "Please enter your name."); ok = false; }
      var c = fields.contact.value.trim();
      var looksPhone = /^[+\d][\d\s().-]{6,}$/.test(c);
      if (!c) { setError(fields.contact, "Please enter a phone number or email address."); ok = false; }
      else if (!looksPhone && !isEmail(c)) { setError(fields.contact, "Please enter a valid phone number or email address."); ok = false; }
      if (!fields.service.value) { setError(fields.service, "Please choose the service you are asking about."); ok = false; }
      if (fields.message.value.trim().length < 10) { setError(fields.message, "Please describe your request in a few words (at least 10 characters)."); ok = false; }
      if (!ok) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) { firstBad.focus(); }
      }
      return ok;
    };
    var showStatus = function (html, isError) {
      statusBox.innerHTML = html;
      statusBox.classList.toggle("form-status--error", !!isError);
      statusBox.hidden = false;
      statusBox.setAttribute("tabindex", "-1");
      statusBox.focus();
    };
    var escapeHtml = function (v) { return String(v).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); };

    // Returned here by the no-JavaScript path (FormSubmit's _next redirect)
    if (/[?&]sent=1/.test(location.search)) {
      showStatus("<p><strong>Thank you.</strong> Your inquiry has been sent to Kafred. We will get back to you using the contact details you provided.</p>", false);
      if (window.history && history.replaceState) { history.replaceState(null, "", location.pathname); }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) { return; }
      if (!validate()) { return; }
      if (replyTo) { replyTo.value = isEmail(fields.contact.value.trim()) ? fields.contact.value.trim() : ""; }

      submitBtn.disabled = true;
      var original = submitBtn.textContent;
      submitBtn.textContent = "Submitting…";
      var data = new FormData(form);
      fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            var success = res.ok && (body.success === true || body.success === "true");
            if (success) {
              form.reset();
              showStatus("<p><strong>Thank you.</strong> Your inquiry has been sent to Kafred. We will get back to you using the contact details you provided.</p>", false);
            } else {
              var reason = body && body.message ? " " + escapeHtml(body.message) : "";
              showStatus("<p><strong>Your message could not be sent.</strong>" + reason + fallbackLinks + "</p>", true);
            }
          });
        })
        .catch(function () {
          showStatus("<p><strong>Your message could not be sent.</strong>" + fallbackLinks + "</p>", true);
        })
        .finally(function () { submitBtn.disabled = false; submitBtn.textContent = original; });
    });
    Object.keys(fields).forEach(function (k) {
      fields[k].addEventListener("input", function () { if (fields[k].getAttribute("aria-invalid") === "true") { setError(fields[k], ""); } });
    });
  }
})();
