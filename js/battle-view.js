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
    cpuDeck: "相手の山札",
    cpuDiscard: "相手の捨て札",
    playerDeck: "自分の山札",
    playerDiscard: "自分の捨て札",
    turn: "ターン",
    ready: "最初の手札を3枚配りました",
    selectCard: "カードの確認",
    setCard: "このカードをセット",
    cancel: "戻る",
    chooseCard: "手札を選んでください",
    cardSet: "カードを裏向きにセットしました",
    faceDown: "セットされた裏向きのカード",
    bothSet: "両者がカードをセットしました",
    reveal: "カードを公開",
    bothAttack: "攻撃同士！ お互いに1ダメージ",
    noDamage: "同じ種類のため、ダメージなし",
    playerRoundWin: "あなたの勝ち！ 相手に1ダメージ",
    cpuRoundWin: "相手の勝ち！ あなたに1ダメージ",
    nextTurn: "次のターンへ",
    deckExhausted: "山札が0枚のため、ライフを比較します。",
    victory: "あなたの勝利です！",
    defeat: "あなたの敗北です",
    draw: "引き分けです",
    playAgain: "もう一度対戦する",
    selectCharacter: "キャラクター選択へ"
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
    cpuDeck: "Opponent's Deck",
    cpuDiscard: "Opponent's Discard",
    playerDeck: "Your Deck",
    playerDiscard: "Your Discard",
    turn: "Turn",
    ready: "Your 3 starting cards have been dealt",
    selectCard: "Confirm Card",
    setCard: "Set This Card",
    cancel: "Back",
    chooseCard: "Choose a card from your hand",
    cardSet: "Your card has been set face down",
    faceDown: "A card set face down",
    bothSet: "Both cards have been set",
    reveal: "Reveal Cards",
    bothAttack: "Both used Attack! Each takes 1 damage",
    noDamage: "Matching types. No damage",
    playerRoundWin: "You win this round! Opponent takes 1 damage",
    cpuRoundWin: "Opponent wins this round! You take 1 damage",
    nextTurn: "Next Turn",
    deckExhausted: "Deck empty. Comparing life totals.",
    victory: "You win the game!",
    defeat: "You lose the game",
    draw: "The game is a draw",
    playAgain: "Play Again",    
    selectCharacter: "Choose Character"
  }
};

// 対戦画面の操作状態
const battleUI = {
  menuOpen: false,
  previewIndex: null
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
function createBattlePile(participant, kind, side) {
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
        "images/02_card_reverse.webp"
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

  const labelKey =
  side + (kind === "deck" ? "Deck" : "Discard");
  label.textContent = text[labelKey];

  const count = document.createElement("strong");
  count.className = "battle-pile-count";
  count.textContent = cards.length;

  pile.append(visual, label, count);

  // 捨て札だけ、クリック・タップで一覧を開く
  if (kind === "discard") {
    pile.classList.add("battle-discard-trigger");

    pile.setAttribute("role", "button");
    pile.setAttribute("tabindex", "0");
    pile.setAttribute("aria-haspopup", "dialog");

    pile.setAttribute(
      "aria-label",
      `${label.textContent}: ${cards.length}`
    );

    pile.addEventListener("click", () => {
      openDiscardList(side, pile);
    });

    // キーボードでも操作できる
    pile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDiscardList(side, pile);
      }
    });
  }

  return pile;
}


