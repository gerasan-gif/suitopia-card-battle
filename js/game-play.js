// キャラクターごとのデッキ構成
const CHARACTERS = [
  {
    id: "fuka",
    image: "images/10_fuka_select.png",
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
    image: "images/20_anna_select.png",
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
    image: "images/30_shizuku_select.png",
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
    image: "images/40_chihiro_select.png",
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
    discard: []
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
    player: createParticipant(playerCharacter),
    cpu: createParticipant(cpuCharacter)
  };

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

// 対戦画面用の表示文字
const BATTLE_TEXT = {
  ja: {
    title: "カードバトル",
    menu: "メニュー",
    gameMenu: "ゲームメニュー",
    resume: "ゲームへ戻る",
    chooseAgain: "キャラクターを選び直す",
    backMenu: "メインメニューへ戻る",
    life: "ライフ",
    deck: "山札",
    discard: "捨て札",
    cpuHand: "相手の手札",
    playerHand: "あなたの手札",
    cpuField: "相手の場",
    playerField: "あなたの場",
    turn: "ターン",
    ready: "最初の手札を3枚配りました"
  },

  en: {
    title: "Card Battle",
    menu: "Menu",
    gameMenu: "Game Menu",
    resume: "Return to Game",
    chooseAgain: "Choose Another Character",
    backMenu: "Back to Main Menu",
    life: "Life",
    deck: "Deck",
    discard: "Discard",
    cpuHand: "Opponent's Hand",
    playerHand: "Your Hand",
    cpuField: "Opponent's Field",
    playerField: "Your Field",
    turn: "Turn",
    ready: "Your 3 starting cards have been dealt"
  }
};


// 対戦中のメニューの開閉状態
const battleUI = {
  menuOpen: false
};


// キャラクターの顔とライフ
function createBattleProfile(participant, side) {
  const language = gameState.language;
  const text = BATTLE_TEXT[language];

  const character = CHARACTERS.find(
    (item) => item.id === participant.characterId
  );

  const name = getCharacterName(
    participant.characterId,
    language
  );

  const profile = document.createElement("section");
  profile.className = `battle-profile battle-profile-${side}`;

  const portrait = createCardImage(
    "battle-portrait",
    character.image
  );

  const details = document.createElement("div");
  details.className = "battle-profile-details";

  const heading = document.createElement("h2");
  heading.className = "battle-character-name";
  heading.textContent = name;

  const life = document.createElement("p");
  life.className = "battle-life";

  const label = document.createElement("span");
  label.textContent = text.life;

  const value = document.createElement("strong");
  value.textContent = participant.life;

  life.append(label, value);
  details.append(heading, life);
  profile.append(portrait, details);

  return profile;
}


// 山札・捨て札
function createBattlePile(participant, kind) {
  const language = gameState.language;
  const text = BATTLE_TEXT[language];

  const pile = document.createElement("div");
  pile.className = `battle-pile battle-pile-${kind}`;

  const cards = participant[kind];

  const visual = document.createElement("div");
  visual.className = "battle-pile-visual";
  visual.setAttribute("aria-hidden", "true");

  if (cards.length === 0) {
    // 空の場合は置き場所だけを表示する
    visual.classList.add("is-empty");
  } else if (kind === "deck") {
    visual.append(
      createCardImage(
        "battle-card-back",
        "images/02_card_reverse.png"
      )
    );
  } else {
    // 捨て札がある場合は、一番上のカードを表示する
    const topCard = cards[cards.length - 1];

    visual.append(
      createCard(topCard, language)
    );
  }

  const label = document.createElement("span");
  label.className = "battle-pile-label";
  label.textContent = text[kind];

  const count = document.createElement("strong");
  count.className = "battle-pile-count";
  count.textContent = cards.length;

  pile.append(visual, label, count);

  return pile;
}


// 山札と捨て札をまとめる
function createBattlePiles(participant, side) {
  const piles = document.createElement("div");
  piles.className = `battle-piles battle-piles-${side}`;

  // 上下で並びを反転する
  if (side === "cpu") {
    piles.append(
      createBattlePile(participant, "deck"),
      createBattlePile(participant, "discard")
    );
  } else {
    piles.append(
      createBattlePile(participant, "discard"),
      createBattlePile(participant, "deck")
    );
  }

  return piles;
}


// CPUの手札
function createOpponentHand(participant) {
  const text = BATTLE_TEXT[gameState.language];

  const hand = document.createElement("section");
  hand.className = "battle-opponent-hand";
  hand.setAttribute(
    "aria-label",
    `${text.cpuHand}: ${participant.hand.length}`
  );

  participant.hand.forEach(() => {
    hand.append(
      createCardImage(
        "battle-card-back",
        "images/02_card_reverse.png"
      )
    );
  });

  return hand;
}


// 自分の手札
function createPlayerHand(participant) {
  const language = gameState.language;
  const text = BATTLE_TEXT[language];

  const hand = document.createElement("section");
  hand.className = "battle-player-hand";
  hand.setAttribute("aria-label", text.playerHand);

  participant.hand.forEach((cardData) => {
    hand.append(
      createCard(cardData, language)
    );
  });

  return hand;
}


// 中央のカードを出す場所
function createBattleField(label, side) {
  const field = document.createElement("section");
  field.className = `battle-field battle-field-${side}`;

  const heading = document.createElement("h2");
  heading.className = "battle-field-label";
  heading.textContent = label;

  const slot = document.createElement("div");
  slot.className = "battle-field-slot";
  slot.setAttribute("aria-label", label);

  field.append(heading, slot);

  return field;
}


// メニューを閉じる
function closeBattleMenu(dialog) {
  battleUI.menuOpen = false;
  dialog.close();

  app.querySelector(".battle-menu-trigger")?.focus();
}


// 対戦中のメニュー
function createBattleMenu() {
  const language = gameState.language;
  const text = BATTLE_TEXT[language];

  const dialog = document.createElement("dialog");
  dialog.className = "battle-menu-dialog";
  dialog.setAttribute(
    "aria-labelledby",
    "battle-menu-heading"
  );

  const panel = document.createElement("div");
  panel.className = "main-menu-panel";

  const heading = document.createElement("h2");
  heading.id = "battle-menu-heading";
  heading.className = "screen-heading";
  heading.textContent = text.gameMenu;

  const buttons = document.createElement("div");
  buttons.className = "menu-stack";

  buttons.append(
    createMenuButton(
      text.resume,
      () => closeBattleMenu(dialog),
      true
    ),

    createMenuButton(
      text.chooseAgain,
      () => {
        battleUI.menuOpen = false;
        dialog.close();

        gameState.battle = null;
        changeScreen("character-select");
      }
    ),

    createMenuButton(
      text.backMenu,
      () => {
        battleUI.menuOpen = false;
        dialog.close();

        gameState.battle = null;
        changeScreen("menu");
      }
    )
  );

  panel.append(
    heading,
    buttons,
    createLanguageControls()
  );

  dialog.append(panel);

  // Escキーでも閉じられる
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeBattleMenu(dialog);
  });

  // 言語切り替えで再描画された場合も、
  // メニューを開いた状態に戻す
  queueMicrotask(() => {
    if (dialog.isConnected && battleUI.menuOpen) {
      dialog.showModal();
    }
  });

  return dialog;
}


