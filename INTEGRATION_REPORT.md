# NODEX — Integration Report

## 1. What this project is

**NODEX** is a single, connected, RPG-inspired educational web game that teaches:

- Digital logic gates (BUFFER, NOT, AND, OR, NAND, NOR, XOR, XNOR)
- Truth tables and Boolean operations
- Live circuit simulation on a movable workbench
- Multi-gate "Circuit Challenge" puzzles (half adder, multiplexer, majority vote, parity, etc.)
- Interactive RJ45 Ethernet cable wiring (straight-through, crossover, rollover)

It is built on the original Next.js project (previously named **Logicians**, now renamed
**Nodex**). Compatible gameplay from the reference game (`Capstone` / "LogiCable") was adapted
into the existing architecture. The reference project's neon/cyberpunk styling was **not**
imported — the original wireframe design system (`wf-*` classes) is preserved throughout.

## 2. Technology

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4
- No new runtime dependencies were added (icons are inline SVG; no `lucide-react`, no `canvas-confetti`).
- Web Audio API for sound effects (no audio files required).

## 3. Feature summary

### Digital logic
- All **8 gates** (BUFFER added to the original 7) with symbol, expression, description,
  category, rule, real-world analogy and hint, plus a truth table and IC chip reference.
- Interactive **Logic Gate Lab** with a **movable workbench**: drag switches / gate / LED,
  toggle inputs, watch live output, and a **live truth table** that highlights the active row.
- Lab supports a **preselected gate** via `/lab?gate=<id>` (briefing cards link straight to it).
- Boolean evaluation is real (not canned): `evaluateGate`, `evaluateCircuit`, `generateTruthTable`.
- **Circuit Challenges** (`/circuits`): 7 multi-gate puzzles. The correct answer is computed from
  the circuit itself, so it can never disagree with the simulation.
- Original quiz levels, truth-table build challenges, tutorial, difficulty, map, briefing and
  completion screens are all preserved.

### RJ45 cabling (`/cabling`)
- Straight-through, crossover and rollover modes with exact mappings preserved.
- T568B left pin colours including striped white wires.
- Real pointer-drag wiring: the wire follows the cursor, snaps to targets, crossing wires stay visible.
- Check Wiring, Undo Last, Hint, Reset, progress indicator, correct/incorrect + completion feedback.
- Wrong connections are allowed during play; hints never auto-connect.

### Progression (one shared system)
- Single `GameProvider` state: XP, player level/rank, streak, stars, badges, completed levels,
  unlocked content, explored gates, and sound/music preferences.
- **localStorage persistence** with a versioned key (`nodex_save_v2`) and migration from the
  earlier `logicians_save_v2` / `logicians_save_v1` / `logicable_game_save_v1` keys. Safe on the
  client (no hydration mismatch).
- **Anti-farm**: replaying a completed level awards 0 XP and does not inflate the streak;
  stars are stored as the best result (1–3) based on wrong attempts.
- Badges awarded by real conditions (first completion, newbie/intermediate/advanced/circuit clears,
  perfect (3-star) run, exploring all 8 gates in the Lab).
- **Reset progress** in Settings wipes the save and reseeds a clean player.

### Audio
- Web Audio `SoundSystem` singleton: button clicks, switch toggles, wire snaps, correct/incorrect,
  level fanfare. Lazy `AudioContext` init (only after user interaction) and a persistent mute toggle.
  The app works fine when audio is unavailable.

## 4. Files created

- `lib/logic.ts` — Boolean engine (evaluateGate / evaluateCircuit / generateTruthTable)
- `lib/sound.ts` — Web Audio SoundSystem + `sounds` singleton
- `lib/gameState.ts` — ranks, badges, helpers
- `lib/storage.ts` — versioned localStorage save + migration
- `lib/data/circuits.ts` — 7 circuit-challenge definitions
- `components/circuit/DynamicWire.tsx`
- `components/circuit/InputSwitchNode.tsx`
- `components/circuit/LogicGateNode.tsx`
- `components/circuit/OutputLedNode.tsx`
- `components/circuit/MovableWorkbench.tsx`
- `components/circuit/LiveTruthTable.tsx`
- `app/lab/LabClient.tsx` — interactive lab (client)
- `app/circuits/page.tsx` — Circuit Challenges page

