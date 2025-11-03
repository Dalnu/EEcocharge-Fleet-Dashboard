// src/app.js
// Plain JS. Assumes fleet.js loaded first (so window.renderFleet exists).

(function () {
  const fleetSection = document.getElementById("fleet-section");
  const calcSection  = document.getElementById("calc-section");
  const tabFleet = document.getElementById("tab-fleet");
  const tabCalc  = document.getElementById("tab-calc");

  function setActive(tab) {
    const isFleet = tab === "fleet";
    fleetSection.hidden = !isFleet;
    calcSection.hidden  =  isFleet;
    tabFleet.classList.toggle("is-active", isFleet);
    tabCalc.classList.toggle("is-active", !isFleet);
    tabFleet.setAttribute("aria-selected", String(isFleet));
    tabCalc.setAttribute("aria-selected", String(!isFleet));
  }

  tabFleet.addEventListener("click", () => setActive("fleet"));
  tabCalc.addEventListener("click",  () => {
    setActive("calc");
    // Placeholder content until Feature B is added
    if (!calcSection.dataset.ready) {
      calcSection.innerHTML = `
        <div class="card">
          <h2>Charging Cost Calculator</h2>
          <p>The calculator will appear here once Feature B is merged.</p>
        </div>`;
      calcSection.dataset.ready = "1";
    }
  });

  // Initial render (Feature A)
  if (window.renderFleet) {
    window.renderFleet(fleetSection);
  } else {
    fleetSection.innerHTML = `<div class="card"><p>Load order error: fleet.js not loaded.</p></div>`;
  }
  setActive("fleet");
})();
