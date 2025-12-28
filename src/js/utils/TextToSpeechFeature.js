/**
 * Converts text to speech.
 *
 * @param {string} text - The text to be spoken.
 * @param {object} host - The host object to perform related functions.
 * @param {object} options - Configure web speech api properties (if any).
 */
export function playTextToSpeech(text, host, options = {}) {
  const emptyMessage =
    "Sorry, I don't understand what you say. Please try again.";
  const utteranceText = text || emptyMessage;
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(utteranceText);

  // Set default options
  const defaultOptions = {
    lang: "en-US",
    voiceName: "Microsoft David - English (United States)",
    pitch: 1,
    rate: 1,
    volume: 1,
  };

  // Merge default options with user provided options
  const config = { ...defaultOptions, ...options };

  // Set language, pitch, rate, and volume
  utterance.lang = config.lang;
  utterance.pitch = config.pitch;
  utterance.rate = config.rate;
  utterance.volume = config.volume;

  // Set voice
  const voices = synth.getVoices();
  const selectedVoice = voices.find(
    (voice) => voice.name === config.voiceName && voice.lang === config.lang
  );
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    console.warn("No matching voice found, using default voice.");
  }

  // start speak
  utterance.onstart = () => {
    // Start lip-syncing; LipsyncFeature will loop until disabled on speech end.
    host.LipsyncFeature.playLipSync();
  };

  // end speak
  utterance.onend = () => {
    host.LipsyncFeature.disable();
  };

  synth.speak(utterance);

  if (!text) {
    setTimeout(() => {
      host.GestureFeature.playGesture("Gesture", "defense");
    }, 1000);
  }

  // Return the utterance so callers can attach events (e.g., to disable UI while speaking)
  return utterance;
}

/**
 * Stops the text-to-speech.
 */
export function stopTextToSpeech() {
  const synth = window.speechSynthesis;
  synth.cancel();
}
