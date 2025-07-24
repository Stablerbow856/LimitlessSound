// DOM Elements
const fileInput = document.getElementById("fileInput");
const playlist = document.getElementById("playlist");
const audioPlayer = document.getElementById("audioPlayer");
const volumeSlider = document.getElementById("volumeSlider");
const loopToggle = document.getElementById("loopToggle");
const speedSlider = document.getElementById("speedSlider");
const reverbSlider = document.getElementById("reverbSlider");
const trackNameInput = document.getElementById("trackNameInput");

const volumeValue = document.getElementById("volumeValue");
const speedValue = document.getElementById("speedValue");
const reverbValue = document.getElementById("reverbValue");

const themeSelect = document.getElementById("themeSelect");
const shuffleBtn = document.getElementById("shuffleBtn");

const panicKeySelect = document.getElementById("panicKey");
const panicAssetInput = document.getElementById("panicAsset");
const lockScreen = document.getElementById("lockScreen");
const panicPreview = document.getElementById("panicPreview");

let tracks = [];
let currentIndex = 0;
let panicKey = "Escape";
let panicPreviewURL = "";

// 🎛️ Audio Effects Setup
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sourceNode = audioCtx.createMediaElementSource(audioPlayer);
let gainNode = audioCtx.createGain();
let reverbNode = audioCtx.createDelay(); // Simple delay as reverb placeholder
reverbNode.delayTime.value = 0;

sourceNode.connect(reverbNode);
reverbNode.connect(gainNode);
gainNode.connect(audioCtx.destination);

// 🧠 Auto-detect OS theme
function autoDetectTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultTheme = prefersDark ? "theme-dark" : "theme-light";
  document.body.className = defaultTheme;
  themeSelect.value = defaultTheme;
  localStorage.setItem("freedomTheme", defaultTheme);
}

const savedTheme = localStorage.getItem("freedomTheme");
if (savedTheme) {
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;
} else {
  autoDetectTheme();
}

// 💾 Restore saved playlist
const savedNames = JSON.parse(localStorage.getItem("limitlessPlaylist") || "[]");
if (savedNames.length > 0) {
  savedNames.forEach((name, i) => {
    const li = document.createElement("li");
    li.textContent = maskTitle(name, i);
    li.dataset.index = i;
    li.addEventListener("click", () => loadTrack(i));
    playlist.appendChild(li);
  });
}

// 🗂️ Upload files
fileInput.addEventListener("change", (e) => {
  tracks = Array.from(e.target.files);
  playlist.innerHTML = "";

  tracks.forEach((track, i) => {
    const li = document.createElement("li");
    li.textContent = maskTitle(track.name, i);
    li.dataset.index = i;
    li.addEventListener("click", () => loadTrack(i));
    playlist.appendChild(li);
  });

  localStorage.setItem("limitlessPlaylist", JSON.stringify(tracks.map(t => t.name)));

  if (tracks.length > 0) {
    currentIndex = 0;
    loadTrack(currentIndex);
  }
});

// 🎧 Load track
function loadTrack(index) {
  currentIndex = index;
  const file = tracks[index];
  const reader = new FileReader();
  reader.onload = () => {
    audioPlayer.src = reader.result;
    audioPlayer.play();
    highlightTrack(index);
    trackNameInput.value = maskTitle(file.name, index);
  };
  reader.readAsDataURL(file);
}

// 📌 Highlight track
function highlightTrack(index) {
  document.querySelectorAll("#playlist li").forEach(li => li.style.backgroundColor = "");
  const active = document.querySelector(`#playlist li[data-index="${index}"]`);
  if (active) active.style.backgroundColor = "#dfe4ec";
}

// 🔤 Stealth label
function maskTitle(filename, index) {
  const subjects = ["Math", "Science", "English", "History", "Language"];
  const topic = subjects[index % subjects.length];
  return `Unit ${index + 1} - ${topic} Lecture.mp3`;
}

// ✏️ Rename track
trackNameInput.addEventListener("input", () => {
  const li = document.querySelector(`#playlist li[data-index="${currentIndex}"]`);
  if (li) li.textContent = trackNameInput.value;
});

// 🎛️ Control sliders
volumeSlider.addEventListener("input", () => {
  audioPlayer.volume = parseFloat(volumeSlider.value);
  volumeValue.textContent = `${Math.round(volumeSlider.value * 100)}%`;
});

speedSlider.addEventListener("input", () => {
  audioPlayer.playbackRate = parseFloat(speedSlider.value);
  speedValue.textContent = `${Math.round(speedSlider.value * 100)}%`;
});

reverbSlider.addEventListener("input", () => {
  const amt = parseFloat(reverbSlider.value);
  reverbNode.delayTime.value = amt * 0.5;
  reverbValue.textContent = `${Math.round(amt * 100)}%`;
});

loopToggle.addEventListener("change", () => {
  audioPlayer.loop = loopToggle.checked;
});

// 🔀 Shuffle
shuffleBtn.addEventListener("click", () => {
  if (tracks.length > 1) {
    let rand = Math.floor(Math.random() * tracks.length);
    while (rand === currentIndex) rand = Math.floor(Math.random() * tracks.length);
    loadTrack(rand);
  }
});

// 🎨 Theme selector
themeSelect.addEventListener("change", () => {
  const theme = themeSelect.value;
  document.body.className = theme;
  localStorage.setItem("freedomTheme", theme);
});

// 🔐 Panic setup
panicKeySelect.addEventListener("change", () => {
  panicKey = panicKeySelect.value;
});

panicAssetInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    panicPreview.innerHTML = "";
    lockScreen.classList.add("onlyAsset");

    if (file.type.includes("image")) {
      const img = document.createElement("img");
      img.src = reader.result;
      panicPreviewURL = reader.result;
      panicPreview.appendChild(img);
    } else if (file.type === "application/pdf" || file.name.endsWith(".docx")) {
      const frame = document.createElement("iframe");
      frame.src = reader.result;
      panicPreviewURL = reader.result;
      panicPreview.appendChild(frame);
    }
  };
  reader.readAsDataURL(file);
});

// 🧨 Lock mode trigger
document.addEventListener("keydown", (e) => {
  const pressed = e.code === "Backquote" ? "Backquote" : (e.code || e.key || "").toString();
  if ((pressed === panicKey || pressed === "Backquote") && lockScreen.style.display !== "flex") {
    lockScreen.style.display = "flex";
    audioPlayer.pause();
    document.getElementById("playerUI").style.display = "none";
  } else if (lockScreen.style.display === "flex") {
    lockScreen.style.display = "none";
    document.getElementById("playerUI").style.display = "block";
  }
});
