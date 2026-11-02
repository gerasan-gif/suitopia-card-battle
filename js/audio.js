// BGM・SEを同じWeb Audio環境で管理する。
const audioState = {
  enabled: true,
  battleActive: false,
  pageHidden: document.visibilityState === "hidden"
};
const BGM_VOLUME = 0.3;
const DAMAGE_SE_VOLUME = 0.7;
let bgmContext = null;
let bgmGain = null;
let damageGain = null;
let bgmSource = null;
let damageSource = null;
let bgmBufferPromise = null;
let damageBufferPromise = null;
let bgmRequestId = 0;
let damageRequestId = 0;

// iPhoneでは消音モードに従うゲーム用音声として扱う。
// 消音スイッチ自体の状態は取得せず、OSの音声制御に従う。
function configureGameAudioSession() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = "ambient";
  } catch (error) {
    console.warn("音声セッションを設定できませんでした。", error);
  }
}
configureGameAudioSession();

function canPlayGameAudio() {
  return audioState.enabled && audioState.battleActive &&
    !audioState.pageHidden && document.visibilityState !== "hidden";
}

function prepareBgmAudio() {
  if (bgmContext) return;
  configureGameAudioSession();
  bgmContext = new AudioContext();
  bgmGain = bgmContext.createGain();
  damageGain = bgmContext.createGain();
  bgmGain.connect(bgmContext.destination);
  damageGain.connect(bgmContext.destination);
  // 読み込み・復帰が完了するまでは無音。
  bgmGain.gain.value = 0;
  damageGain.gain.value = 0;
  bgmContext.addEventListener("statechange", () => {
    if (!canPlayGameAudio() && bgmContext.state === "running") {
      silenceGameAudio();
    }
  });
  // 最初のダメージ音の待ち時間を減らす。
  loadDamageSe().catch(() => {});
}

async function decodeGameAudio(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`音声読み込み失敗: ${response.status}`);
  return bgmContext.decodeAudioData(await response.arrayBuffer());
}

function loadBattleBgm() {
  if (!bgmBufferPromise) {
    bgmBufferPromise = decodeGameAudio("audio/suitopia_battle.wav")
      .catch(error => { bgmBufferPromise = null; throw error; });
  }
  return bgmBufferPromise;
}

function loadDamageSe() {
  if (!damageBufferPromise) {
    damageBufferPromise = decodeGameAudio("audio/damage_hit.wav")
      .catch(error => { damageBufferPromise = null; throw error; });
  }
  return damageBufferPromise;
}

function stopDamageSe() {
  damageRequestId++;
  if (damageSource) {
    damageSource.stop();
    damageSource.disconnect();
    damageSource = null;
  }
}

// ロック時はフェードを待たずに消音。SEは破棄し、BGMの位置は保持。
function silenceGameAudio() {
  stopDamageSe();
  if (!bgmContext) return;
  for (const node of [bgmGain, damageGain]) {
    node.gain.cancelScheduledValues(bgmContext.currentTime);
    node.gain.setValueAtTime(0, bgmContext.currentTime);
  }
  if (bgmContext.state === "running") {
    bgmContext.suspend().catch(error => console.warn("音声を中断できませんでした。", error));
  }
}

function updateBattleBgm() {
  if (!bgmContext) return;
  if (!canPlayGameAudio()) {
    silenceGameAudio();
    return;
  }
  bgmGain.gain.cancelScheduledValues(bgmContext.currentTime);
  bgmGain.gain.setTargetAtTime(BGM_VOLUME, bgmContext.currentTime, 0.02);
  damageGain.gain.setValueAtTime(DAMAGE_SE_VOLUME, bgmContext.currentTime);
}

// Safariが自動復帰を許可しない場合は次のタップでも再試行する。
async function resumeGameAudio() {
  if (!bgmContext || !canPlayGameAudio()) return;
  try {
    configureGameAudioSession();
    await bgmContext.resume();
    // resume待ちの間に再ロックされた場合も消音する。
    updateBattleBgm();
  } catch (error) {
    console.warn("音声の再開には画面のタップが必要な場合があります。", error);
  }
}

async function playBattleBgm() {
  stopBattleBgm();
  audioState.battleActive = true;
  const requestId = bgmRequestId;
  try {
    prepareBgmAudio();
    await resumeGameAudio();
    const buffer = await loadBattleBgm();
    if (requestId !== bgmRequestId || !audioState.battleActive) return;
    bgmSource = bgmContext.createBufferSource();
    bgmSource.buffer = buffer;
    bgmSource.loop = true;
    bgmSource.loopStart = 0;
    bgmSource.loopEnd = buffer.duration;
    bgmSource.connect(bgmGain);
    // 非表示中に読み込みが完了しても、無音・中断状態を維持する。
    updateBattleBgm();
    bgmSource.start();
  } catch (error) {
    console.warn("BGMを再生できませんでした。", error);
  }
}

function stopBattleBgm() {
  bgmRequestId++;
  audioState.battleActive = false;
  if (bgmSource) {
    bgmSource.stop();
    bgmSource.disconnect();
    bgmSource = null;
  }
  silenceGameAudio();
}

async function playDamageSe() {
  stopDamageSe();
  if (!canPlayGameAudio()) return;
  const requestId = damageRequestId;
  try {
    prepareBgmAudio();
    await resumeGameAudio();
    const buffer = await loadDamageSe();
    if (requestId !== damageRequestId || !canPlayGameAudio()) return;
    const source = bgmContext.createBufferSource();
    damageSource = source;
    source.buffer = buffer;
    source.connect(damageGain);
    source.onended = () => {
      source.disconnect();
      if (damageSource === source) damageSource = null;
    };
    source.start();
  } catch (error) {
    console.warn("ダメージ音を再生できませんでした。", error);
  }
}

function createBgmToggleButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "menu-button";
  function updateLabel() {
    const enabled = audioState.enabled;
    button.textContent = gameState.language === "ja"
      ? (enabled ? "音声：オン" : "音声：オフ")
      : (enabled ? "Sound: On" : "Sound: Off");
    button.setAttribute("aria-pressed", String(enabled));
  }
  button.addEventListener("click", () => {
    audioState.enabled = !audioState.enabled;
    updateBattleBgm();
    if (audioState.enabled) resumeGameAudio();
    updateLabel();
  });
  updateLabel();
  return button;
}

// ロック・別アプリ・別タブへの移動に対応する。
document.addEventListener("visibilitychange", () => {
  audioState.pageHidden = document.visibilityState === "hidden";
  if (audioState.pageHidden) silenceGameAudio();
  else resumeGameAudio();
});
window.addEventListener("pagehide", () => {
  audioState.pageHidden = true;
  silenceGameAudio();
});
window.addEventListener("pageshow", () => {
  audioState.pageHidden = document.visibilityState === "hidden";
  resumeGameAudio();
});
for (const event of ["pointerdown", "keydown"]) {
  document.addEventListener(event, () => {
    if (bgmContext && bgmContext.state !== "running") resumeGameAudio();
  }, { capture: true });
}
