// 現在の表示状態
const gameState = {
  language: "ja",
  screen: "title",
  battle: null
};


// 画面に表示する文字
const SCREEN_TEXT = {
  ja: {
    title: "スートピア・カードバトル",
    openMenu: "メニューへ",
    menu: "メインメニュー",
    start: "ゲームスタート",
    rules: "ルール説明",
    cards: "カード一覧",
    backMenu: "メニューへ戻る",
    backTitle: "タイトルへ戻る",
    imageAlt: "スートピア・カードバトルのタイトルイラスト",

    guide: [
      {
        title: "勝利条件",
        body: "相手のライフを0にすると勝利です。お互いのライフは5から始まります。同時に0になった場合は引き分けです。"
      },
      {
        title: "デッキと手札",
        body: "デッキは15枚、最初の手札は3枚です。最初のターンはドローせず、2ターン目から毎ターン1枚引きます。"
      },
      {
        title: "キャラクターごとのデッキ構成",
        body: "各デッキは15枚です。\n泉 風香：攻撃5枚・防御5枚・フェイント5枚。\nアンナ・マルコワ：攻撃4枚・防御7枚・フェイント4枚。\n島崎 雫：攻撃7枚・防御4枚・フェイント4枚。\n平原 千尋：攻撃4枚・防御4枚・フェイント7枚。\n相手の捨て札を確認すると、まだ使われていないカードの枚数を推測できます。"
      },
      {
        title: "カードを選ぶ",
        body: "お互いに手札から1枚選び、裏向きでセットします。両者が選んだら公開し、組み合わせで結果を判定します。使用したカードは捨て札になります。"
      },
      {
        title: "攻撃・防御・フェイント",
        body: "攻撃はフェイントに勝ち、防御は攻撃にカウンターし、フェイントは防御に勝ちます。勝った側が相手に1ダメージを与えます。"
      },
      {
        title: "同じ種類を出した場合",
        body: "攻撃同士は、お互いに1ダメージを受けます。防御同士、フェイント同士ではダメージは発生しません。ダメージは同時に処理します。"
      },
      {
        title: "デッキがなくなった場合",
        body: "カードを引くときにデッキが空なら、その時点でライフを比較します。ライフの多い側が勝利し、同じなら引き分けです。"
      }
    ]
  },

  en: {
    title: "Suitopia: Card Battle",
    openMenu: "Open Menu",
    menu: "Main Menu",
    start: "Game Start",
    rules: "How to Play",
    cards: "Card Gallery",
    backMenu: "Back to Menu",
    backTitle: "Back to Title",
    imageAlt: "Suitopia: Card Battle title illustration",

    guide: [
      {
        title: "Winning",
        body: "Reduce your opponent's life to 0 to win. Both players start with 5 life. If both reach 0 at the same time, the game is a draw."
      },
      {
        title: "Deck and Hand",
        body: "Each deck contains 15 cards. Start with 3 cards in hand. Skip the draw on the first turn, then draw 1 card each turn."
      },
      {
        title: "Character Decks",
        body: "Each deck contains 15 cards.\nFuka Izumi: 5 Attack, 5 Defence, 5 Feint.\nAnna Markova: 4 Attack, 7 Defence, 4 Feint.\nShizuku Shimazaki: 7 Attack, 4 Defence, 4 Feint.\nChihiro Hirahara: 4 Attack, 4 Defence, 7 Feint.\nCheck your opponent's discard pile to work out how many cards of each type remain unplayed."
      },      
      {
        title: "Choosing a Card",
        body: "Each player chooses 1 card from their hand and sets it face down. Reveal both cards after both players have chosen. Discard used cards."
      },
      {
        title: "Attack, Defence and Feint",
        body: "Attack beats Feint. Defence counters Attack. Feint beats Defence. The winner deals 1 damage to the opponent."
      },
      {
        title: "Matching Types",
        body: "If both players use Attack, both take 1 damage. Matching Defence or Feint cards cause no damage. All damage is resolved simultaneously."
      },
      {
        title: "An Empty Deck",
        body: "If a player must draw from an empty deck, immediately compare life totals. The player with more life wins. Equal life totals result in a draw."
      }
    ]
  }
};


const app = document.getElementById("app");


// メニューボタンを作る
function createMenuButton(label, onClick, primary = false) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = primary
    ? "menu-button menu-button-primary"
    : "menu-button";

  button.textContent = label;
  button.addEventListener("click", onClick);

  return button;
}


// 見出しを作る
function createScreenHeading(label, hidden = false) {
  const heading = document.createElement("h1");

  heading.className = hidden
    ? "screen-heading visually-hidden"
    : "screen-heading";

  heading.textContent = label;
  heading.tabIndex = -1;

  return heading;
}

// 先読みした画像を保持する
const battleImageCache = new Map();


// 対戦で使う画像を先読みする
function preloadBattleImages() {
  const sources = new Set([
    "images/02_card_reverse.webp",

    // キャラクター画像
    ...CHARACTERS.map((character) => character.image),

    // カードのイラスト・枠・スート
    ...CARDS.flatMap((card) => [
      card.image,
      card.frame,
      card.suit
    ]),

    // 攻撃・防御・フェイントのアイコン
    ...Object.values(CARD_TYPES).map((type) => type.icon)
  ]);

  sources.forEach((source) => {
    // 読み込み済み・読み込み中なら追加しない
    if (battleImageCache.has(source)) {
      return;
    }

    const image = new Image();

    battleImageCache.set(source, image);

    image.src = source;

    // ダウンロードに加えて、表示の準備も進める
    image.decode().catch((error) => {
      battleImageCache.delete(source);

      console.warn(
        `画像を先読みできませんでした: ${source}`,
        error
      );
    });
  });
}