// 山札と捨て札をまとめる
function createBattlePiles(participant, side) {
  const piles = document.createElement("div");
  piles.className = `battle-piles battle-piles-${side}`;

  const order = side === "cpu"
    ? ["deck", "discard"]
    : ["discard", "deck"];

  order.forEach((kind) => {
    piles.append(
      createBattlePile(participant, kind, side)
    );
  });

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
        "images/02_card_reverse.webp"
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

  participant.hand.forEach((cardData, index) => {
    const item = document.createElement("div");
    item.className = "battle-hand-card";
    item.tabIndex = 0;
    item.setAttribute("role", "button");

    const canSelect =
      !participant.field &&
      gameState.battle.phase === "choosing";

    item.setAttribute(
      "aria-label",
      `${cardData.lang[language].name} / ${
        language === "ja"
          ? canSelect
          ? "タップで確認、長押しで拡大"
          : "長押しで拡大"
        : canSelect
          ? "Tap to review, hold to enlarge"
          : "Hold to enlarge"
      }`
    );

    item.append(createCard(cardData, language));

    if (canSelect) {
      item.setAttribute("aria-haspopup", "dialog");
    }

    // 短いタップ・クリックでは、従来の確認画面を開く
    const selectCard = () => {
      if (!canSelect) {
        return;
      }

      hideHoverPreview();
      openCardPreview(index);
    };

    bindHandCardInteraction(item, cardData, selectCard);

    hand.append(item);
  });

  return hand;
}

// 中央のカードを出す場所
function createBattleField(label, side, cardData = null) {
  const language = gameState.language;
  const text = BATTLE_TEXT[language];
  const battle = gameState.battle;

  const revealed =
    battle.phase === "resolved" ||
    battle.phase === "finished";

  const field = document.createElement("section");
  field.className = `battle-field battle-field-${side}`;

  const heading = document.createElement("h2");
  heading.className = "battle-field-label";
  heading.textContent = label;

  const slot = document.createElement("div");
  slot.className = "battle-field-slot";
  slot.tabIndex = -1;

  if (!cardData) {
    slot.setAttribute("aria-label", label);
  } else if (revealed) {
    slot.classList.add("has-card", "is-revealed");

    slot.append(
      createCard(cardData, language)
    );

    // 公開済みのカードも、長押し・マウスを重ねて拡大
    slot.tabIndex = 0;

    slot.setAttribute(
      "aria-label",
      `${label}: ${cardData.lang[language].name} / ${
        language === "ja"
          ? "長押し、またはマウスを重ねて拡大"
          : "Hold or hover to enlarge"
        }`
      );

    bindHandCardInteraction(slot, cardData, () => {});

  } else {
    slot.classList.add("has-card");

    slot.setAttribute(
      "aria-label",
      `${label}: ${text.faceDown}`
    );

    slot.append(
      createCardImage(
        "battle-card-back",
        "images/02_card_reverse.webp"
      )
    );
  }

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
    createBgmToggleButton(),
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
    createBattleField(
      text.cpuField,
      "cpu",
      battle.cpu.field
    ),
    createBattleField(
      text.playerField,
      "player",
      battle.player.field
    )
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
  message.setAttribute("role", "status");
  
  message.textContent = getBattleMessage();

  // 状況説明と操作ボタンを縦にまとめる
  const status = document.createElement("div");
  status.className = "battle-status";

  status.append(
    message,
    createBattleActions()
  );

  // マウス操作時の拡大表示
  const hoverPreview = document.createElement("div");
  hoverPreview.className = "battle-hover-preview";
  hoverPreview.hidden = true;
  hoverPreview.setAttribute("aria-hidden", "true");

  // ゲームメニュー
  const menuDialog = createBattleMenu();

  const menuButton = createMenuButton(
    text.menu,
    () => {
      hideHoverPreview();

      battleUI.menuOpen = true;
      menuDialog.showModal();
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
    status,
    menuButton,
    hoverPreview
  );

  screen.append(
    heading,
    board,
    menuDialog
  );

  // カード選択中だけ確認画面を作る
  const cardDialog = createCardPreviewDialog();

  if (cardDialog) {
    screen.append(cardDialog);
  }

  return screen;
}

// カーソルを合わせたカードの拡大表示
function showHoverPreview(cardData) {
  const preview = app.querySelector(
    ".battle-hover-preview"
  );

  if (!preview) {
    return;
  }

  preview.replaceChildren(
    createCard(cardData, gameState.language)
  );

  preview.hidden = false;
}


// カーソルを外したら拡大表示を閉じる
function hideHoverPreview() {
  const preview = app.querySelector(
    ".battle-hover-preview"
  );

  if (preview) {
    preview.hidden = true;
    preview.replaceChildren();
  }
}


// カードを選択できる状態だけ、確認画面を開く
function openCardPreview(handIndex) {
  const battle = gameState.battle;

  if (
    !battle ||
    gameState.screen !== "battle" ||
    battle.phase !== "choosing" ||
    battle.player.field ||
    !battle.player.hand[handIndex]
  ) {
    return;
  }

  battleUI.previewIndex = handIndex;

  renderScreen();
}


// 確認画面を閉じ、選んでいた手札へフォーカスを戻す
function closeCardPreview(dialog) {
  const handIndex = battleUI.previewIndex;

  battleUI.previewIndex = null;
  dialog.close();

  const items = app.querySelectorAll(
    ".battle-hand-card"
  );

  items[handIndex]?.focus();
}

// カードの確認画面
function createCardPreviewDialog() {
  const language = gameState.language;
  const text = BATTLE_TEXT[language];
  const handIndex = battleUI.previewIndex;

  if (handIndex === null) {
    return null;
  }

  const cardData =
    gameState.battle.player.hand[handIndex];

  if (!cardData) {
    battleUI.previewIndex = null;
    return null;
  }

  const dialog = document.createElement("dialog");
  dialog.className = "card-preview-dialog";
  dialog.setAttribute(
    "aria-labelledby",
    "card-preview-heading"
  );

  const panel = document.createElement("div");
  panel.className = "card-preview-panel";

  const heading = document.createElement("h2");
  heading.id = "card-preview-heading";
  heading.className = "screen-heading";
  heading.textContent = text.selectCard;

  const card = createCard(cardData, language);

  const buttons = document.createElement("div");
  buttons.className = "menu-stack";

  const setButton = createMenuButton(
    text.setCard,
    () => {
      if (!setPlayerCard(handIndex)) {
        return;
      }

      battleUI.previewIndex = null;
      dialog.close();

      renderScreen();

      // セット後は自分の場へフォーカスを移す
      app.querySelector(
        ".battle-field-player .battle-field-slot"
      )?.focus();
    },
    true
  );

  const backButton = createMenuButton(
    text.cancel,
    () => closeCardPreview(dialog)
  );

  // 最初に「戻る」へフォーカスし、誤って確定しにくくする
  backButton.autofocus = true;

  buttons.append(setButton, backButton);
  panel.append(heading, card, buttons);
  dialog.append(panel);

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCardPreview(dialog);
  });

  queueMicrotask(() => {
    if (
      dialog.isConnected &&
      battleUI.previewIndex === handIndex
    ) {
      dialog.showModal();
    }
  });

  return dialog;
}

