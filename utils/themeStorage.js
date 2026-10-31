export const THEME_STORAGE_KEY = "nodex_bedroom_theme";

export const getSavedTheme = () => {
  if (typeof window === "undefined") return "classic";
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || "classic";
  } catch {
    return "classic";
  }
};

export const saveTheme = (theme) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
};
