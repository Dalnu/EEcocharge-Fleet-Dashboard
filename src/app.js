// src/app.js
// Controls tabs and renders the Fleet view (Feature A).
// Assumes index.html loads scripts in this order:
//   1) src/fleet.js
//   2) src/app.js
(function () {
  "use strict";

  // ---- Element refs ----
  const fleetSection = document.getElementById("fleet-section");
  const calcSection  = document.getElementById("calc-section");
  const tabFleet = document.getElementById("tab-fleet");
  const tabCalc  = document.getElementById("tab-calc");

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
    // Only render the fleet table once
    if (fleetSection.dataset.ready === "1") return;
    if (typeof window.renderFleet !== "function") {
      fleetSection.innerHTML =
        `<div class="card"><p>Load order error: <code>fleet.js</code> not loaded.</p></div>`;
      console.error("renderFleet is not defined. Ensure src/fleet.js loads before src/app.js.");
      return;
    }
    await window.renderFleet(fleetSection);
    fleetSection.dataset.ready = "1";
  }

  function renderCalcPlaceholderOnce() {
    if (calcSection.dataset.ready === "1") return;
    calcSection.innerHTML = `
      <div class="card">
        <h2>Charging Cost Calculator</h2>
        <p>The calculator will appear here once Feature B is merged.</p>
      </div>`;
    calcSection.dataset.ready = "1";
  }

  // ---- Events ----
  tabFleet.addEventListener("click", async () => {
    setActive("fleet");
    await renderFleetOnce();
  });

  tabCalc.addEventListener("click", () => {
    setActive("calc");
    renderCalcPlaceholderOnce();
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