// 現在の進行状況に合わせたメッセージ
function getBattleMessage() {
  const text = BATTLE_TEXT[gameState.language];
  const battle = gameState.battle;

  const outcomeText = {
    player: text.victory,
    cpu: text.defeat,
    draw: text.draw
  };

  // 山札から引けずに終了した場合
  if (
    battle.phase === "finished" &&
    battle.endReason === "deck"
  ) {
    return (
      `${text.deckExhausted}\n` +
      outcomeText[battle.outcome]
    );
  }

  if (battle.phase === "choosing") {
    return text.chooseCard;
  }

  if (battle.phase === "set") {
    return text.bothSet;
  }

  const result = battle.lastResult;

  if (!result) {
    return "";
  }

  let message;

  if (
    result.playerDamage > 0 &&
    result.cpuDamage > 0
  ) {
    message = text.bothAttack;
  } else if (
    result.playerDamage === 0 &&
    result.cpuDamage === 0
  ) {
    message = text.noDamage;
  } else if (result.cpuDamage > 0) {
    message = text.playerRoundWin;
  } else {
    message = text.cpuRoundWin;
  }

  // ライフが0になって終了した場合
  if (battle.phase === "finished") {
    message += `\n${outcomeText[battle.outcome]}`;
  }

  return message;
}


