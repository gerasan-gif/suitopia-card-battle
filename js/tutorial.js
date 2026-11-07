// 通常対戦の gameState.battle は変更せず、教材用の状態だけを管理する。
const tutorialState = { step: "intro", timer: null, playerLife: 5, cpuLife: 5 };
const TUTORIAL_TEXT = {
  ja: {
    title: "チュートリアル", guide: "泉 風香", exit: "メニューへ戻る",
    progress: "ステップ", next: "次へ", try: "やってみる", reveal: "カードを公開",
    intro: "こんにちは！風香です。一緒にカードバトルを覚えましょう！",
    goal: "攻撃・防御・フェイントの3種類で戦います。ライフはお互い5。相手を0にすれば勝利です！",
    relations: "矢印の先のカードに勝ちます。勝った側は相手に1ダメージ！",
    rules: ["攻撃（赤）はフェイントに勝つ", "防御（青）は攻撃に勝つ", "フェイント（紫）は防御に勝つ"],
    choose: "練習では相手が「攻撃」を出します。手札の「防御」を選んでみましょう！",
    hint: "攻撃を止めるのは青枠の「防御」です。もう一度選んでみてね。",
    set: "防御をセットしました！両者のカードは裏向きです。公開して確かめましょう。",
    revealed: "カードを公開しました。防御が攻撃に勝ち、相手に1ダメージ！",
    result: "バトル結果", win: "防御でカウンター成功！", damage: "相手に1ダメージ",
    view: "盤面を確認", resultButton: "バトル結果へ",
    player: "あなた", opponent: "相手", life: "ライフ", waiting: "まもなく結果を表示します…",
    done: "基本はバッチリ！本番では相手のカードは分かりません。捨て札やデッキ構成も確認して予想してみてね！",
    extra: "同じ攻撃なら両者に1ダメージ。同じ防御・フェイントならダメージなし。使用したカードは捨て札になります。",
    play: "キャラクター選択へ", again: "もう一度練習する", back: "裏向きのカード"
  },
  en: {
    title: "Tutorial", guide: "Fuka Izumi", exit: "Back to Menu",
    progress: "Step", next: "Next", try: "Let's Try", reveal: "Reveal Cards",
    intro: "Hi! I'm Fuka. Let's learn to play together!",
    goal: "Use Attack, Defence and Feint cards. Both players start with 5 life. Reduce your opponent's life to 0 to win!",
    relations: "Each arrow points to the card it beats. The winner deals 1 damage!",
    rules: ["Attack (red) beats Feint", "Defence (blue) beats Attack", "Feint (purple) beats Defence"],
    choose: "Your opponent will use Attack in this practice round. Choose Defence from your hand!",
    hint: "The blue Defence card counters Attack. Try again!",
    set: "Defence is set! Both cards are face down. Reveal them to see what happens.",
    revealed: "Cards revealed. Defence counters Attack. Your opponent takes 1 damage!",
    result: "Round Result", win: "You countered with Defence!", damage: "Opponent takes 1 damage",
    view: "View Board", resultButton: "Round Result",
    player: "You", opponent: "Opponent", life: "Life", waiting: "Round result coming up…",
    done: "You're ready! In a real match, your opponent's card is hidden. Check their discard pile and deck composition to predict their next move!",
    extra: "Matching Attacks deal 1 damage to both players. Matching Defence or Feint cards deal no damage. Used cards go to the discard pile.",
    play: "Choose Character", again: "Practise Again", back: "Face-down card"
  }
};

function stopTutorial() {
  clearTimeout(tutorialState.timer);
  tutorialState.timer = null;
  app.querySelector(".tutorial-round-result")?.close();
}

function startTutorial() {
  stopTutorial();
  Object.assign(tutorialState, { step: "intro", playerLife: 5, cpuLife: 5 });
  changeScreen("tutorial");
}

function advanceTutorial(step) {
  tutorialState.step = step;
  renderScreen();
  app.querySelector("h1")?.focus();
}

