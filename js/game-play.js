// キャラクターごとのデッキ構成
const CHARACTERS = [
  {
    id: "fuka",
    image: "images/10_fuka_select.webp",
    counts: {
      attack: 5,
      defence: 5,
      feint: 5
    },
    lang: {
      ja: { style: "バランス型" },
      en: { style: "Balanced" }
    }
  },
  {
    id: "anna",
    image: "images/20_anna_select.webp",
    counts: {
      attack: 4,
      defence: 7,
      feint: 4
    },
    lang: {
      ja: { style: "防御型" },
      en: { style: "Defensive" }
    }
  },
  {
    id: "shizuku",
    image: "images/30_shizuku_select.webp",
    counts: {
      attack: 7,
      defence: 4,
      feint: 4
    },
    lang: {
      ja: { style: "攻撃型" },
      en: { style: "Aggressive" }
    }
  },
  {
    id: "chihiro",
    image: "images/40_chihiro_select.webp",
    counts: {
      attack: 4,
      defence: 4,
      feint: 7
    },
    lang: {
      ja: { style: "フェイント型" },
      en: { style: "Feint specialist" }
    }
  }
];


// 本編用の表示文字
const PLAY_TEXT = {
  ja: {
    selectCharacter: "キャラクター選択",
    selectMessage: "使用するキャラクターを選んでください。",
    battle: "カードバトル",
    player: "あなた",
    cpu: "CPU",
    life: "ライフ",
    deck: "山札",
    hand: "手札",
    initialHand: "最初の手札",
    ready: "最初の手札を3枚引きました。山札の残りは12枚です。",
    nextStep: "次は、手札からカードを選ぶ処理を作ります。",
    chooseAgain: "キャラクターを選び直す"
  },

  en: {
    selectCharacter: "Choose Your Character",
    selectMessage: "Choose a character to play.",
    battle: "Card Battle",
    player: "You",
    cpu: "CPU",
    life: "Life",
    deck: "Deck",
    hand: "Hand",
    initialHand: "Starting Hand",
    ready: "You drew 3 starting cards. Your deck has 12 cards remaining.",
    nextStep: "Choosing a card from your hand is the next development step.",
    chooseAgain: "Choose Another Character"
  }
};


// キャラクター名は既存のカード情報から取得する
function getCharacterName(characterId, language) {
  const card = CARDS.find(
    (item) => item.id === `${characterId}_attack`
  );

  return card.lang[language].character;
}


// 15枚のデッキを作る
function createDeck(character) {
  const deck = [];

  Object.entries(character.counts).forEach(([type, count]) => {
    const card = CARDS.find(
      (item) => item.id === `${character.id}_${type}`
    );

    if (!card) {
      throw new Error(
        `カードが見つかりません: ${character.id}_${type}`
      );
    }

    for (let index = 0; index < count; index++) {
      deck.push(card);
    }
  });

  return deck;
}


// 元の配列を変更せず、シャッフルした配列を返す
function shuffleDeck(deck) {
  const shuffled = [...deck];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index]
    ];
  }

  return shuffled;
}


// 山札から1枚引く
// 引けた場合は true、山札が空なら false
function drawCard(participant) {
  if (participant.deck.length === 0) {
    return false;
  }

  const card = participant.deck.pop();
  participant.hand.push(card);

  return true;
}


// プレイヤーまたはCPUの初期状態を作る
function createParticipant(character) {
  const participant = {
    characterId: character.id,
    life: 5,
    deck: shuffleDeck(createDeck(character)),
    hand: [],
    discard: [],
    field: null
  };

  // 最初の手札を3枚引く
  for (let index = 0; index < 3; index++) {
    drawCard(participant);
  }

  return participant;
}


// 対戦を準備する
function startBattle(characterId) {
  const playerCharacter = CHARACTERS.find(
    (character) => character.id === characterId
  );

  // CPUは4人からランダムに選ぶ。同じキャラクターも選択可能
  const cpuCharacter = CHARACTERS[
    Math.floor(Math.random() * CHARACTERS.length)
  ];

  gameState.battle = {
    turn: 1,
    phase: "choosing",
    lastResult: null,
    outcome: null,
    endReason: null,
    player: createParticipant(playerCharacter),
    cpu: createParticipant(cpuCharacter)
  };

  // 対戦データ作成後、BGMを再生して画面を切り替える
  playBattleBgm();
  changeScreen("battle");
}


// キャラクター選択画面
function createCharacterSelectScreen() {
  const language = gameState.language;
  const text = PLAY_TEXT[language];

  const screen = createContentScreen(text.selectCharacter);

  const message = document.createElement("p");
  message.className = "screen-message";
  message.textContent = text.selectMessage;

  const list = document.createElement("div");
  list.className = "character-list";

  CHARACTERS.forEach((character) => {
    const name = getCharacterName(character.id, language);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-choice";

    const image = createCardImage(
      "character-portrait",
      character.image
    );

    const nameLabel = document.createElement("span");
    nameLabel.className = "character-choice-name";
    nameLabel.textContent = name;

    const styleLabel = document.createElement("span");
    styleLabel.className = "character-choice-style";
    styleLabel.textContent = character.lang[language].style;

    button.append(image, nameLabel, styleLabel);

    button.addEventListener("click", () => {
      startBattle(character.id);
    });

    list.append(button);
  });

  screen.append(
    message,
    list,
    createMenuButton(
      SCREEN_TEXT[language].backMenu,
      () => changeScreen("menu")
    )
  );

  return screen;
}

