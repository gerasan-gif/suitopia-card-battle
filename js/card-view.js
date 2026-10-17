// 最初に表示する言語
let currentLanguage = "ja";


// 画像を作る共通処理
function createCardImage(className, source, description = "") {
  const image = document.createElement("img");

  image.className = className;
  image.src = source;
  image.alt = description;

  if (description === "") {
    image.setAttribute("aria-hidden", "true");
  }

  return image;
}


// カード1枚のHTMLを作る
function createCard(cardData, language = currentLanguage) {
  const typeData = CARD_TYPES[cardData.type];

  // 選択された言語の情報を取り出す
  const cardText = cardData.lang[language];
  const typeText = typeData.lang[language];

  const card = document.createElement("article");
  card.className = "card";
  card.dataset.cardId = cardData.id;
  card.lang = language;

  // キャラクターのイラスト
  const art = createCardImage(
    "card-art",
    cardData.image,
    cardText.alt
  );

  // カードの枠
  const frame = createCardImage(
    "card-frame",
    cardData.frame
  );

  // 左上の種類マーク
  const typeIcon = createCardImage(
    "type-icon",
    typeData.icon
  );

  // 上部の種類名
  const header = document.createElement("header");
  header.className = "card-header";
  header.textContent = typeText.label;

  // 右上のスートマーク
  const suitIcon = createCardImage(
    "suit-icon",
    cardData.suit,
    cardText.suitLabel
  );

  // 下部のテキストエリア
  const text = document.createElement("section");
  text.className = "card-text";

  // 技名
  const name = document.createElement("h2");
  name.textContent = cardText.name;

  // キャラクター名
  const character = document.createElement("p");
  character.className = "character-name";
  character.textContent = `- ${cardText.character} -`;

  // ルール説明
  const rule = document.createElement("p");
  rule.className = "card-rule";

  typeText.rules.forEach((line, index) => {
    if (index > 0) {
      rule.append(document.createElement("br"));
    }

    rule.append(document.createTextNode(line));
  });

  text.append(name, character, rule);
  card.append(art, frame, typeIcon, header, suitIcon, text);

  return card;
}


// 表示先
const cardArea = document.getElementById("card-area");


// 言語切り替えボタンのエリア
const languageControls = document.createElement("div");
languageControls.setAttribute("role", "group");
languageControls.setAttribute("aria-label", "表示言語 / Language");

Object.assign(languageControls.style, {
  display: "flex",
  gap: "12px"
});


// カード一覧のエリア
const cardList = document.createElement("div");
cardList.id = "card-list";

Object.assign(cardList.style, {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  width: "100%"
});


// 言語切り替えボタンを作る
const languageButtons = {};

[
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" }
].forEach(({ code, label }) => {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;
  button.lang = code;

  button.addEventListener("click", () => {
    currentLanguage = code;
    renderCards();
  });

  languageButtons[code] = button;
  languageControls.append(button);
});


// 選択された言語でカード一覧を表示する
function renderCards() {
  const cards = CARDS.map((cardData) => {
    return createCard(cardData, currentLanguage);
  });

  // 一覧を入れ替えて、カードの重複を防ぐ
  cardList.replaceChildren(...cards);

  // ページの言語も合わせる
  document.documentElement.lang = currentLanguage;

  // 選択中のボタンを更新する
  Object.entries(languageButtons).forEach(([code, button]) => {
    const isSelected = code === currentLanguage;

    button.setAttribute("aria-pressed", String(isSelected));
    button.disabled = isSelected;
  });
}


// タイトルの下にボタンとカード一覧を追加
cardArea.append(languageControls, cardList);

// 読み込み中のメッセージを削除
document.getElementById("loading-message")?.remove();

// 初回表示
renderCards();