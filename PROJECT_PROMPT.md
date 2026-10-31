# MASTER PROJECT PROMPT — NODEX

## Your Role

Act as a senior full-stack developer, React/Next.js specialist, and game developer.

Your task is to build (or continue building) **NODEX** — one complete, fully functional,
RPG-inspired educational web game about digital logic and Ethernet cabling.

This is an existing, working project. Do **not** rebuild it from scratch, and do **not**
delete, simplify, or replace working features to make your job easier. Extend it in place.

---

## 1. Project Identity

**Name:** NODEX (previously "Logicians"; internal legacy identifiers may still say `logicians`).

**Type:** Educational, interactive, RPG-inspired web game.

**Topics taught:**
- Basic and advanced digital logic gates
- Truth tables and Boolean operations
- Circuit construction and live simulation
- Interactive RJ45 Ethernet cable wiring
- Straight-through, crossover and rollover cables
- Network cabling fundamentals

The whole app must feel like **one connected game**, not a bundle of unrelated tools.

---

## 2. Technology Stack (do not change)

- **Next.js 16** (App Router, Turbopack default) — do **not** convert to Vite.
- **React 19** with TypeScript.
- **Tailwind CSS v4** plus the project's custom `wf-*` component classes.
- Client Components (`"use client"`) for anything interactive: browser storage, audio, drag/drop.
- Server Components for static/reference pages; unwrap `params` / `searchParams` (they are Promises in Next 16).
- No new runtime dependencies are required (icons are inline SVG; no `lucide-react`, no `canvas-confetti`).

### Next.js 16 conventions to respect
- `params` and `searchParams` are Promises. In Server Components: `await params`.
  In Client Components: use React `use()`.
- `next lint` was removed; lint runs via the `eslint` binary (`npm run lint`).
- `useSearchParams` in a Client Component needs a `<Suspense>` boundary or the build fails —
  the preferred pattern here is to read `searchParams` in a Server Component and pass values down as props.
- Generated route types (`LayoutProps<"/">`) are produced by `next typegen`.

---

## 3. Design System — PRESERVE IT

The Nodex look is a **wireframe / retro lab UI**. Do **not** import neon or cyberpunk styling
(no glowing cyan/purple gradients, no dark scanline theme). Keep it consistent everywhere.

Core tokens (`app/globals.css`):
- Background `#2b2b2b`, foreground `#111`
- Blue `#1414d2` (frames, primary), red `#ff5f5f`, green `#6fd97f`
- Panel `#d9d9d9`, button `#cfcfcf`
- Fonts: Geist + Geist Mono (monospace UI)

Reusable classes: `.wf-page`, `.wf-screen`, `.wf-screen-frame`, `.wf-titlebar`, `.wf-content`,
`.wf-btn` (+ `-primary`, `-green`, `-red`), `.wf-player` (chips/progress/caption), `.wf-chip`,
`.wf-progress`/`.wf-progress-fill`, `.wf-table` (+ `.wf-table-out`, `.wf-cell-clickable`,
`.wf-row-active`), `.wf-overlay`, `.wf-modal` (+ `-correct`, `-wrong`), `.wf-toast`, `.wf-scene`,
`.wf-node` (+ `-done`, `-current`, `-locked`, `-final`), `.wf-block`, `.wf-slot` (+ `-filled`,
`-target`), `.wf-hint`, `.wf-dialogue`, `.wf-cursor`, `.wf-workbench`, `.wf-cnode`, `.wf-led-on`.

Shared components: `ScreenFrame` (screen + red titlebar), `PlayerPanel` (stats/rank/badges),
`GateSymbol`, `IcChip`, `TruthTable`.

---

## 4. Project Structure (target)

```
app/
  layout.tsx                 # Geist fonts, metadata, wraps <GameProvider>
  page.tsx                   # landing ("NODEX", PRESS START)
  globals.css                # Tailwind + wf-* design system
  intro/page.tsx             # typewriter intro dialogue (PROF. LOGIC)
  menu/page.tsx              # main menu (START / CONTINUE / CIRCUIT / RJ45 / LAB / ...)
  tutorial/page.tsx          # guided "build a BUFFER" tutorial
  difficulty/page.tsx        # tier selection
  briefing/[tier]/page.tsx   # gate encyclopedia for a tier (+ "practice in the lab" links)
  map/[tier]/page.tsx        # level path / progression nodes
  level/[levelId]/page.tsx   # challenge flow (MC or build/truth-table)
  complete/[tier]/page.tsx   # tier completion screen
  lab/page.tsx               # SERVER wrapper: reads ?gate= and renders LabClient
  lab/LabClient.tsx          # interactive gate lab (workbench + live truth table)
  circuits/page.tsx          # multi-gate circuit challenges
  cabling/page.tsx           # RJ45 wiring game
  settings/page.tsx          # persistent sound/music toggles + reset progress
  how-to-play/page.tsx       # rules
components/
  GameProvider.tsx           # single shared game state (+ persistence)
  ScreenFrame.tsx  PlayerPanel.tsx  GateSymbol.tsx  IcChip.tsx  TruthTable.tsx
  circuit/
    MovableWorkbench.tsx     # draggable simulation surface
    DynamicWire.tsx          # animated bezier wire
    InputSwitchNode.tsx  LogicGateNode.tsx  OutputLedNode.tsx
    LiveTruthTable.tsx       # highlights the active truth-table row
lib/
  logic.ts                   # evaluateGate / evaluateCircuit / generateTruthTable
  sound.ts                   # Web Audio SoundSystem singleton
  gameState.ts               # ranks + badges
  storage.ts                 # versioned localStorage + migration
  data/
    gates.ts  tiers.ts  levels.ts  circuits.ts  copy.ts
```