## 5. Files modified

- `lib/data/gates.ts` — added BUFFER; enriched all 8 gates (category/rule/analogy/hint); `isGateId`
- `lib/data/tiers.ts` — newbie gate list now includes buffer; added internal `circuits` tier
- `components/GameProvider.tsx` — persistence, stars, badges, sound prefs, anti-farm, reset
- `components/PlayerPanel.tsx` — rank, total stars and badge shelf
- `app/globals.css` — workbench/node/led/active-row styles (wireframe style)
- `app/lab/page.tsx` — now a server wrapper that honours `?gate=` and renders `LabClient`
- `app/settings/page.tsx` — persistent sound/music toggles
- `app/level/[levelId]/page.tsx` — per-attempt stars, SFX, replay = no XP, badge display
- `app/cabling/page.tsx` — SFX, wire reconnection, check/undo/reset audio
- `app/menu/page.tsx` — link to Circuit Challenges
- `app/page.tsx` — landing hint mentions BUFFER; footer rebrand
- `app/briefing/[tier]/page.tsx` — per-gate "Practice in the Lab" link
- `app/how-to-play/page.tsx` — rules for circuit challenges and RJ45 cabling
- `next.config.ts` — `turbopack.root` set (silences workspace-root warning)
- `package.json` / `package-lock.json` — `eslint-config-next` aligned to `^16.4.2` (peer-compatible with Next 16 / ESLint 9)

## 6. Install & run

```bash
cd Nodex            # project folder (after extracting the ZIP)
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

Other scripts: `npm run lint` (ESLint); `npx tsc --noEmit` (type check).

## 7. Test report

| Check | Command | Result |
|---|---|---|
| Install dependencies | `npm install` | PASS (364 packages) |
| Type generation | `npx next typegen` | PASS |
| TypeScript | `npx tsc --noEmit` | PASS (no errors) |
| Lint | `npm run lint` | PASS (no warnings) |
| Production build | `npm run build` | PASS — compiled, 15 routes emitted |
| Dev server boot | `npm run dev` | PASS — Ready in ~1.8s |
| Route: `/` | GET | 200 |
| Route: `/menu` | GET | 200 |
| Route: `/difficulty` | GET | 200 |
| Route: `/briefing/newbie` | GET | 200 |
| Route: `/map/newbie` | GET | 200 |
| Route: `/level/newbie-01` | GET | 200 |
| Route: `/complete/newbie` | GET | 200 |
| Route: `/lab?gate=and` | GET | 200 |
| Route: `/lab?gate=buffer` | GET | 200 |
| Route: `/circuits` | GET | 200 |
| Route: `/cabling` | GET | 200 |
| Route: `/settings` | GET | 200 |
| Route: `/how-to-play` | GET | 200 |
| Route: `/intro` | GET | 200 |
| Route: `/tutorial` | GET | 200 |

Not performed: automated browser interaction tests (no E2E runner configured). Interactive
behaviour (drag wiring, workbench dragging) is implemented with pointer events and verified by
code review and successful build/render; manual click-through is recommended.

## 8. Known issues / notes

- The save seed keeps the original demo player (1250 XP, streak 5, two completed levels) so the
  app looks alive on first load. Use **Settings → Reset Progress** for a clean start.
- Circuit Challenges are a bonus tier reachable from the menu; they are intentionally not part of
  the three-difficulty level path, so existing saved progression is untouched.
- Existing level IDs (`newbie-01`, `intermediate-03`, …) were **not** renamed, so any saved progress
  remains valid.