// 進行状況に合わせた操作ボタン
function createBattleActions() {
  const text = BATTLE_TEXT[gameState.language];
  const battle = gameState.battle;

  const actions = document.createElement("div");
  actions.className = "battle-actions";

  // 両者のセット後：公開する
  if (battle.phase === "set") {
    actions.append(
      createMenuButton(
        text.reveal,
        () => {
          if (!revealBattleCards()) {
            return;
          }

          const result = gameState.battle.lastResult;

          // どちらかにダメージが発生したら1回鳴らす
          if (
            result &&
            (
              result.playerDamage > 0 ||
              result.cpuDamage > 0
            )
          ) {
            playDamageSe();
          }

          renderScreen();

          app.querySelector(
            ".battle-field-player .battle-field-slot"
          )?.focus();
        },
        true
      )
    );
  }

  // 判定後：次のターンへ進む
  if (battle.phase === "resolved") {
    actions.append(
      createMenuButton(
        text.nextTurn,
        () => {
          if (!nextBattleTurn()) {
            return;
          }

          battleUI.previewIndex = null;

          renderScreen();

          if (gameState.battle.phase === "finished") {
            app.querySelector(
              ".battle-actions .menu-button"
            )?.focus();
          } else {
            app.querySelector(
              ".battle-hand-card[role='button']"
            )?.focus();
          }
        },
        true
      )
    );
  }

  // 対戦終了後
  if (battle.phase === "finished") {
    actions.append(
      createMenuButton(
        text.playAgain,
        () => {
          const characterId =
            gameState.battle.player.characterId;

          battleUI.menuOpen = false;
          battleUI.previewIndex = null;

          startBattle(characterId);
        },
        true
      ),

      createMenuButton(
        text.selectCharacter,
        () => {
          battleUI.menuOpen = false;
          battleUI.previewIndex = null;

          gameState.battle = null;

          changeScreen("character-select");
        }
      )
    );
  }

  return actions;
}

// 捨て札一覧の表示文字
const DISCARD_TEXT = {
  ja: {
    playerTitle: "自分の捨て札",
    cpuTitle: "相手の捨て札",
    empty: "捨て札はまだありません。",
    order: "新しく捨てたカードから順に表示しています。",
    total: "合計",
    close: "閉じる"
  },

  en: {
    playerTitle: "Your Discard Pile",
    cpuTitle: "Opponent's Discard Pile",
    empty: "There are no discarded cards yet.",
    order: "Cards are shown from newest to oldest.",
    total: "Total",
    close: "Close"
  }
};


// 捨て札一覧を開く
function openDiscardList(side, trigger) {
  const battle = gameState.battle;

  if (
    !battle ||
    gameState.screen !== "battle" ||
    !["player", "cpu"].includes(side)
  ) {
    return;
  }

  // 同じ一覧を二重に開かない
  if (app.querySelector(".discard-dialog")) {
    return;
  }

  const language = gameState.language;
  const text = DISCARD_TEXT[language];
  const participant = battle[side];

  // コピーして逆順にする。元の捨て札の順番は変更しない
  const cards = [...participant.discard].reverse();

  const dialog = document.createElement("dialog");
  dialog.className = "discard-dialog";
  dialog.setAttribute(
    "aria-labelledby",
    "discard-dialog-heading"
  );

  const panel = document.createElement("div");
  panel.className = "discard-panel";

  const heading = document.createElement("h2");
  heading.id = "discard-dialog-heading";
  heading.className = "screen-heading";

  heading.textContent = side === "player"
    ? text.playerTitle
    : text.cpuTitle;

  // 種類別の枚数を数える
  const counts = {
    attack: 0,
    defence: 0,
    feint: 0
  };

  cards.forEach((card) => {
    counts[card.type] += 1;
  });

  const summary = document.createElement("p");
  summary.className = "discard-summary";

  const typeCounts = Object.entries(counts).map(
    ([type, count]) => {
      const label = CARD_TYPES[type].lang[language].label;

      return `${label}: ${count}`;
    }
  );

  summary.textContent =
    `${text.total}: ${cards.length} / ` +
    typeCounts.join(" / ");

  panel.append(heading, summary);

  // カードや説明を入れるスクロール領域
  const body = document.createElement("div");
  body.className = "discard-body";

  // 開いたときは、下の閉じるボタンではなく見出しにフォーカス
  heading.tabIndex = -1;
  heading.autofocus = true;

  if (cards.length === 0) {
    const message = document.createElement("p");
    message.className = "screen-message";
    message.textContent = text.empty;

    body.append(message);
  } else {
    const description = document.createElement("p");
    description.className = "discard-description";
    description.textContent = text.order;

    // olを使い、読み上げでも順番がわかるようにする
    const list = document.createElement("ol");
    list.className = "discard-card-grid";

    cards.forEach((cardData) => {
      const item = document.createElement("li");
      item.className = "discard-card-item";

      item.append(
        createCard(cardData, language)
      );

      list.append(item);
    });

    body.append(description, list);
  }

  const closeButton = createMenuButton(
    text.close,
    () => dialog.close()
  );

  closeButton.autofocus = true;
  panel.append(body, closeButton);

  dialog.append(panel);

  // 閉じたら一覧を取り除き、元の捨て札へフォーカスを戻す
  dialog.addEventListener("close", () => {
    dialog.remove();

    if (trigger.isConnected) {
      trigger.focus();
    }
  });

  // Escキーでも閉じられる
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dialog.close();
  });

  const screen = app.querySelector(".battle-screen");

  if (!screen) {
    return;
  }

  screen.append(dialog);
  dialog.showModal();
}