Routes: `/`, `/intro`, `/menu`, `/tutorial`, `/difficulty`, `/briefing/[tier]`,
`/map/[tier]`, `/level/[levelId]`, `/complete/[tier]`, `/lab` (`?gate=`),
`/circuits`, `/cabling`, `/settings`, `/how-to-play`.

---

## 5. Digital Logic Features

### 5.1 Gates (all eight required)
`BUFFER, NOT, AND, OR, NAND, NOR, XOR, XNOR`.

Each gate must include: name, symbol, category (Basic/Universal/Arithmetic), Boolean expression,
number of inputs, truth table, plain-language description, how-it-works rule, and a real-world
analogy + hint. Keep them in one shared data source (`lib/data/gates.ts`); do not duplicate
definitions across pages. `GateId` is a union of the eight lowercase ids; `GATE_ORDER` drives the UI.

### 5.2 Real Boolean engine (`lib/logic.ts`)
- `evaluateGate(type, inputs)` — uppercase-normalised; 1-input for `NOT`/`BUFFER`.
- `evaluateCircuit(nodes, connections)` — propagate signals across the graph until stable.
- `generateTruthTable(type)` — 2 rows for 1-input gates, 4 rows otherwise.
Simulation must use real evaluation, never hard-coded answers.

### 5.3 Logic Gate Lab (`/lab`, `?gate=<id>`)
- Gate selector across all eight gates.
- Gate detail: symbol, expression, IC chip, description, rule/analogy/hint, static truth table.
- Interactive **movable workbench**: drag switches, gate and LED; toggle inputs; live output.
- **Live truth table** highlights the current row.
- Must honour a preselected gate via `?gate=` (briefing cards link to it).
- Mark gates explored for the "Truth Seeker" badge.

### 5.4 Movable workbench (circuit components)
- Pointer-event dragging, nodes clamped inside the workbench bounds.
- Wires are SVG cubic beziers that light up when active.
- Toggle switches, automatic re-evaluation, `RESET LAYOUT`.
- No infinite render loops; state updates are driven by node/connection changes.

### 5.5 Circuit Challenges (`/circuits`)
- Seven multi-gate puzzles: half adder, 2:1 multiplexer, majority vote, parity checker,
  active-low signal mask, NAND-as-inverter, and a "Digital Core Matrix" boss.
- The correct answer is computed from `evaluateCircuit`, so it can never contradict the simulation.
- Stars: 3 = first try, 2 = one mistake, 1 = two or more.

### 5.6 Original level system (preserve)
- Three public tiers: `newbie`, `intermediate`, `advanced` (internal `circuits` tier exists but is
  not shown in the difficulty path).
- 10 levels per public tier (9 regular + 1 final), ids like `newbie-01`. **Do not rename level ids.**
- Two challenge kinds: multiple-choice and build/truth-table.
- Reward 50 XP regular, 150 XP final.

---

## 6. RJ45 Ethernet Cable Game (`/cabling`)

Modes and exact pin mappings (preserve exactly):
- **Straight-through:** `1→1, 2→2, 3→3, 4→4, 5→5, 6→6, 7→7, 8→8`
- **Crossover:** `1→3, 2→6, 3→1, 4→4, 5→5, 6→2, 7→7, 8→8`
- **Rollover:** `1→8, 2→7, 3→6, 4→5, 5→4, 6→3, 7→2, 8→1`

Left endpoint uses **T568B** colours:
`1 White/Orange, 2 Orange, 3 White/Green, 4 Blue, 5 White/Blue, 6 Green, 7 White/Brown, 8 Brown`.
Striped wires must show their stripe pattern — never plain solid colours.

