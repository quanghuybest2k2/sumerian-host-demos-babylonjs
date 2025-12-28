import { HostObject } from "../../amazon-sumerian-hosts-babylon/src/Babylon.js";
import { Scene } from "@babylonjs/core/scene";
import DemoUtils from "../utils/demo-utils.js";
import { playTextToSpeech } from "../utils/TextToSpeechFeature.js";
import { populateCharacterSelect, getCharacterFromSelectOrUrl } from "../utils/characterService.js";

let host;
let scene;
const options = {
  lang: "en-GB",
  voiceName: "Google UK English Female",
};

async function createScene() {
  // Create an empty scene. Note: Sumerian Hosts work with both
  // right-hand or left-hand coordinate system for babylon scene
  scene = new Scene();

  const { shadowGenerator } = DemoUtils.setupSceneEnvironment(scene);
  initUi();

  // ===== Instantiate the Sumerian Host =====

  const characterId = getCharacterFromSelectOrUrl("characterSelect", "Cristine");
  const characterConfig = HostObject.getCharacterConfig("../assets/character-assets", characterId);
  host = await HostObject.createHost(scene, characterConfig);

  // Tell the host to always look at the camera.
  host.PointOfInterestFeature.setTarget(scene.activeCamera);

  // Enable shadows.
  scene.meshes.forEach((mesh) => {
    shadowGenerator.addShadowCaster(mesh);
  });

  return scene;
}

function initUi() {
  populateCharacterSelect("characterSelect", "changeCharacterButton");
  document.getElementById("speakButton").onclick = speak.bind(this);
  const backBtn = document.getElementById("backButton");
  if (backBtn) backBtn.onclick = () => (window.location.href = "../index.html");
}

function speak() {
  const btn = document.getElementById("speakButton");
  if (btn.disabled) return;

  const speech = document.getElementById("speechText").value;
  // disable button to prevent spam
  btn.disabled = true;

  const utterance = playTextToSpeech(speech, host, options);
  if (utterance && typeof utterance.addEventListener === "function") {
    utterance.addEventListener("end", () => {
      btn.disabled = false;
    });
    // also re-enable on error to be safe
    utterance.addEventListener("error", () => {
      btn.disabled = false;
    });
  } else {
    // fallback: re-enable after a short delay
    setTimeout(() => (btn.disabled = false), 2000);
  }
}

DemoUtils.loadDemo(createScene);
