// スマートフォンの縦向き表示を案内する
const rotateGuide = document.createElement("dialog");
rotateGuide.className = "rotate-guide";
rotateGuide.setAttribute("aria-labelledby", "rotate-guide-heading");

const rotateHeading = document.createElement("h2");
rotateHeading.id = "rotate-guide-heading";
rotateHeading.textContent = "端末を横向きにしてください";
rotateHeading.tabIndex = -1;
rotateHeading.autofocus = true;

const rotateMessage = document.createElement("p");
rotateMessage.textContent =
  "Please rotate your phone to landscape.";

rotateGuide.append(rotateHeading, rotateMessage);
document.body.append(rotateGuide);

// Escキーで案内だけ閉じられないようにする
rotateGuide.addEventListener("cancel", (event) => {
  event.preventDefault();
});

// スマホ相当の横幅・タッチ操作・縦向きの場合
const portraitPhone = window.matchMedia(
  "(max-width: 600px) and (orientation: portrait) and (any-pointer: coarse)"
);

function updateRotateGuide() {
  if (portraitPhone.matches) {
    if (!rotateGuide.open) {
      rotateGuide.showModal();
    }
  } else if (rotateGuide.open) {
    rotateGuide.close();
  }
}

portraitPhone.addEventListener("change", updateRotateGuide);
updateRotateGuide();