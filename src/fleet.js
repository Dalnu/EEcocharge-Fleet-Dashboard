// src/fleet.js
// Plain JS (no modules). Exposes window.renderFleet for app.js to call.

(function () {
  "use strict";

  // ---------- helpers ----------
  function clampBattery(n) {
    const v = Number(n);
    return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
  }

  function batteryBar(percent) {
    const p = clampBattery(percent);
    return `
      <div class="battery" aria-label="Battery ${p}%">
        <span style="width:${p}%"></span>
      </div>
      <div style="min-width:48px;text-align:right">${p}%</div>
    `;
  }

  function rowHTML(v) {
    const status = String(v.status || "").trim();
    const cls =
      status === "Available" ? "available" :
      status === "Charging"  ? "charging"  : "ontrip";
    return `
      <tr>
        <td>${v.id ?? ""}</td>
        <td>${v.model ?? ""}</td>
        <td style="display:flex; gap:10px; align-items:center">
          ${batteryBar(v.battery)}
        </td>
        <td><span class="badge ${cls}">${status || "Unknown"}</span></td>
      </tr>
    `;
  }

  async function loadVehicles() {
    try {
      const res = await fetch("./data/vehicles.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Accept either an array or { vehicles: [...] }
      if (Array.isArray(json)) return json;
      if (Array.isArray(json.vehicles)) return json.vehicles;
      throw new Error("Unexpected JSON shape");
    } catch (e) {
      console.warn("vehicles.json fetch failed, using fallback:", e);
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

  // ---------- public API ----------
  window.renderFleet = async function renderFleet(rootEl) {
    if (!rootEl) return;

    // Shell
    rootEl.innerHTML = `
      <div class="card">
        <h2 style="margin:0 0 14px 2px">Fleet Overview</h2>
        <div style="overflow:auto">
          <table class="table" id="fleet-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Model</th>
                <th>Battery</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>`;

    // Data + rows
    const tbody = rootEl.querySelector("#fleet-table tbody");
    const vehicles = await loadVehicles();
    tbody.innerHTML = vehicles.map(rowHTML).join("");
  };
})();
