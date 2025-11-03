import { renderFleet } from "./fleet.js";
import { renderCalculator } from "./calculator-ui.js"; // Nouf's file (safe if missing)

const fleetSection = document.getElementById("fleet-section");
const calcSection  = document.getElementById("calc-section");
const tabs = {
  fleet: document.getElementById("tab-fleet"),
  calc:  document.getElementById("tab-calc"),
};

function setActive(tab){
  const isFleet = tab === "fleet";
  fleetSection.hidden = !isFleet;
  calcSection.hidden  =  isFleet;
  tabs.fleet.classList.toggle("is-active", isFleet);
  tabs.calc.classList.toggle("is-active", !isFleet);
  tabs.fleet.setAttribute("aria-selected", String(isFleet));
  tabs.calc.setAttribute("aria-selected", String(!isFleet));
}

tabs.fleet.addEventListener("click", ()=> setActive("fleet"));
tabs.calc.addEventListener("click",  ()=> setActive("calc"));

renderFleet(fleetSection);
// Calculator UI will render when Nouf's file exists:
if (typeof renderCalculator === "function") renderCalculator(calcSection);

setActive("fleet");
