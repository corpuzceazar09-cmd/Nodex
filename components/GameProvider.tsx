"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TierId } from "@/lib/data/tiers";
import { GATE_ORDER } from "@/lib/data/gates";
import { sounds } from "@/lib/sound";
import {
  DEFAULT_SAVE,
  clearSave,
  coerceProfile,
  loadSave,
  saveSave,
  type CompletedMap,
  type PlayerProfile,
  type SaveData,
} from "@/lib/storage";

export type CompleteResult = {
  newlyCompleted: boolean;
  xpAwarded: number;
  newBadges: string[];
};

type GameState = {
  name: string;
  xp: number;
  level: number;
  streak: number;
  selectedTier: TierId | null;
  completed: CompletedMap;
  stars: Record<string, number>;
  badges: string[];
  exploredGates: string[];
  soundMuted: boolean;
  musicMuted: boolean;
  /** False until the save has been read from storage on the client. */
  loaded: boolean;
  profile: PlayerProfile | null;
  onboarded: boolean;
  setProfile: (profile: PlayerProfile) => void;
  completeOnboarding: () => void;
  selectTier: (tier: TierId) => void;
  completeLevel: (
    levelId: string,
    tierId: TierId,
    rewardXp: number,
    stars?: number,
  ) => CompleteResult;
  markGateExplored: (gateId: string) => void;
  setSoundMuted: (muted: boolean) => void;
  setMusicMuted: (muted: boolean) => void;
  isUnlocked: (tierId: TierId, index: number) => boolean;
  resetProgress: () => void;
};

/** Trivial fake formula: one level per 400 XP. */
function levelFromXp(xp: number): number {
  return Math.floor(xp / 400) + 1;
}

export function levelIdForIndex(tierId: TierId, index: number): string {
  return `${tierId}-${String(index + 1).padStart(2, "0")}`;
}

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<SaveData>(DEFAULT_SAVE);
  const [loaded, setLoaded] = useState(false);

  // Load any existing save once, on the client, after hydration. Doing this in
  // an effect (rather than the initializer) keeps the server and first client
  // render identical and avoids a hydration mismatch.
  useEffect(() => {
    const stored = loadSave();
    if (stored) {
      // Loading persisted state after mount is intentional: it keeps the
      // server render and first client render identical (no hydration error).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSave(stored);
      sounds.setMuted(stored.soundMuted);
    }
    setLoaded(true);
  }, []);

  // Persist on every change, but only from the render after the load. Gating on
  // state (not a ref set inside the load effect) stops the still-default save
  // from overwriting storage before the loaded one arrives.
  useEffect(() => {
    if (!loaded) return;
    saveSave(save);
  }, [save, loaded]);

  const setProfile = useCallback((profile: PlayerProfile) => {
    const clean = coerceProfile(profile);
    if (!clean) return;
    setSave((prev) => ({ ...prev, profile: clean, name: clean.name }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setSave((prev) => (prev.onboarded ? prev : { ...prev, onboarded: true }));
  }, []);

  const selectTier = useCallback((tier: TierId) => {
    setSave((prev) => ({ ...prev, selectedTier: tier }));
  }, []);

  const markGateExplored = useCallback((gateId: string) => {
    setSave((prev) => {
      if (prev.exploredGates.includes(gateId)) return prev;
      const exploredGates = [...prev.exploredGates, gateId];
      const badges =
        exploredGates.length >= GATE_ORDER.length && !prev.badges.includes("truth_seeker")
          ? [...prev.badges, "truth_seeker"]
          : prev.badges;
      return { ...prev, exploredGates, badges };
    });
  }, []);

  const setSoundMuted = useCallback((muted: boolean) => {
    sounds.setMuted(muted);
    setSave((prev) => ({ ...prev, soundMuted: muted }));
  }, []);

  const setMusicMuted = useCallback((muted: boolean) => {
    setSave((prev) => ({ ...prev, musicMuted: muted }));
  }, []);

  const completeLevel = useCallback(
    (
      levelId: string,
      tierId: TierId,
      rewardXp: number,
      stars = 3,
    ): CompleteResult => {
      const already = save.completed[tierId]?.includes(levelId) ?? false;

      const completed: CompletedMap = already
        ? save.completed
        : { ...save.completed, [tierId]: [...(save.completed[tierId] ?? []), levelId] };

      const prevStars = save.stars[levelId] ?? 0;
      const stars2 = Math.max(prevStars, Math.max(1, Math.min(3, stars)));

      const xpAwarded = already ? 0 : rewardXp;

      // Award badges based on the post-completion snapshot.
      const earned: string[] = [];
      const addBadge = (id: string) => {
        if (!save.badges.includes(id) && !earned.includes(id)) earned.push(id);
      };
      const totalCompleted = (Object.keys(completed) as TierId[]).reduce(
        (sum, key) => sum + completed[key].length,
        0,
      );
      if (totalCompleted >= 1) addBadge("first_spark");
      if (completed.newbie.length >= 1) addBadge("and_specialist");
      if (completed.intermediate.length >= 1) addBadge("universal_builder");
      if (completed.advanced.length >= 1 || (completed.circuits?.length ?? 0) >= 1) {
        addBadge("circuit_architect");
      }
      if (stars2 >= 3) addBadge("perfect_circuit");

      const badges = earned.length ? [...save.badges, ...earned] : save.badges;

      setSave((prev) => ({
        ...prev,
        xp: prev.xp + xpAwarded,
        streak: already ? prev.streak : prev.streak + 1,
        completed:
          prev.completed[tierId]?.includes(levelId)
            ? prev.completed
            : { ...prev.completed, [tierId]: [...prev.completed[tierId], levelId] },
        stars: { ...prev.stars, [levelId]: Math.max(prev.stars[levelId] ?? 0, stars2) },
        badges: prev.badges.length === badges.length ? prev.badges : badges,
      }));

      return { newlyCompleted: !already, xpAwarded, newBadges: earned };
    },
    [save],
  );

  const isUnlocked = useCallback(
    (tierId: TierId, index: number) => {
      if (index === 0) return true;
      const previousId = levelIdForIndex(tierId, index - 1);
      return (save.completed[tierId] ?? []).includes(previousId);
    },
    [save.completed],
  );

  const resetProgress = useCallback(() => {
    clearSave();
    sounds.setMuted(DEFAULT_SAVE.soundMuted);
    setSave({ ...DEFAULT_SAVE });
  }, []);

  const value = useMemo<GameState>(
    () => ({
      name: save.name,
      xp: save.xp,
      level: levelFromXp(save.xp),
      streak: save.streak,
      selectedTier: save.selectedTier,
      completed: save.completed,
      stars: save.stars,
      badges: save.badges,
      exploredGates: save.exploredGates,
      soundMuted: save.soundMuted,
      musicMuted: save.musicMuted,
      loaded,
      profile: save.profile,
      onboarded: save.onboarded,
      setProfile,
      completeOnboarding,
      selectTier,
      completeLevel,
      markGateExplored,
      setSoundMuted,
      setMusicMuted,
      isUnlocked,
      resetProgress,
    }),
    [
      save,
      loaded,
      setProfile,
      completeOnboarding,
      selectTier,
      completeLevel,
      markGateExplored,
      setSoundMuted,
      setMusicMuted,
      isUnlocked,
      resetProgress,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameState {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}

/** XP progress (0-100) toward the next level, for the progress bar. */
export function levelProgressPct(xp: number): number {
  return Math.round(((xp % 400) / 400) * 100);
}
