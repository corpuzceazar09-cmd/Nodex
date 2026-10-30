import { TUTORIAL_STORAGE_KEY } from "@/data/tutorialDialogue";

export const isTutorialCompleted = () => {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export const completeTutorial = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  } catch {
    // ignore
  }
};

export const resetTutorial = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch {
    // ignore
  }
};