// 画面を切り替える
function changeScreen(screen) {
  if (screen !== "battle") {
    stopBattleBgm();
  }

  gameState.screen = screen;

  renderScreen();
  window.scrollTo(0, 0);

  app.querySelector("h1")?.focus();

  // キャラクター選択画面で対戦画像の先読みを始める
  if (screen === "character-select") {
    preloadBattleImages();
  }
}


// 言語切り替えを作る
function createLanguageControls() {
  const controls = document.createElement("div");

  controls.className = "language-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "表示言語 / Language");

  [
    { code: "ja", label: "日本語" },
    { code: "en", label: "English" }
  ].forEach(({ code, label }) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "language-button";
    button.textContent = label;
    button.lang = code;

    button.setAttribute(
      "aria-pressed",
      String(gameState.language === code)
    );

    button.addEventListener("click", () => {
      if (gameState.language === code) {
        return;
      }

      gameState.language = code;
      renderScreen();

      // 再描画後も選んだボタンにフォーカスを戻す
      app.querySelector(
        `.language-button[lang="${code}"]`
      )?.focus();
    });

    controls.append(button);
  });

  return controls;
}


// タイトル画面
function createTitleScreen(text) {
  const screen = document.createElement("section");
  screen.className = "intro-screen";

  const heading = createScreenHeading(
    text.title,
    true
  );

  // 余白も含めて画面全体をクリック・タップ可能にする
  const startArea = document.createElement("button");
  startArea.type = "button";
  startArea.className = "intro-start";
  startArea.setAttribute(
    "aria-label",
    "Click or Tap to Start"
  );

  startArea.addEventListener("click", () => {
    changeScreen("menu");
  });

  // 画像と案内文字を同じ枠に入れる
  const stage = document.createElement("span");
  stage.className = "intro-stage";

  const image = createCardImage(
    "intro-image",
    "images/01_start.webp",
    ""
  );
  image.draggable = false;

  const prompt = document.createElement("span");
  prompt.className = "intro-prompt";
  prompt.lang = "en";
  prompt.textContent = "Click or Tap to Start";

  stage.append(image, prompt);
  startArea.append(stage);
  screen.append(heading, startArea);

  return screen;
}

// メインメニュー画面
function createMainMenuScreen(text) {
  const screen = document.createElement("section");
  screen.className = "main-menu-screen";

  const panel = document.createElement("div");
  panel.className = "main-menu-panel";

  const heading = createScreenHeading(text.menu);

  const buttons = document.createElement("div");
  buttons.className = "menu-stack";

  buttons.append(
    createMenuButton(
      text.start,
      () => changeScreen("character-select"),
      true
    ),
    createMenuButton(
      text.rules,
      () => changeScreen("rules")
    ),
    createMenuButton(
      text.cards,
      () => changeScreen("gallery")
    )
  );

  const backButton = createMenuButton(
    text.backTitle,
    () => changeScreen("title")
  );
  backButton.classList.add("text-button");

  panel.append(
    heading,
    buttons,
    createLanguageControls(),
    backButton
  );

  screen.append(panel);

  return screen;
}


// タイトル以外の共通画面を作る
function createContentScreen(title) {
  const screen = document.createElement("section");
  screen.className = "content-screen";

  screen.append(
    createScreenHeading(title),
    createLanguageControls()
  );

  return screen;
}


// カード一覧
function createGalleryScreen(text) {
  const screen = createContentScreen(text.cards);

  const backButton = createMenuButton(
    text.backMenu,
    () => changeScreen("menu")
  );

  const list = document.createElement("div");
  list.className = "card-list";

  CARDS.forEach((cardData) => {
    list.append(createCard(cardData, gameState.language));
  });

  const bottomBackButton = createMenuButton(
    text.backMenu,
    () => changeScreen("menu")
  );

  screen.append(backButton, list, bottomBackButton);

  return screen;
}


// ルール説明
function createRulesScreen(text) {
  const screen = createContentScreen(text.rules);

  const guide = document.createElement("div");
  guide.className = "rules-panel";

  text.guide.forEach((item) => {
    const section = document.createElement("section");
    section.className = "rule-section";

    const heading = document.createElement("h2");
    heading.textContent = item.title;

    const paragraph = document.createElement("p");
    paragraph.textContent = item.body;

    section.append(heading, paragraph);
    guide.append(section);
  });

  screen.append(
    guide,
    createMenuButton(
      text.backMenu,
      () => changeScreen("menu")
    )
  );

  return screen;
}

// 現在の状態に合わせて表示する
function renderScreen() {
  const text = SCREEN_TEXT[gameState.language];

  document.documentElement.lang = gameState.language;
  document.title = text.title;

  let screen;

  switch (gameState.screen) {
    case "menu":
      app.className = "app-menu";
      screen = createMainMenuScreen(text);
      break;

    case "gallery":
      app.className = "app-content";
      screen = createGalleryScreen(text);
      break;

    case "rules":
      app.className = "app-content";
      screen = createRulesScreen(text);
      break;

    case "character-select":
      app.className = "app-content app-character-select";
      screen = createCharacterSelectScreen();
      break;
    
    case "battle":
      app.className = "app-battle";
      screen = createBattleScreen();
      break;

    default:
      app.className = "app-title";
      screen = createTitleScreen(text);
      break;
  }

  app.replaceChildren(screen);
}


// 初回表示
renderScreen();