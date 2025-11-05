// src/app.js
// Controls tabs and renders Fleet (Feature A) + Calculator (Feature B).
// IMPORTANT: index.html must load scripts in this order:
//   1) src/fleet.js
//   2) src/calc.js
//   3) src/app.js
(function () {
  "use strict";

  // ---- Element refs ----
  const fleetSection = document.getElementById("fleet-section");
  const calcSection  = document.getElementById("calc-section");
  const tabFleet     = document.getElementById("tab-fleet");
  const tabCalc      = document.getElementById("tab-calc");

  // ---- Helpers ----
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
      console.error("[app] renderFleet is not defined. Ensure src/fleet.js loads before src/app.js.");
      return;
    }

    await window.renderFleet(fleetSection);
    fleetSection.dataset.ready = "1";
  }

  function renderCalcOnce() {
    if (calcSection.dataset.ready === "1") return;

    if (typeof window.renderCalc !== "function") {
      calcSection.innerHTML =
        `<div class="card"><p>Load order error: <code>calc.js</code> not loaded.</p></div>`;
      console.error("[app] renderCalc is not defined. Ensure src/calc.js loads before src/app.js.");
      calcSection.dataset.ready = "1";
      return;
    }

    window.renderCalc(calcSection);
    calcSection.dataset.ready = "1";
  }

  // ---- Events ----
  tabFleet.addEventListener("click", async () => {
    setActive("fleet");
    await renderFleetOnce();
  });

  tabCalc.addEventListener("click", () => {
    setActive("calc");
    renderCalcOnce();
  });

  // Keyboard accessibility (Enter/Space to activate tabs)
  [tabFleet, tabCalc].forEach(btn => {
    btn.setAttribute("tabindex", "0");
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // ---- Initial view ----
  setActive("fleet");
  renderFleetOnce();
})();
