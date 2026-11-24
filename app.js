/* ==========================================================================
   ORANGE — Interactive Motion & Optical Canvas Engine (app.js)
   - 60fps HTML5 Canvas Optical Fiber Light-Pulse Simulation (pauses offscreen)
   - Magnetic Shimmer CTA Button Tracking
   - Cursor-Tracking Spotlight Spec Cards
   - Sliding Pill Category Filter (ABC of UI #19)
   - Interactive GPON Wavelength Selector (1310nm / 1490nm / 1550nm)
   - Interactive Ecuador Dispatch Corridor Switcher
   - One-Click Procurement Copy + Floating Glass Toast (ABC of UI #24 & #40)
   - Below-the-Fold Mobile Sticky Tap-to-Call Dock + Scrollspy Nav
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Mobile Sticky Tap-to-Call Dock (IntersectionObserver) ── */
  var dock = document.getElementById("mobile-call-dock");
  var hero = document.getElementById("inicio");
  if (dock && hero && "IntersectionObserver" in window) {
    var dockObserver = new IntersectionObserver(
      function (entries) {
        dock.classList.toggle("is-visible", !entries[0].isIntersecting);
      },
      { threshold: 0.14 }
    );
    dockObserver.observe(hero);
  } else if (dock) {
    dock.classList.add("is-visible");
  }

  /* ── 2. Scrollspy Active Nav Pill ── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link[href^='#']"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var activeId = "#" + entry.target.id;
            navLinks.forEach(function (l) {
              l.classList.toggle("is-active", l.getAttribute("href") === activeId);
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (sec) {
      spyObserver.observe(sec);
    });
  }

  /* ── 3. Magnetic CTA Button (Fine Pointer Only) ── */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var magButtons = document.querySelectorAll("[data-magnetic]");
    magButtons.forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var rect = btn.getBoundingClientRect();
        var dx = (e.clientX - (rect.left + rect.width / 2)) * 0.14;
        var dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
        btn.style.setProperty("--mag-x", dx.toFixed(1) + "px");
        btn.style.setProperty("--mag-y", dy.toFixed(1) + "px");
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.setProperty("--mag-x", "0px");
        btn.style.setProperty("--mag-y", "0px");
      });
    });
  }

  /* ── 4. Cursor-Tracking Spotlight Cards ── */
  var specCards = document.querySelectorAll(".spec-card");
  specCards.forEach(function (card) {
    var surface = card.querySelector(".spec-card-surface");
    if (!surface) return;
    card.addEventListener("pointermove", function (e) {
      var rect = surface.getBoundingClientRect();
      surface.style.setProperty("--spot-x", (e.clientX - rect.left).toFixed(0) + "px");
      surface.style.setProperty("--spot-y", (e.clientY - rect.top).toFixed(0) + "px");
    });
  });

  /* ── 5. Interactive FTTH Category Filter Tabs (ABC of UI #19) ── */
  var filterTabs = document.querySelectorAll(".filter-tab[data-filter]");
  var filterableItems = document.querySelectorAll(".spec-card[data-category], .sku-pill[data-category]");
  filterTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var targetCat = tab.getAttribute("data-filter");
      filterTabs.forEach(function (t) {
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      filterableItems.forEach(function (item) {
        var cat = item.getAttribute("data-category");
        if (targetCat === "all" || cat === targetCat) {
          item.classList.remove("is-dimmed");
          item.classList.toggle("is-highlighted", targetCat !== "all");
        } else {
          item.classList.add("is-dimmed");
          item.classList.remove("is-highlighted");
        }
      });
    });
  });

  /* ── 7. Interactive Ecuador Dispatch Corridor Switcher ── */
  var routeBtns = document.querySelectorAll(".route-btn[data-route]");
  var routeEta = document.getElementById("route-eta");
  routeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      routeBtns.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      if (routeEta) {
        routeEta.textContent = btn.getAttribute("data-eta") || "Despacho 24h";
      }
    });
  });

  /* ── 8. One-Click Procurement Copy + Floating Toast (ABC of UI #24 & #40) ── */
  var copyChips = document.querySelectorAll(".copy-chip[data-copy]");
  var toast = document.getElementById("copy-toast");
  var toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-shown");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-shown");
    }, 2100);
  }

  copyChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var val = chip.getAttribute("data-copy");
      var label = chip.getAttribute("data-label") || "Dato";
      var span = chip.querySelector(".copy-chip-text");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).catch(function () {});
      }
      chip.classList.add("is-copied");
      if (span) span.textContent = "Copiado";
      showToast(label + " copiado: " + val);
      setTimeout(function () {
        chip.classList.remove("is-copied");
        if (span) span.textContent = "Copiar";
      }, 1700);
    });
  });

  /* ── 9. Live 60fps Optical Fiber Light-Pulse Canvas (Hero Backdrop) ── */
  var canvas = document.getElementById("hero-canvas");
  var toggleBtn = document.getElementById("canvas-toggle");
  if (!canvas || prefersReducedMotion) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var width = 0;
  var height = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var isPaused = false;
  var isHeroVisible = true;
  var rafId = null;
  var pointerX = 0.5;
  var pointerY = 0.5;

  var strands = [
    { y0: 0.76, y1: 0.34, sag: 0.14, color: "249, 115, 22", speed: 0.0032, offset: 0.1 },
    { y0: 0.82, y1: 0.42, sag: 0.17, color: "251, 146, 60", speed: 0.0025, offset: 0.45 },
    { y0: 0.68, y1: 0.26, sag: -0.11, color: "56, 189, 248", speed: 0.0029, offset: 0.72 },
    { y0: 0.88, y1: 0.52, sag: 0.12, color: "249, 115, 22", speed: 0.0038, offset: 0.28 },
    { y0: 0.62, y1: 0.78, sag: 0.15, color: "253, 186, 116", speed: 0.0022, offset: 0.84 }
  ];

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  hero.addEventListener(
    "pointermove",
    function (e) {
      var r = hero.getBoundingClientRect();
      pointerX = (e.clientX - r.left) / Math.max(1, r.width);
      pointerY = (e.clientY - r.top) / Math.max(1, r.height);
    },
    { passive: true }
  );

  function getPoint(s, t) {
    var x = t * width;
    var ctrlX = width * (0.48 + (pointerX - 0.5) * 0.12);
    var ctrlY = height * ((s.y0 + s.y1) * 0.5 + s.sag + (pointerY - 0.5) * 0.06);
    var mt = 1 - t;
    var px = mt * mt * 0 + 2 * mt * t * ctrlX + t * t * width;
    var py = mt * mt * (s.y0 * height) + 2 * mt * t * ctrlY + t * t * (s.y1 * height);
    return { x: px, y: py };
  }

  function render() {
    if (isPaused || !isHeroVisible) {
      rafId = null;
      return;
    }
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < strands.length; i++) {
      var s = strands[i];
      /* Faint base optical fiber strand */
      ctx.beginPath();
      for (var step = 0; step <= 32; step++) {
        var pt = getPoint(s, step / 32);
        if (step === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(" + s.color + ", 0.14)";
      ctx.lineWidth = 1.15;
      ctx.stroke();

      /* Advancing laser packet comet */
      s.offset = (s.offset + s.speed) % 1;
      var headT = s.offset;
      var tailLen = 0.13;
      var segments = 14;
      for (var k = 0; k < segments; k++) {
        var tA = headT - (k / segments) * tailLen;
        var tB = headT - ((k + 1) / segments) * tailLen;
        if (tA < 0 || tB < 0) continue;
        var pA = getPoint(s, tA);
        var pB = getPoint(s, tB);
        var alpha = (1 - k / segments) * 0.78;
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.strokeStyle = "rgba(" + s.color + ", " + alpha.toFixed(3) + ")";
        ctx.lineWidth = 2.2 - (k / segments) * 1.4;
        ctx.stroke();
      }

      /* Bright photon head */
      var headPt = getPoint(s, headT);
      ctx.beginPath();
      ctx.arc(headPt.x, headPt.y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = "#fff7ed";
      ctx.fill();
    }

    rafId = window.requestAnimationFrame(render);
  }

  function startLoop() {
    if (!rafId && !isPaused && isHeroVisible) {
      rafId = window.requestAnimationFrame(render);
    }
  }

  if ("IntersectionObserver" in window) {
    var canvasObserver = new IntersectionObserver(
      function (entries) {
        isHeroVisible = entries[0].isIntersecting;
        if (isHeroVisible) startLoop();
      },
      { threshold: 0.05 }
    );
    canvasObserver.observe(hero);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else {
      startLoop();
    }
  });

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      isPaused = !isPaused;
      var label = toggleBtn.querySelector(".canvas-toggle-label");
      if (label) {
        label.textContent = isPaused ? "Reanudar pulso óptico" : "Pausar pulso óptico";
      }
      if (!isPaused) startLoop();
    });
  }

  startLoop();
})();
