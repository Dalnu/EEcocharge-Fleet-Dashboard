// src/calc.js
(function () {
  "use strict";

  // --- Constants (simple assumptions for the prototype) ---
  const CHARGER_KW    = 7.5;   // charger power (kW)
  const PRICE_PER_KWH = 0.15;  // $/kWh
  const BATTERY_KWH   = 60;    // assumed pack size (kWh)

  // --- Pure calc (exported for tests) ---
  function calculateCost(hours) {
    const raw = String(hours ?? "");
    const h   = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(h) || Number.isNaN(h) || h < 0) {
      throw new Error("Invalid input");
    }
    return h * CHARGER_KW * PRICE_PER_KWH;
  }
  window.calculateCost = calculateCost;

  // --- Small helpers ---
  function clampBattery(n) {
    const v = Number(n);
    return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
  }

  function hoursToString(h) {
    const totalMin = Math.round(h * 60);
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    if (hh <= 0) return `${mm} min`;
    if (mm === 0) return `${hh} hr`;
    return `${hh} hr ${mm} min`;
  }

  async function loadVehicles() {
    const url = "./data/vehicles.json";
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json)) return json;
      if (Array.isArray(json.vehicles)) return json.vehicles;
      throw new Error("Unexpected JSON shape");
    } catch (e) {
      console.warn("[calc] using fallback vehicles:", e);
      return [
        {"id":"EV-101","model":"Nissan Leaf","battery":82,"status":"Available"},
        {"id":"EV-102","model":"Tesla Model 3","battery":35,"status":"Charging"},
        {"id":"EV-103","model":"Renault Zoe","battery":57,"status":"On Trip"},
        {"id":"EV-104","model":"Hyundai Kona","battery":90,"status":"Available"},
        {"id":"EV-105","model":"BMW i3","battery":16,"status":"Charging"},
        {"id":"EV-106","model":"Kia Niro EV","battery":64,"status":"Available"},
        {"id":"EV-107","model":"VW ID.3","battery":41,"status":"On Trip"},
        {"id":"EV-108","model":"Chevy Bolt","battery":73,"status":"Available"},
        {"id":"EV-109","model":"BYD Dolphin","battery":52,"status":"Available"},
        {"id":"EV-110","model":"MG4 EV","battery":28,"status":"Charging"}
      ];
    }
  }

  function statusBadge(status) {
    const s = String(status || "").trim();
    const cls =
      s === "Available" ? "available" :
      s === "Charging"  ? "charging"  : "ontrip";
    return `<span class="badge ${cls}">${s || "Unknown"}</span>`;
  }

  // --- UI ---
  async function renderCalc(rootEl) {
    if (!rootEl) return;

    // Shell
    rootEl.innerHTML = `
      <div class="card">
        <h2 style="margin:0 0 12px 2px">Charging Cost Calculator</h2>

        <div class="form-row">
          <label for="vehicle-select">Vehicle</label><br/>
          <select id="vehicle-select" aria-label="Select vehicle"></select>
        </div>

        <div id="vehicle-info" style="margin:8px 0 12px 0;color:var(--muted)"></div>

        <div class="form-row">
          <label for="hours-input">Charging duration (hours)</label><br/>
          <!-- NOTE: text (not number) so all keys are allowed; we validate on submit -->
          <input id="hours-input" type="text" inputmode="decimal" placeholder="e.g., 2.5" />
        </div>

        <button id="calc-btn" class="primary" type="button">Calculate</button>

        <div id="calc-result" class="result" aria-live="polite" style="margin-top:10px"></div>
        <div id="availability-note" style="margin-top:6px;color:var(--muted)"></div>
        <div id="fullcharge-info" style="margin-top:6px;color:var(--muted)"></div>

        <small style="color:var(--muted);display:block;margin-top:10px">
          Formula: Cost = hours × ${CHARGER_KW} kW × \$${PRICE_PER_KWH.toFixed(2)}/kWh
          &nbsp;•&nbsp; Assumes ${BATTERY_KWH} kWh battery for “time to full”
        </small>
      </div>
    `;

    const sel      = rootEl.querySelector("#vehicle-select");
    const infoEl   = rootEl.querySelector("#vehicle-info");
    const hoursEl  = rootEl.querySelector("#hours-input");
    const resultEl = rootEl.querySelector("#calc-result");
    const noteEl   = rootEl.querySelector("#availability-note");
    const fullEl   = rootEl.querySelector("#fullcharge-info");
    const btn      = rootEl.querySelector("#calc-btn");

    // --- Harden against cached DOM (force text field at runtime) ---
    hoursEl.setAttribute("type", "text");
    hoursEl.setAttribute("inputmode", "decimal");
    hoursEl.autocomplete = "off";

    // Optional: small UX helper – trim whitespace while typing
    hoursEl.addEventListener("input", () => {
      // keep as text; do not parse here (we validate on click)
      // but collapse multiple spaces
      hoursEl.value = hoursEl.value.replace(/\s+/g, " ");
    });

    // Load vehicles
    const vehicles = await loadVehicles();
    sel.innerHTML = vehicles.map((v, i) =>
      `<option value="${i}">${v.id} — ${v.model}</option>`
    ).join("");

    function updateVehicleInfo() {
      const v = vehicles[Number(sel.value)];
      const p = clampBattery(v?.battery);
      infoEl.innerHTML = `
        ${statusBadge(v?.status)} &nbsp; • &nbsp;
        Battery: <strong>${p}%</strong>
      `;

      // pre-compute time & cost to full (only shown when Charging)
      const kwhNeeded = (100 - p) / 100 * BATTERY_KWH; // kWh
      const hrsToFull = kwhNeeded / CHARGER_KW;        // h
      const costToFull = kwhNeeded * PRICE_PER_KWH;    // $

      // reset hints
      noteEl.textContent = "";
      fullEl.textContent = "";

      // stash for click handler
      sel.dataset.kwhNeeded = String(Math.max(0, kwhNeeded));
      sel.dataset.hrsToFull = String(Math.max(0, hrsToFull));
      sel.dataset.costToFull = String(Math.max(0, costToFull));
      sel.dataset.status = String(v?.status || "");
      sel.dataset.battery = String(p);
    }

    sel.addEventListener("change", updateVehicleInfo);
    updateVehicleInfo();

    btn.addEventListener("click", () => {
      resultEl.textContent = "";
      noteEl.textContent   = "";
      fullEl.textContent   = "";

      try {
        const cost = calculateCost(hoursEl.value);
        resultEl.textContent = `Estimated cost: $${cost.toFixed(2)}`;

        const status = sel.dataset.status;
        const batt   = Number(sel.dataset.battery);

        if (status === "On Trip") {
          noteEl.textContent = "Note: This vehicle is currently On Trip and not available right now.";
        } else if (status === "Charging") {
          noteEl.textContent = "This vehicle is currently Charging.";
          const hrsToFull  = Number(sel.dataset.hrsToFull);
          const costToFull = Number(sel.dataset.costToFull);
          if (batt < 100 && Number.isFinite(hrsToFull)) {
            fullEl.textContent =
              `Time to full: ~${hoursToString(hrsToFull)} • Extra cost to full: $${costToFull.toFixed(2)}`;
          } else {
            fullEl.textContent = "Battery already full.";
          }
        }
      } catch {
        resultEl.textContent = "Please enter a valid number of hours (0 or more).";
      }
    });
  }

  window.renderCalc = renderCalc;
})();
