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


// 指定された言語で、カード1枚のHTMLを作る
function createCard(cardData, language = "ja") {
  const typeData = CARD_TYPES[cardData.type];
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