// CPUの手札から、ランダムな位置を選ぶ
function chooseCpuCardIndex(hand) {
  if (hand.length === 0) {
    return -1;
  }

  return Math.floor(Math.random() * hand.length);
}


// プレイヤーとCPUのカードをセットする
function setPlayerCard(handIndex) {
  const battle = gameState.battle;

  if (
    !battle ||
    gameState.screen !== "battle" ||
    battle.phase !== "choosing"
  ) {
    return false;
  }

  const player = battle.player;
  const cpu = battle.cpu;

  if (player.field || cpu.field) {
    return false;
  }

  if (
    !Number.isInteger(handIndex) ||
    handIndex < 0 ||
    handIndex >= player.hand.length
  ) {
    return false;
  }

  // プレイヤーのカード内容を渡さずに選択する
  const cpuIndex = chooseCpuCardIndex(cpu.hand);

  if (cpuIndex === -1) {
    return false;
  }

  const [playerCard] = player.hand.splice(handIndex, 1);
  const [cpuCard] = cpu.hand.splice(cpuIndex, 1);

  player.field = playerCard;
  cpu.field = cpuCard;

  battle.phase = "set";

  return true;
}

// カードの組み合わせから、双方のダメージを求める
function calculateDamage(playerType, cpuType) {
  // 左の種類が、右の種類に勝つ
  const winsAgainst = {
    attack: "feint",
    defence: "attack",
    feint: "defence"
  };

  const types = Object.keys(winsAgainst);

  if (
    !types.includes(playerType) ||
    !types.includes(cpuType)
  ) {
    throw new Error("Unknown card type");
  }

  // 同じ種類
  if (playerType === cpuType) {
    const damage = playerType === "attack" ? 1 : 0;

    return {
      playerDamage: damage,
      cpuDamage: damage
    };
  }

  // プレイヤー側の勝ち
  if (winsAgainst[playerType] === cpuType) {
    return {
      playerDamage: 0,
      cpuDamage: 1
    };
  }

  // CPU側の勝ち
  return {
    playerDamage: 1,
    cpuDamage: 0
  };
}


// カードを公開し、ダメージと対戦終了を確定する
function revealBattleCards() {
  const battle = gameState.battle;

  // セット済みの場合だけ処理する
  // 公開後の再実行ではダメージを与えない
  if (
    !battle ||
    gameState.screen !== "battle" ||
    battle.phase !== "set" ||
    !battle.player.field ||
    !battle.cpu.field
  ) {
    return false;
  }

  const result = calculateDamage(
    battle.player.field.type,
    battle.cpu.field.type
  );

  battle.player.life = Math.max(
    0,
    battle.player.life - result.playerDamage
  );

  battle.cpu.life = Math.max(
    0,
    battle.cpu.life - result.cpuDamage
  );

  battle.lastResult = result;

  const playerLost = battle.player.life === 0;
  const cpuLost = battle.cpu.life === 0;

  if (playerLost || cpuLost) {
    battle.phase = "finished";

    battle.outcome = playerLost && cpuLost
      ? "draw"
      : playerLost
        ? "cpu"
        : "player";
  } else {
    battle.phase = "resolved";
  }

  return true;
}

// 使用カードを捨て札に移し、次のターンを始める
function nextBattleTurn() {
  const battle = gameState.battle;

  // 公開・判定が完了した場合だけ進める
  if (
    !battle ||
    gameState.screen !== "battle" ||
    battle.phase !== "resolved" ||
    !battle.player.field ||
    !battle.cpu.field
  ) {
    return false;
  }

  // 処理中の再実行を防ぐ
  battle.phase = "advancing";

  // 双方の使用カードを捨て札へ移す
  for (const participant of [battle.player, battle.cpu]) {
    participant.discard.push(participant.field);
    participant.field = null;
  }

  battle.turn += 1;
  battle.lastResult = null;

  // どちらかが引けないなら、ドロー前にライフを比較する
  if (
    battle.player.deck.length === 0 ||
    battle.cpu.deck.length === 0
  ) {
    battle.phase = "finished";
    battle.endReason = "deck";

    battle.outcome =
      battle.player.life === battle.cpu.life
        ? "draw"
        : battle.player.life > battle.cpu.life
          ? "player"
          : "cpu";

    return true;
  }

  // 2ターン目以降は双方が1枚引く
  drawCard(battle.player);
  drawCard(battle.cpu);

  battle.phase = "choosing";

  return true;
}