Interaction requirements:
- Two RJ45 endpoints (source pins left, target pins right) with an SVG drawing area between.
- Real pointer-drag wiring (wire follows the cursor, then snaps). No fake select-and-auto-connect.
- Crossing wires remain visible; each wire keeps its colour.
- Wrong connections are allowed during play; do not auto-correct.
- Prevent two wires occupying the same destination; support reconnection.
- Controls: Check Wiring, Undo Last, Hint, Reset; progress indicator.
- Completion feedback on a fully correct straight-through/crossover/rollover layout.

---

## 7. RPG & Gamification

- Educational intro, character dialogue, guided tutorial, level selection, difficulty selection,
  completion screens, achievement feedback. Adapt these to the Nodex wireframe style.
- Preserve the original level definitions and progression; do not replace one level system with another.
- Keep unique educational challenges; keep level ids stable.

### XP / Stars / Badges / Persistence (one shared system)
Single `GameProvider` holds: `name, xp, level, streak, selectedTier, completed, stars, badges,
exploredGates, soundMuted, musicMuted` plus actions (`selectTier`, `completeLevel`, `isUnlocked`,
`markGateExplored`, `setSoundMuted`, `setMusicMuted`, `resetProgress`).

- Player level = `floor(xp / 400) + 1`; rank derived from XP thresholds.
- **Anti-farm:** replaying a completed level awards **0 XP** and does not advance the streak.
- Stars stored as the best result, clamped 1–3.
- Badges awarded by real conditions: first completion, newbie clear, intermediate clear,
  advanced/circuit clear, 3-star run, all eight gates explored.
- Unlock rule: node 0 always open, otherwise the previous node must be completed.

Persistence (`lib/storage.ts`):
- Versioned save key `nodex_save_v2`.
- Migrate legacy keys: `logicians_save_v2`, `logicians_save_v1`, `logicable_game_save_v1`.
- Merge field-by-field onto defaults; never discard valid progress.
- Load only on the client after mount to avoid hydration mismatch; save on change.
- `resetProgress()` clears storage and reseeds a clean player.
- Keep the demo seed (1250 XP, streak 5, two cleared levels) for a lively first impression.

---

## 8. Audio & Feedback

- Web Audio `SoundSystem` singleton, lazy `AudioContext` (init on first user gesture), persistent mute.
- Sounds: button click, switch toggle, wire snap, correct, incorrect, fanfare.
- Settings toggles both sound and music preferences and saves them.
- The app must work when audio is unavailable; never throw.
- Feedback/animation for correct/wrong answers, level completion, achievements — consistent with the
  wireframe style; never blocking gameplay or accessibility.

---

## 9. Build & Runtime Requirements

- `npm install` succeeds.
- `npm run dev` runs the app.
- `npx tsc --noEmit` passes.
- `npm run lint` passes (ESLint; no warnings).
- `npm run build` succeeds (Turbopack).
- Every route renders without missing imports or console errors.
- Responsive on desktop and mobile.
- Full interaction works for both logic-gate and RJ45 activities.

Do not claim a check passed unless you actually ran it.

---

## 10. Required Testing Checklist

**Integrity**
- [ ] Original structure and all pages preserved
- [ ] Product named Nodex in the UI; no reference neon theme
- [ ] No broken imports; no duplicate app; no dead nav paths

**Digital logic**
- [ ] All eight gates supported; correct Boolean outputs
- [ ] Symbols and truth tables correct
- [ ] Toggles update outputs; live circuit evaluation works
- [ ] Workbench dragging works; quizzes still function
- [ ] Lab honours `?gate=` preselection

**RJ45**
- [ ] Straight, crossover, rollover all work
- [ ] Eight correct colours incl. stripes
- [ ] Drag follows cursor and snaps; crossings stay visible
- [ ] Wrong connections allowed before checking; validation correct
- [ ] Check/Undo/Reset/Hint work; completion feedback works

**Progression**
- [ ] XP updates; completed levels recorded; unlock rules correct
- [ ] Stars and badges display; save/load works; reset works
- [ ] Replaying a level grants no extra XP

**Quality**
- [ ] No blocking runtime errors; responsive; navigation works
- [ ] Build succeeds; no regressions

---

## 11. Deliverables

1. Full project source.
2. All modified and new files.
3. Dependencies and config.
4. Folder structure.
5. Feature summary.
6. List of changed/created files.
7. Install and run instructions.
8. Test report (passed / failed / not performed).
9. Known remaining issues.
10. A ZIP excluding `node_modules`, `.next`, and build caches.

Install & run:
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

---

## 12. Non-Negotiable Rules

- Never replace the project with a reference implementation.
- Never import neon/cyberpunk styling.
- Never remove working features to simplify integration.
- Never invent missing code and describe it as existing.
- Never leave disconnected or unreachable pages.
- Never silently drop a requested feature.
- Never report an untested build or test as passing.
- Never overwrite valid saved progress without a migration/recovery path.
- Never ship a demo when the request is the full application.
