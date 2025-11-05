// src/calc.js
(function () {
  "use strict";

  const CHARGER_KW = 7.5;      // kW
  const PRICE_PER_KWH = 0.15;  // $ per kWh

  function calculateCost(hours) {
    const raw = String(hours ?? "");
    const h = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(h) || Number.isNaN(h) || h < 0) {
      throw new Error("Invalid input");
    }
    return h * CHARGER_KW * PRICE_PER_KWH;
  }
  window.calculateCost = calculateCost;

  function renderCalc(rootEl) {
    if (!rootEl) return;
    rootEl.innerHTML = `
      <div class="card">
        <h2 style="margin:0 0 10px 2px">Charging Cost Calculator</h2>
        <div class="form-row">
          <label for="vehicle">Select Vehicle</label><br/>
          <select id="vehicle" aria-label="Select vehicle">
            <option>EV-101 — Nissan Leaf</option>
            <option>EV-102 — Tesla Model 3</option>
            <option>EV-103 — Renault Zoe</option>
            <option>EV-104 — Hyundai Kona</option>
            <option>EV-105 — BMW i3</option>
            <option>EV-106 — Kia Niro EV</option>
            <option>EV-107 — VW ID.3</option>
            <option>EV-108 — Chevy Bolt</option>
            <option>EV-109 — BYD Dolphin</option>
            <option>EV-110 — MG4 EV</option>
          </select>
        </div>
        <div class="form-row">
          <label for="hours">Charging Duration (hours)</label><br/>
          <input id="hours" type="number" min="0" step="0.1" placeholder="e.g., 2.5" />
        </div>
        <div class="form-row">
          <button class="primary" id="calc-btn" type="button">Calculate Cost</button>
        </div>
        <div class="result" id="result" aria-live="polite"></div>
        <small style="color:var(--muted)">
          Formula: hours × ${CHARGER_KW} kW × \$${PRICE_PER_KWH.toFixed(2)} per kWh
        </small>
      </div>
    `;
    const hoursInput = rootEl.querySelector("#hours");
    const resultEl   = rootEl.querySelector("#result");
    rootEl.querySelector("#calc-btn").addEventListener("click", () => {
      try {
        const cost = calculateCost(hoursInput.value);
        resultEl.textContent = `Estimated Cost: $${cost.toFixed(2)}`;
      } catch {
        resultEl.textContent = "Please enter a valid number of hours (0 or more).";
      }
    });
  }
  window.renderCalc = renderCalc;
})();
