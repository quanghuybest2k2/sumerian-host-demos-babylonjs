import { HostObject } from "../../amazon-sumerian-hosts-babylon/src/Babylon.js";

export function populateCharacterSelect(
  selectId = "characterSelect",
  loadButtonId = "changeCharacterButton"
) {
  const select = document.getElementById(selectId);
  if (!select || !HostObject.getAvailableCharacters) return;

  // populate
  const chars = HostObject.getAvailableCharacters();
  select.innerHTML = "";
  chars.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });

  // set from URL if present
  const params = new URLSearchParams(window.location.search);
  if (params.has("character")) {
    select.value = params.get("character");
  }

  const btn = document.getElementById(loadButtonId);
  if (btn) {
    btn.onclick = () => {
      const chosen = select.value;
      window.location.search = `?character=${encodeURIComponent(chosen)}`;
    };
  }
}

export function getCharacterFromSelectOrUrl(
  selectId = "characterSelect",
  defaultCharacter = "Cristine"
) {
  const select = document.getElementById(selectId);
  if (select && select.value) return select.value;
  const params = new URLSearchParams(window.location.search);
  if (params.has("character")) return params.get("character");
  return defaultCharacter;
}

export default { populateCharacterSelect, getCharacterFromSelectOrUrl };
