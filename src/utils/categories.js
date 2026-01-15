// Kategorije i podkategorije proizvoda
export const categories = {
  KOSA: {
    name: "KOSA",
    subcategories: [
      "Električni aparati za stilizovanje kose",
      "Trajne farbe za kosu",
      "Salonski pribor za rad",
      "Hidrogen i blanš",
      "Profesionalne četke i češljevi",
      "Toneri i color maske za kosu",
      "Nadogradnja prirodne kose",
      "Pribor za nadogradnju kose",
      "Nega i stilizovanje kose",
      "Barber - za muškarce",
    ],
  },
  NOKTI: {
    name: "NOKTI",
    subcategories: [
      "Manikir pribor za rad",
      "Pedikir pribor za rad",
      "Preparati za nokat",
      "Nadogradnja i izlivanje",
      "Gel lak i ojačavanje",
      "Lakovi za prirodne nokte",
      "UV/LED LAMPE",
      "Aspiratori",
      "Ostali pribor",
    ],
  },
  PREPARATI_ZA_LICE_I_TELO: {
    name: "PREPARATI ZA LICE I TELO",
    subcategories: {
      NEGA_LICA: {
        name: "Nega lica",
        items: [
          "Čišćenje lica",
          "Kreme za lice - normalna koža",
          "Kreme za lice - problematična koža",
          "ANTI AGE kolekcija",
        ],
      },
      NEGA_TELA: {
        name: "Nega tela",
        items: [
          "Kreme za telo",
          "Losioni za telo",
          "Buteri za telo",
          "Pilinzi za telo",
          "Anticelulit kolekcija",
          "Dnevna rutina - kućna upotreba",
        ],
      },
    },
  },
  MASAZA: {
    name: "MASAŽA",
    subcategories: {
      ZA_FRIZERE: {
        name: "ZA FRIZERE",
        items: [],
      },
      ZA_KOZMETICARE: {
        name: "ZA KOZMETIČARE",
        items: [],
      },
      ZA_MASAZU: {
        name: "ZA MASAŽU",
        items: [],
      },
      ZA_MANIKIR: {
        name: "ZA MANIKIR",
        items: [],
      },
      ZA_PEDIKIR: {
        name: "ZA PEDIKIR",
        items: [],
      },
      ZA_DEPILACIJU: {
        name: "ZA DEPILACIJU",
        items: [],
      },
    },
  },
  OPREMA_ZA_SALONE: {
    name: "OPREMA ZA SALONE",
    subcategories: {
      ZA_FRIZERE: {
        name: "ZA FRIZERE",
        items: [],
      },
      ZA_KOZMETICARE: {
        name: "ZA KOZMETIČARE",
        items: [],
      },
      ZA_MASAZU: {
        name: "ZA MASAŽU",
        items: [],
      },
      ZA_MANIKIR: {
        name: "ZA MANIKIR",
        items: [],
      },
      ZA_PEDIKIR: {
        name: "ZA PEDIKIR",
        items: [],
      },
      ZA_DEPILACIJU: {
        name: "ZA DEPILACIJU",
        items: [
          "Šećerna pasta - LIKE SUGAR WAX",
          "Hladna depilacija - Patrone",
          "Hladna depilacija - Limenke",
          "Topla depilacija - Film vosak",
          "Topla depilacija - ostalo",
          "Kozmetika za depilaciju",
          "Pribor za depilaciju",
        ],
      },
    },
  },
  CRNA_GORA: {
    name: "CRNA GORA",
    subcategories: [],
  },
};

// Helper funkcija za dobijanje svih kategorija kao niza
export const getCategoriesList = () => {
  return Object.values(categories).map((cat) => ({
    id: cat.name,
    name: cat.name,
    hasSubgroups:
      !!cat.subcategories?.NEGA_LICA ||
      !!cat.subcategories?.ZA_FRIZERE ||
      !!cat.subcategories?.ZA_MASAZU,
  }));
};

// Helper funkcija za dobijanje svih podkategorija za određenu kategoriju
export const getSubcategories = (categoryName) => {
  const category = Object.values(categories).find(
    (cat) => cat.name === categoryName
  );

  if (!category) return [];

  // Ako ima podgrupe (kao PREPARATI ZA LICE I TELO, OPREMA ZA SALONE ili MASAŽA)
  if (
    category.subcategories?.NEGA_LICA ||
    category.subcategories?.ZA_FRIZERE ||
    category.subcategories?.ZA_MASAZU
  ) {
    return category.subcategories;
  }

  // Ako su podkategorije običan niz
  if (Array.isArray(category.subcategories)) {
    return category.subcategories;
  }

  return [];
};