function revealTutorialCards() {
  if (tutorialState.step !== "set") return;
  const damage = calculateDamage("defence", "attack");
  tutorialState.playerLife -= damage.playerDamage;
  tutorialState.cpuLife -= damage.cpuDamage;
  advanceTutorial("revealed");
  // 盤面を先に見せてから結果を表示する。退出時は stopTutorial で解除。
  tutorialState.timer = setTimeout(() => {
    tutorialState.timer = null;
    if (gameState.screen === "tutorial" && tutorialState.step === "revealed") {
      advanceTutorial("result");
    }
  }, 2000);
}

function tutorialElement(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// 文ごとにブロック化し、句点での改行と文内の均等な折り返しを両立する。
function setTutorialParagraphText(node, text) {
  const separator = gameState.language === "ja" ? /。[ \t]*/g : /\.[ \t]*/g;
  const lines = text.replace(separator, "$&\n").trimEnd().split("\n");
  node.replaceChildren();
  lines.forEach(line => {
    const sentence = tutorialElement("span", "tutorial-sentence", line.trim());
    node.append(sentence);
  });
}

function tutorialParagraph(className, text) {
  const paragraph = tutorialElement("p", className);
  setTutorialParagraphText(paragraph, text);
  return paragraph;
}

function createTutorialScreen() {
  const t = TUTORIAL_TEXT[gameState.language];
  const step = tutorialState.step;
  const steps = ["intro", "relations", "choose", "set", "revealed", "done"];
  const number = ["result", "board"].includes(step) ? 5 : steps.indexOf(step) + 1;
  const screen = tutorialElement("section", "tutorial-screen");
  const top = tutorialElement("div", "tutorial-top");
  top.append(createScreenHeading(t.title),
    tutorialElement("span", "tutorial-progress", `${t.progress} ${number} / 6`),
    createLanguageControls(), createMenuButton(t.exit, () => changeScreen("menu")));
  const guide = tutorialElement("aside", "tutorial-guide");
  guide.append(createCardImage("tutorial-portrait", "images/10_fuka_select.webp", t.guide));
  const speech = tutorialElement("div", "tutorial-speech");
  speech.append(tutorialElement("strong", "", t.guide));
  const message = tutorialParagraph("", t[["board", "result"].includes(step) ? "revealed" : step]);
  speech.append(message);
  guide.append(speech);
  const content = tutorialElement("div", "tutorial-content");
  const actions = tutorialElement("div", "tutorial-actions");

  if (step === "intro") {
    content.append(tutorialParagraph("tutorial-goal", t.goal));
    actions.append(createMenuButton(t.next, () => advanceTutorial("relations"), true));
  } else if (step === "relations") {
    const list = tutorialElement("ul", "tutorial-relations");
    ["attack", "defence", "feint"].forEach((type, i) => {
      const row = tutorialElement("li", `tutorial-type-${type}`);
      const target = { attack: "feint", defence: "attack", feint: "defence" }[type];
      row.append(tutorialElement("span", "", CARD_TYPES[type].lang[gameState.language].label),
        tutorialElement("span", "tutorial-arrow", " → "),
        tutorialElement("span", "", CARD_TYPES[target].lang[gameState.language].label),
        tutorialElement("small", "", t.rules[i]));
      list.append(row);
    });
    content.append(list);
    actions.append(createMenuButton(t.try, () => advanceTutorial("choose"), true));
  } else if (step === "choose") {
    const hand = tutorialElement("div", "tutorial-hand");
    ["attack", "defence", "feint"].forEach(type => {
      const button = tutorialElement("button", "tutorial-card-choice");
      button.type = "button";
      button.setAttribute("aria-label", CARD_TYPES[type].lang[gameState.language].label);
      button.append(createCard(CARDS.find(c => c.id === `fuka_${type}`), gameState.language));
      button.append(tutorialElement("span", `tutorial-type-${type}`,
        CARD_TYPES[type].lang[gameState.language].label));
      button.addEventListener("click", () => {
        if (type === "defence") advanceTutorial("set");
        else {
          setTutorialParagraphText(message, t.hint);
          message.setAttribute("role", "status");
        }
      });
      hand.append(button);
    });
    content.append(hand);
  } else if (step === "done") {
    content.append(tutorialParagraph("tutorial-extra", t.extra));
    actions.append(createMenuButton(t.play, () => changeScreen("character-select"), true),
      createMenuButton(t.again, startTutorial));
  } else {
    const field = tutorialElement("div", "tutorial-field");
    const hidden = step === "set";
    [["player", "fuka_defence", tutorialState.playerLife],
      ["opponent", "shizuku_attack", tutorialState.cpuLife]].forEach(([side, id, life]) => {
      const slot = tutorialElement("div", "tutorial-slot");
      const lifeDisplay = tutorialElement("p", "tutorial-life");
      lifeDisplay.append(tutorialElement("span", "tutorial-life-label", t[side]),
        tutorialElement("span", "tutorial-life-value", `${t.life} ${life}`));
      slot.append(lifeDisplay);
      slot.append(hidden
        ? createCardImage("tutorial-card-back", "images/02_card_reverse.webp", t.back)
        : createCard(CARDS.find(c => c.id === id), gameState.language));
      field.append(slot);
    });
    content.append(field);
    if (hidden) actions.append(createMenuButton(t.reveal, revealTutorialCards, true));
    else if (step === "revealed") actions.append(tutorialElement("p", "tutorial-wait", t.waiting));
    else actions.append(createMenuButton(t.resultButton, () => advanceTutorial("result"), true));

    if (step === "result") {
      // 本編と同じCSS・結果文言を使い、練習の進行だけを独立させる。
      const language = gameState.language;
      const japanese = language === "ja";
      const battleText = BATTLE_TEXT[language];
      const dialog = tutorialElement("dialog", "battle-round-result-dialog tutorial-round-result");
      dialog.lang = language;
      dialog.setAttribute("aria-labelledby", "tutorial-result-title");
      dialog.setAttribute("aria-describedby", "tutorial-result-message");
      const panel = tutorialElement("section", "battle-round-result-panel");
      panel.dataset.outcome = "win";
      const heading = tutorialElement("h2", "", t.result);
      heading.id = "tutorial-result-title";
      const playerType = CARD_TYPES.defence.lang[language].label;
      const cpuType = CARD_TYPES.attack.lang[language].label;
      const matchup = tutorialElement("p", "battle-round-result-matchup", japanese
        ? `あなた：${playerType} ／ 相手：${cpuType}`
        : `You: ${playerType} / Opponent: ${cpuType}`);
      const message = tutorialElement("p", "battle-round-result-message");
      message.id = "tutorial-result-message";
      const resultMessage = japanese
        ? battleText.playerRoundWin
        : battleText.playerRoundWin.replace(/!\s*/g, "!\n").trimEnd();
      resultMessage.split("\n").forEach((line, index) => {
        if (index > 0) message.append(document.createElement("br"));
        message.append(document.createTextNode(line));
      });
      const life = tutorialElement("p", "battle-round-result-life", japanese
        ? `残りライフ　あなた：${tutorialState.playerLife} ／ 相手：${tutorialState.cpuLife}`
        : `Life remaining — You: ${tutorialState.playerLife} / Opponent: ${tutorialState.cpuLife}`);
      const buttons = tutorialElement("div", "battle-round-result-actions");
      const viewButton = createMenuButton(t.view, () => advanceTutorial("board"));
      viewButton.autofocus = true;
      buttons.append(viewButton,
        createMenuButton(battleText.nextTurn, () => advanceTutorial("done"), true));
      panel.append(heading, matchup, message, life, buttons);
      dialog.append(panel);
      dialog.addEventListener("cancel", e => { e.preventDefault(); advanceTutorial("board"); });
      screen.append(dialog);
      requestAnimationFrame(() => {
        if (dialog.isConnected && gameState.screen === "tutorial" && tutorialState.step === "result") dialog.showModal();
      });
    }
  }
  screen.prepend(top, guide, content, actions);
  return screen;
}
