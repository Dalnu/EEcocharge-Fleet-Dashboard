// src/fleet.js
// Plain JS (no import/export). Loads vehicles.json and renders a table.

(function () {
  function batteryBar(percent) {
    const p = Math.max(0, Math.min(100, Number(percent) || 0));
    return `
      <div class="battery" aria-label="Battery ${p}%">
        <span style="width:${p}%"></span>
      </div>
      <div style="min-width:48px;text-align:right">${p}%</div>
    `;
  }

  function rowHTML(v) {
    const cls =
      v.status === "Available" ? "available" :
      v.status === "Charging"  ? "charging"  : "ontrip";
    return `
      <tr>
        <td>${v.id}</td>
        <td>${v.model}</td>
        <td style="display:flex; gap:10px; align-items:center">${batteryBar(v.battery)}</td>
        <td><span class="badge ${cls}">${v.status}</span></td>
      </tr>
    `;
  }

  // Expose globally so app.js can call it
  window.renderFleet = async function renderFleet(rootEl) {
    // Build the card/table shell
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

    const tbody = rootEl.querySelector("#fleet-table tbody");

    // Try to fetch JSON from ./data/vehicles.json (GitHub Pages friendly)
    let vehicles = null;
    try {
      const res = await fetch("./data/vehicles.json", { cache: "no-store" });
      if (!res.ok) throw new Error(res.statusText);
      vehicles = await res.json();
    } catch (e) {
      // Fallback data so the page never looks empty
      console.warn("Falling back to inline vehicles data:", e);
      vehicles = [
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

    // Render rows
    tbody.innerHTML = vehicles.map(rowHTML).join("");
  };
})();
