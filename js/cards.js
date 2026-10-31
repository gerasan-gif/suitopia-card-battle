// 種類ごとの共通情報
const CARD_TYPES = {
  attack: {
    frame: "images/06_attack_frame.webp",
    icon: "images/03_icon_attack.webp",

    lang: {
      ja: {
        label: "攻撃",
        rules: [
          "フェイントに勝つ。",
          "防御にはカウンターを受ける。"
        ]
      },
      en: {
        label: "ATTACK",
        rules: [
          "Beats Feint.",
          "Countered by Defence."
        ]
      }
    }
  },

  defence: {
    frame: "images/07_defence_frame.webp",
    icon: "images/04_icon_defence.webp",

    lang: {
      ja: {
        label: "防御",
        rules: [
          "攻撃にカウンター。",
          "フェイントに負ける。"
        ]
      },
      en: {
        label: "DEFENCE",
        rules: [
          "Counters Attack.",
          "Beaten by Feint."
        ]
      }
    }
  },

  feint: {
    frame: "images/08_feint_frame.webp",
    icon: "images/05_icon_feint.webp",

    lang: {
      ja: {
        label: "フェイント",
        rules: [
          "防御に勝つ。",
          "攻撃に負ける。"
        ]
      },
      en: {
        label: "FEINT",
        rules: [
          "Beats Defence.",
          "Beaten by Attack."
        ]
      }
    }
  }
};


