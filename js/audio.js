// BGMの設定
const audioState = {
  enabled: true,
  battleActive: false
};

const BGM_VOLUME = 0.3;

let bgmContext = null;
let bgmGain = null;
let bgmSource = null;
let bgmBufferPromise = null;

// 読み込み中に画面を離れた場合の再生防止
let bgmRequestId = 0;


// 音声の再生環境を作る
function prepareBgmAudio() {
  if (bgmContext) {
    return;
  }

  bgmContext = new AudioContext();

  bgmGain = bgmContext.createGain();
  bgmGain.connect(bgmContext.destination);

  updateBattleBgm();
}


// WAVを読み込み、再生用データに変換する
function loadBattleBgm() {
  if (!bgmBufferPromise) {
    bgmBufferPromise = fetch("audio/suitopia_battle.wav")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`BGM読み込み失敗: ${response.status}`);
        }

        return response.arrayBuffer();
      })
      .then((data) => bgmContext.decodeAudioData(data))
      .catch((error) => {
        // 次回、読み込みを再試行できるようにする
        bgmBufferPromise = null;
        throw error;
      });
  }

  return bgmBufferPromise;
}


// オン／オフを音量に反映する
function updateBattleBgm() {
  if (!bgmGain) {
    return;
  }

  const audible =
    audioState.enabled && audioState.battleActive;

  bgmGain.gain.setTargetAtTime(
    audible ? BGM_VOLUME : 0,
    bgmContext.currentTime,
    0.02
  );
}


// 新しい対戦で先頭から再生する
async function playBattleBgm() {
  stopBattleBgm();

  audioState.battleActive = true;

  const requestId = bgmRequestId;

  try {
    prepareBgmAudio();

    // ユーザーのクリックから直接、再生環境を有効にする
    await bgmContext.resume();

    const buffer = await loadBattleBgm();

    // 読み込み中に対戦を離れた場合は再生しない
    if (
      requestId !== bgmRequestId ||
      !audioState.battleActive
    ) {
      return;
    }

    bgmSource = bgmContext.createBufferSource();
    bgmSource.buffer = buffer;

    bgmSource.loop = true;
    bgmSource.loopStart = 0;
    bgmSource.loopEnd = buffer.duration;

    bgmSource.connect(bgmGain);

    updateBattleBgm();
    bgmSource.start();
  } catch (error) {
    console.warn("BGMを再生できませんでした。", error);
  }
}


// 対戦画面を離れたら停止する
function stopBattleBgm() {
  bgmRequestId++;
  audioState.battleActive = false;

  if (bgmSource) {
    bgmSource.stop();
    bgmSource.disconnect();
    bgmSource = null;
  }

  updateBattleBgm();
}

// ゲームメニュー用のBGM切り替えボタン
function createBgmToggleButton() {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "menu-button";

  function updateLabel() {
    const enabled = audioState.enabled;

    if (gameState.language === "ja") {
      button.textContent = enabled
        ? "BGM：オン"
        : "BGM：オフ";
    } else {
      button.textContent = enabled
        ? "BGM: On"
        : "BGM: Off";
    }

    button.setAttribute("aria-pressed", String(enabled));
  }

  button.addEventListener("click", () => {
    audioState.enabled = !audioState.enabled;

    updateBattleBgm();
    updateLabel();
  });

  updateLabel();

  return button;
}