// 手札のタップ・長押し・マウス操作
function bindHandCardInteraction(item, cardData, selectCard) {
  let timer = null;
  let activePointer = null;
  let startX = 0;
  let startY = 0;
  let suppressClick = false;
  let holding = false;

  const clearTimer = () => {
    window.clearTimeout(timer);
    timer = null;
  };

  const finishPress = () => {
    clearTimer();
    activePointer = null;

    if (holding) {
      hideHoverPreview();
      holding = false;
    }
  };

  item.addEventListener("pointerdown", (event) => {
    if (
      event.pointerType === "mouse" ||
      !event.isPrimary ||
      activePointer !== null
    ) {
      return;
    }

    activePointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    suppressClick = false;

    // 指がカードの外に出ても、離したことを検知する
    item.setPointerCapture(event.pointerId);

    timer = window.setTimeout(() => {
      timer = null;

      if (!item.isConnected) {
        finishPress();
        return;
      }

      holding = true;
      suppressClick = true;
      showHoverPreview(cardData);
    }, 450);
  });

  item.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointer) {
      return;
    }

    const distance = Math.hypot(
      event.clientX - startX,
      event.clientY - startY
    );

    if (distance > 12) {
      clearTimer();
      suppressClick = true;

      if (holding) {
        hideHoverPreview();
        holding = false;
      }
    }
  });

  item.addEventListener("pointerup", (event) => {
    if (event.pointerId === activePointer) {
      finishPress();
    }
  });

  item.addEventListener("pointercancel", (event) => {
    if (event.pointerId === activePointer) {
      suppressClick = true;
      finishPress();
    }
  });

  item.addEventListener("lostpointercapture", (event) => {
    if (event.pointerId === activePointer) {
      suppressClick = true;
      finishPress();
    }
  });

  item.addEventListener("click", (event) => {
    // 長押し・指の移動後のクリックは選択に使わない
    if (suppressClick && event.detail !== 0) {
      event.preventDefault();
      return;
    }

    selectCard();
  });

  item.addEventListener("keydown", (event) => {
    if (
      !event.repeat &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      selectCard();
    }
  });

  // スマホの長押しメニューを抑える
  item.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  // パソコンでは既存のマウス拡大を使用
  item.addEventListener("pointerenter", (event) => {
    if (
      event.pointerType === "mouse" &&
      window.matchMedia("(hover: hover)").matches
    ) {
      showHoverPreview(cardData);
    }
  });

  item.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      hideHoverPreview();
    }
  });
}