// カードごとの情報
const CARDS = [
  // ── 風香 ──
  {
    id: "fuka_attack",
    type: "attack",
    frame: CARD_TYPES.attack.frame,
    image: "images/11_fuka_attack.webp",
    suit: "images/18_fuka_suit.webp",

    lang: {
      ja: {
        character: "泉 風香",
        name: "ハート・ストライク",
        suitLabel: "ハート",
        alt: "ハートパンチを放つ風香"
      },
      en: {
        character: "Fuka Izumi",
        name: "Heart Strike",
        suitLabel: "Heart",
        alt: "Fuka launching a heart-powered punch"
      }
    }
  },

  {
    id: "fuka_defence",
    type: "defence",
    frame: CARD_TYPES.defence.frame,
    image: "images/12_fuka_defence.webp",
    suit: "images/18_fuka_suit.webp",

    lang: {
      ja: {
        character: "泉 風香",
        name: "ハート・ガード",
        suitLabel: "ハート",
        alt: "ハートの魔法で防御する風香"
      },
      en: {
        character: "Fuka Izumi",
        name: "Heart Guard",
        suitLabel: "Heart",
        alt: "Fuka defending with heart magic"
      }
    }
  },

  {
    id: "fuka_feint",
    type: "feint",
    frame: CARD_TYPES.feint.frame,
    image: "images/13_fuka_feint.webp",
    suit: "images/18_fuka_suit.webp",

    lang: {
      ja: {
        character: "泉 風香",
        name: "ハート・フェイント",
        suitLabel: "ハート",
        alt: "フェイントを仕掛ける風香"
      },
      en: {
        character: "Fuka Izumi",
        name: "Heart Feint",
        suitLabel: "Heart",
        alt: "Fuka performing a feint"
      }
    }
  },

  // ── アンナ ──
  {
    id: "anna_attack",
    type: "attack",
    frame: CARD_TYPES.attack.frame,
    image: "images/21_anna_attack.webp",
    suit: "images/28_anna_suit.webp",

    lang: {
      ja: {
        character: "アンナ・マルコワ",
        name: "ダイヤ・ストライク",
        suitLabel: "ダイヤ",
        alt: "ダイヤの魔法で攻撃するアンナ"
      },
      en: {
        character: "Anna Markova",
        name: "Diamond Strike",
        suitLabel: "Diamond",
        alt: "Anna attacking with diamond magic"
      }
    }
  },

  {
    id: "anna_defence",
    type: "defence",
    frame: CARD_TYPES.defence.frame,
    image: "images/22_anna_defence.webp",
    suit: "images/28_anna_suit.webp",

    lang: {
      ja: {
        character: "アンナ・マルコワ",
        name: "ダイヤ・ガード",
        suitLabel: "ダイヤ",
        alt: "ダイヤの魔法で防御するアンナ"
      },
      en: {
        character: "Anna Markova",
        name: "Diamond Guard",
        suitLabel: "Diamond",
        alt: "Anna defending with diamond magic"
      }
    }
  },

  {
    id: "anna_feint",
    type: "feint",
    frame: CARD_TYPES.feint.frame,
    image: "images/23_anna_feint.webp",
    suit: "images/28_anna_suit.webp",

    lang: {
      ja: {
        character: "アンナ・マルコワ",
        name: "ダイヤ・フェイント",
        suitLabel: "ダイヤ",
        alt: "フェイントを仕掛けるアンナ"
      },
      en: {
        character: "Anna Markova",
        name: "Diamond Feint",
        suitLabel: "Diamond",
        alt: "Anna performing a feint"
      }
    }
  },

  // ── 雫 ──
  {
    id: "shizuku_attack",
    type: "attack",
    frame: CARD_TYPES.attack.frame,
    image: "images/31_shizuku_attack.webp",
    suit: "images/38_shizuku_suit.webp",

    lang: {
      ja: {
        character: "島崎 雫",
        name: "スペード・ストライク",
        suitLabel: "スペード",
        alt: "スペードの魔法で攻撃する雫"
      },
      en: {
        character: "Shizuku Shimazaki",
        name: "Spade Strike",
        suitLabel: "Spade",
        alt: "Shizuku attacking with spade magic"
      }
    }
  },

  {
    id: "shizuku_defence",
    type: "defence",
    frame: CARD_TYPES.defence.frame,
    image: "images/32_shizuku_defence.webp",
    suit: "images/38_shizuku_suit.webp",

    lang: {
      ja: {
        character: "島崎 雫",
        name: "スペード・ガード",
        suitLabel: "スペード",
        alt: "スペードの魔法で防御する雫"
      },
      en: {
        character: "Shizuku Shimazaki",
        name: "Spade Guard",
        suitLabel: "Spade",
        alt: "Shizuku defending with spade magic"
      }
    }
  },

  {
    id: "shizuku_feint",
    type: "feint",
    frame: CARD_TYPES.feint.frame,
    image: "images/33_shizuku_feint.webp",
    suit: "images/38_shizuku_suit.webp",

    lang: {
      ja: {
        character: "島崎 雫",
        name: "スペード・フェイント",
        suitLabel: "スペード",
        alt: "フェイントを仕掛ける雫"
      },
      en: {
        character: "Shizuku Shimazaki",
        name: "Spade Feint",
        suitLabel: "Spade",
        alt: "Shizuku performing a feint"
      }
    }
  },

  // ── 千尋 ──
  {
    id: "chihiro_attack",
    type: "attack",
    frame: CARD_TYPES.attack.frame,
    image: "images/41_chihiro_attack.webp",
    suit: "images/48_chihiro_suit.webp",

    lang: {
      ja: {
        character: "平原 千尋",
        name: "クローバー・ストライク",
        suitLabel: "クローバー",
        alt: "クローバーの魔法で攻撃する千尋"
      },
      en: {
        character: "Chihiro Hirahara",
        name: "Clover Strike",
        suitLabel: "Club",
        alt: "Chihiro attacking with clover magic"
      }
    }
  },

  {
    id: "chihiro_defence",
    type: "defence",
    frame: CARD_TYPES.defence.frame,
    image: "images/42_chihiro_defence.webp",
    suit: "images/48_chihiro_suit.webp",

    lang: {
      ja: {
        character: "平原 千尋",
        name: "クローバー・ガード",
        suitLabel: "クローバー",
        alt: "クローバーの魔法で防御する千尋"
      },
      en: {
        character: "Chihiro Hirahara",
        name: "Clover Guard",
        suitLabel: "Club",
        alt: "Chihiro defending with clover magic"
      }
    }
  },

  {
    id: "chihiro_feint",
    type: "feint",
    frame: CARD_TYPES.feint.frame,
    image: "images/43_chihiro_feint.webp",
    suit: "images/48_chihiro_suit.webp",

    lang: {
      ja: {
        character: "平原 千尋",
        name: "クローバー・フェイント",
        suitLabel: "クローバー",
        alt: "フェイントを仕掛ける千尋"
      },
      en: {
        character: "Chihiro Hirahara",
        name: "Clover Feint",
        suitLabel: "Club",
        alt: "Chihiro performing a feint"
      }
    }
  }
];