// 対戦画面
function createBattleScreen() {
  const language = gameState.language;
  const text = BATTLE_TEXT[language];
  const battle = gameState.battle;

  const screen = document.createElement("section");
  screen.className = "battle-screen";

  const heading = createScreenHeading(text.title, true);

  const board = document.createElement("div");
  board.className = "battle-board";

  // 上側：CPU
  const cpuHand = createOpponentHand(battle.cpu);

  const cpuProfile = createBattleProfile(
    battle.cpu,
    "cpu"
  );

  const cpuPiles = createBattlePiles(
    battle.cpu,
    "cpu"
  );

  // 中央：カードを出す場所
  const fields = document.createElement("div");
  fields.className = "battle-fields";

  fields.append(
    createBattleField(text.cpuField, "cpu"),
    createBattleField(text.playerField, "player")
  );

  // 下側：プレイヤー
  const playerProfile = createBattleProfile(
    battle.player,
    "player"
  );

  const playerPiles = createBattlePiles(
    battle.player,
    "player"
  );

  const playerHand = createPlayerHand(battle.player);

  // ターン表示
  const turn = document.createElement("p");
  turn.className = "battle-turn";
  turn.textContent = `${text.turn} ${battle.turn}`;

  // 状況表示
  const message = document.createElement("p");
  message.className = "battle-message";
  message.textContent = text.ready;

  // メニュー
  const dialog = createBattleMenu();

  const menuButton = createMenuButton(
    text.menu,
    () => {
      battleUI.menuOpen = true;
      dialog.showModal();
    }
  );

  menuButton.classList.add("battle-menu-trigger");

  board.append(
    cpuHand,
    cpuProfile,
    cpuPiles,
    fields,
    playerProfile,
    playerPiles,
    playerHand,
    turn,
    message,
    menuButton
  );

  screen.append(heading, board, dialog);

  return screen;
}