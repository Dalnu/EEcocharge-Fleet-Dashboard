// src/app.js
// Loads Fleet (A) and Calculator (B). Will auto-load calc.js if needed.
(function () {
  "use strict";

  const fleetSection = document.getElementById("fleet-section");
  const calcSection  = document.getElementById("calc-section");
  const tabFleet     = document.getElementById("tab-fleet");
  const tabCalc      = document.getElementById("tab-calc");

  function setActive(which) {
    const isFleet = which === "fleet";
    fleetSection.hidden = !isFleet;
    calcSection.hidden  =  isFleet;

    tabFleet.classList.toggle("is-active", isFleet);
    tabCalc.classList.toggle("is-active", !isFleet);
    tabFleet.setAttribute("aria-selected", String(isFleet));
    tabCalc.setAttribute("aria-selected", String(!isFleet));
  }

  async function renderFleetOnce() {
    if (fleetSection.dataset.ready === "1") return;
    if (typeof window.renderFleet !== "function") {
      fleetSection.innerHTML =
        `<div class="card"><p>Load order error: <code>fleet.js</code> not loaded.</p></div>`;
      console.error("[app] renderFleet undefined — ensure src/fleet.js loads.");
      return;
    }
    await window.renderFleet(fleetSection);
    fleetSection.dataset.ready = "1";
  }

  // --- NEW: lazy loader for calc.js ---
  function ensureCalcLoaded() {
    return new Promise((resolve, reject) => {
      if (typeof window.renderCalc === "function") return resolve();

      // inject <script> with a cache-busting query
      const s = document.createElement("script");
      s.src = `src/calc.js?v=${Date.now()}`;
      s.defer = true;
      s.onload = () => {
        if (typeof window.renderCalc === "function") resolve();
        else reject(new Error("calc.js loaded but window.renderCalc missing"));
      };
      s.onerror = () => reject(new Error("Failed to load src/calc.js (404/blocked)"));
      document.head.appendChild(s);
    });
  }

  async function renderCalcOnce() {
    if (calcSection.dataset.ready === "1") return;
    try {
      await ensureCalcLoaded();                 // <-- guarantees availability
      window.renderCalc(calcSection);
      calcSection.dataset.ready = "1";
    } catch (err) {
      calcSection.innerHTML =
        `<div class="card"><p>Load error: <code>calc.js</code> not loaded. ${err.message}</p></div>`;
      console.error("[app] renderCalc error:", err);
      calcSection.dataset.ready = "1";
    }
  }

  // Events
  tabFleet.addEventListener("click", async () => {
    setActive("fleet");
    await renderFleetOnce();
  });

  tabCalc.addEventListener("click", () => {
    setActive("calc");
    renderCalcOnce();
  });

  // Keyboard accessibility
  [tabFleet, tabCalc].forEach(btn => {
    btn.setAttribute("tabindex", "0");
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Initial view
  setActive("fleet");
  renderFleetOnce();
})();
