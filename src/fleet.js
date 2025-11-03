function batteryBar(percent){
    const p = Math.max(0, Math.min(100, Number(percent) || 0));
    return `
      <div class="battery" aria-label="Battery ${p}%">
        <span style="width:${p}%"></span>
      </div>
      <div style="min-width:48px;text-align:right">${p}%</div>
    `;
  }
  
  export async function renderFleet(root){
    root.innerHTML = `
      <div class="card">
        <h2 style="margin:0 0 14px 2px">Fleet Overview</h2>
        <div style="overflow:auto">
          <table class="table" id="fleet-table">
            <thead><tr>
              <th>Vehicle ID</th>
              <th>Model</th>
              <th>Battery</th>
              <th>Status</th>
            </tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>`;
  
    const res = await fetch("./data/vehicles.json");
    const vehicles = await res.json();
    const tbody = root.querySelector("#fleet-table tbody");
  
    for(const v of vehicles){
      const cls = v.status === "Available" ? "available"
                : v.status === "Charging" ? "charging" : "ontrip";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${v.id}</td>
        <td>${v.model}</td>
        <td style="display:flex; gap:10px; align-items:center">${batteryBar(v.battery)}</td>
        <td><span class="badge ${cls}">${v.status}</span></td>
      `;
      tbody.appendChild(tr);
    }
  }
  
