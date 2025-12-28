import { HostObject } from "@amazon-sumerian-hosts/babylon";
import { Scene } from "@babylonjs/core/scene";
import DemoUtils from "./demo-utils";
import { cognitoIdentityPoolId } from "./demo-credentials.js";

// Declare global variables
let host;
let scene;
let transcriptText = "";
let pollyConfig = {
  pollyVoice: "Matthew",
  pollyEngine: "neural",
  pollyLanguage: "en-US", // Default language
};

// References for Polly configuration
/**
 * See configuration parameters for @pollyConfig
 * @ref https://aws-samples.github.io/amazon-sumerian-hosts/AbstractTextToSpeechFeature.html
 * Detailed info @pollyConfig
 * @ref https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
 */

// Function to create the scene
async function createScene() {
  // Create an empty scene
  scene = new Scene();
  scene.useRightHandedSystem = true;

  // Setup the scene environment
  const { shadowGenerator } = DemoUtils.setupSceneEnvironment(scene);

  // Configure AWS SDK
  AWS.config.region = cognitoIdentityPoolId.split(":")[0];
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoIdentityPoolId,
  });

  // Instantiate the Sumerian Host
  const characterId = "Luke";
  const characterConfig = HostObject.getCharacterConfig(
    "./assets/character-assets",
    characterId
  );
  host = await HostObject.createHost(scene, characterConfig, pollyConfig);

  // Host always looks at the camera
  host.PointOfInterestFeature.setTarget(scene.activeCamera);

  // Enable shadows
  scene.meshes.forEach((mesh) => {
    shadowGenerator.addShadowCaster(mesh);
  });

  // Initialize user interface
  initUi();
  // Acquire microphone access
  await acquireMicrophoneAccess();

  return scene;
}

// Function to initialize the user interface
function initUi() {
  // Setup interactions for UI buttons
  document.getElementById("startButton").onclick = () => startMainExperience();
  document.getElementById("enableMicButton").onclick = () =>
    acquireMicrophoneAccess();

  // Push to Speak button
  const pushButton = document.getElementById("pushButton");
  /**
   * @event onmousedown and @event onmouseup for desktop
   * @event ontouchstart and @event ontouchend for mobile devices
   */
  pushButton.onmousedown = pushButton.ontouchstart = () => startListening();
  pushButton.onmouseup = pushButton.ontouchend = () => stopListening();
}

// Start the main experience
function startMainExperience() {
  showUiScreen("chatbotUiScreen");
}

// Display transcript of speech input
function displaySpeechInputTranscript(text) {
  const transcriptTextEl = document.getElementById("transcriptText");
  const messageContainerEl = document.getElementById("userMessageContainer");
  transcriptTextEl.innerText = `“${text}”`;
  messageContainerEl.classList.add("showingMessage");
}

// Display processing message
function displayProcessingMessage() {
  const messageContainerEl = document.getElementById("userMessageContainer");
  messageContainerEl.classList.add("processing");
}

// Hide processing message
function hideProcessingMessage() {
  const messageContainerEl = document.getElementById("userMessageContainer");
  messageContainerEl.classList.remove("processing");
}

// Acquire microphone access
async function acquireMicrophoneAccess() {
  showUiScreen("micInitScreen");

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    localStorage.setItem("microphoneAccess", "granted");
    showUiScreen("startScreen");
  } catch (e) {
    if (e.message === "Permission dismissed") {
      showUiScreen("micPermissionDismissedScreen");
    } else {
      showUiScreen("micDisabledScreen");
    }
  }
}

// Check microphone access on page load
function checkMicrophoneAccess() {
  const micAccess = localStorage.getItem("microphoneAccess");
  if (micAccess === "granted") {
    startMainExperience();
  } else {
    acquireMicrophoneAccess();
  }
}

// Show the specified UI screen
function showUiScreen(id) {
  document.querySelectorAll("#uiScreens .screen").forEach((element) => {
    const isTargetScreen = element.id === id;
    setElementVisibility(element.id, isTargetScreen);
  });
}

// Set the visibility of a UI element
function setElementVisibility(id, visible) {
  const element = document.getElementById(id);
  if (visible) {
    element.classList.remove("hide");
  } else {
    element.classList.add("hide");
  }
}

// Load the demo and initialize the scene
DemoUtils.loadDemo(createScene);

// Start listening
function startListening() {
  if (recognition.state === undefined) {
    finalTranscript = "";
    recognition.start();
    console.log("Listening started...");
    displayProcessingMessage();
  }
}

// Stop listening
function stopListening() {
  recognition.stop();
  console.log("Listening stopped.");
}

// Speech recognition setup
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
let finalTranscript = "";

// Set properties for speech recognition
recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = true;

// Handle speech recognition results
recognition.onresult = (event) => {
  let interimTranscript = "";
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript;
    } else {
      interimTranscript += event.results[i][0].transcript;
    }
  }
  transcriptText = finalTranscript + interimTranscript;
};

// Handle speech recognition end event
recognition.onend = () => {
  console.log("Recognition ended.");
  hideProcessingMessage();
  console.log(transcriptText);
  // Display the transcribed text on screen
  displaySpeechInputTranscript(transcriptText);
  readText(transcriptText);
};

// Read what was heard
function readText(text) {
  text === ""
    ? (() => {
        host.TextToSpeechFeature.play(
          "Sorry, I don't understand what you say. Please try again."
        );
        // Defense after a short delay.
        setTimeout(() => {
          host.GestureFeature.playGesture("Gesture", "defense");
        }, 1000);
      })()
    : host.TextToSpeechFeature.play(text);
}

// Check microphone access on page load
window.onload = checkMicrophoneAccess;
