export const BEDROOM_THEMES = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Inspired by Pokémon FireRed",
    colors: {
      floor: "#8b7355",
      wall: "#d2691e",
      wallBorder: "#8b4513",
      rug: "#8b0000"
    }
  },
  nodex: {
    id: "nodex",
    name: "NODEX",
    description: "Original NODEX retro style",
    colors: {
      floor: "#6b5b73",
      wall: "#4a4e69",
      wallBorder: "#22223b",
      rug: "#9a8c98"
    }
  }
};

export const getTheme = (themeId) => {
  return BEDROOM_THEMES[themeId] || BEDROOM_THEMES.classic;
};
