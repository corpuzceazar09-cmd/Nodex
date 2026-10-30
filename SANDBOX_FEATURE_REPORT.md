# NODEX — Breadboard Sandbox Feature Report

**Branch:** `feature/sandbox-breadboard`
**Feature:** Expand the sandbox into a breadboard-based free experiment space, plus a functional 4-pin DIP switch component.

---

## 1. Summary of sandbox changes

The `/lab` gate demo is untouched. A **new, separate** free-form sandbox was added at **`/sandbox`**: a
solderless-breadboard workbench where students place real DIP logic ICs, power them, and wire them
freely. Logic is computed from actual breadboard hole connectivity (not from chip placement), and a
chip only drives outputs when its **VCC is tied HIGH and GND is tied LOW**.

Key points:

- **Real breadboard model** — rows A–E (top) / F–J (bottom), 30 numbered columns, a centre trench,
  and 4 power rails (TP/TN top, BP/BN bottom). Each 5-hole group is one net; the trench isolates
  top from bottom.
- **Real DIP ICs with numbered pins** — 7408, 7432, 7400, 7402, 7486, 74266, 74133, 7404. Chips
  straddle the trench, show a pin-1 notch, and expose every pin as a wiring target. Pin roles are
  colour-coded (power / ground / input / output) and readable on hover/selection.
- **Power-gated simulation** — outputs only update when the chip is genuinely powered.
- **Free-form** — place many chips, switches, HIGH/LOW sources, LEDs, resistors, 5V/GND; wire
  anything to anything; make mistakes; delete and retry.
- **Toolbar** — Select / Place / Wire / Delete, Undo / Redo, Reset Demo, Clear, and Zoom −/%/+.
- **Inspector panel** — live pin table (value + net + connected), powered badge, and gate sections
  for the selected chip; live state for switches/LEDs/sources.
- **Non-destructive** — the guided lab, levels, circuits, and RJ45 cabling game are unchanged.

### 4-pin / 2-position DIP switch (new)

A **passive DIP switch** was added to the sandbox library. It straddles the trench like a logic IC and
exposes 4 real breadboard holes for jumper wires.

- **Terminal pairs (exact):** Switch 1 joins **pins 1 & 4** (left column); Switch 2 joins **pins 2 & 3**
  (right column). Each position is an independent ON/OFF bridge.
- **Passive** — the switch never drives HIGH or LOW by itself. Students must wire one side to a source
  (5V / HIGH / switch) and the other to a load (LED / chip input). When a position is ON the pair is
  shorted; when OFF it is isolated.
- **Placement / move / delete** — placed and dragged exactly like a logic IC (column snap across the
  trench), selectable, deletable, and undo/redo compatible.
- **UI** — a wireframe-style body with a pin-1 notch, numbered pins, and two slider toggles with
  ON/OFF labels. The inspector shows both positions with toggle buttons plus a live 4-pin value table.
- **Library entry** — listed under Inputs as **"DIP SWITCH (4 Pins / 2 Positions)"** alongside (not
  replacing) the existing single toggle switch.
- **Simulation** — modeled inside `simulate()` as a passive DSU union of the pin-pair nets when a
  position is ON; it is never registered as a source.

## 2. Files

### New

| File | Purpose |
|------|---------|
| `lib/breadboard.ts` | Geometry + connectivity: holes, base nets, chip pin placement, DSU. |
| `lib/data/chips.ts` | Pin-accurate definitions for all 8 DIP chips (pins, roles, gate groups). |
| `lib/sandboxSimulation.ts` | Netlist builder + power-aware digital simulator (`simulate`, `evalGate`). |
| `components/sandbox/ChipOnBoard.tsx` | DIP chip renderer (notch, numbered pins, role colours, powered dot). |
| `components/sandbox/Breadboard.tsx` | The breadboard SVG (holes, rails, wires, parts, ghost preview). |
| `components/sandbox/SandboxClient.tsx` | Sandbox UI: toolbar, library, inspector, wiring/drag interaction, undo/redo. |
| `app/sandbox/page.tsx` | Route → renders `SandboxClient`. |

### Modified

| File | Change |
|------|--------|
| `app/globals.css` | Appended `.sandbox-*` classes (wireframe style, no neon). |
| `app/menu/page.tsx` | Added `BREADBOARD SANDBOX` link. |
| `app/lab/LabClient.tsx` | Added `OPEN BREADBOARD SANDBOX` link. |
| `app/how-to-play/page.tsx` | Added a 9th rule describing the sandbox. |

Nothing was deleted or replaced.

## 3. Chip / pin mapping approach

Each chip in `lib/data/chips.ts` lists its package, VCC/GND pins, every pin's role + label, and its
internal gate groups. Pin numbering follows the real 74-series datasheets:

- **Quad family (7408/7432/7400/7486/74266)** — 14-pin, VCC=14, GND=7. Standard arrangement
  `1A,1B,1Y,2A,2B,2Y,GND,3Y,3A,3B,4Y,4A,4B,VCC`; gates `(1,2→3) (4,5→6) (9,10→8) (12,13→11)`.
- **7402 NOR** — the classic reversed arrangement: outputs on pins **1, 4, 10, 13**
  (`1Y,1A,1B,2Y,2A,2B,GND,3A,3B,3Y,4A,4B,4Y,VCC`).
- **7404** — hex inverter, 14-pin: `1A,1Y,2A,2Y,3A,3Y,GND,4Y,4A,5Y,5A,6Y,6A,VCC`.
- **74133** — 16-pin single 13-input NAND: inputs on pins 1–7 and 9–14 (labelled A…M), **GND=8**,
  **output Y=15**, **VCC=16**.

Pin→hole placement (`chipPinHole` in `lib/breadboard.ts`) straddles the trench: pins `1…⌈n/2⌉` go on
row **F** (bottom), the rest on row **E** (top), mirrored from the chip's left column. For a 14-pin
chip at column `c`, that is `pin1=F(c)…pin7=F(c+6)` and `pin14=E(c)…pin8=E(c+6)`; for the 16-pin
74133, `pin1=F(c)…pin8=F(c+7)` and `pin16=E(c)…pin9=E(c+7)`.

## 4. Breadboard connectivity model

`lib/breadboard.ts` maps every hole id (e.g. `A5`, `F12`, `TP2`) to a **base net**:

- rows **A–E** in column `n` → `top:n` (all five holes share one net),
- rows **F–J** in column `n` → `bottom:n`,
- rails **TP/TN/BP/BN** → `rail:…` (each rail is one continuous net).

`lib/sandboxSimulation.ts` then unions base nets with a **DSU (disjoint-set union)**:

- every **jumper wire** unions its two endpoint nets,
- every **resistor** unions its two terminal nets (passive link),
- chip pins and component holes simply sit on their base nets.

It then seeds **source values** (switch state, HIGH/5V = 1, LOW/GND = 0), marks those nets as
source-driven, and iteratively evaluates each powered chip's gates, writing outputs onto their nets
until the circuit settles. Sources always win over gate drivers on a shared net (models a real
short/conflict). A chip is `powered` only when its VCC net has a HIGH source, its GND net has a LOW
source, and the two nets differ. LEDs light when their net reads 1. Unconnected/floating inputs read
as 0.

## 5. Test report (all actually executed)

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** (no output) |
| `npm run lint` | **PASS** (clean) |
| `npm run build` | **PASS** — 13 static pages; route `○ /sandbox` present; all 15 prior routes intact |
| `npm run dev` + HTTP | **PASS** — `/sandbox`, `/`, `/menu`, `/lab?gate=and`, `/how-to-play`, `/cabling`, `/circuits`, `/settings`, `/difficulty`, `/intro`, `/tutorial` all 200 |
| `/sandbox` SSR content | **PASS** — contains `BREADBOARD SANDBOX`, `COMPONENT LIBRARY`, `INSPECTOR`, `7408`, `74133`, `RESET DEMO`, `UNDO`, `ZOOM`, `POWERED` |
| Engine unit tests (Node, standalone-compiled) | **PASS** — see below |

**Engine unit tests** (simulate() compiled standalone and driven via Node):

- `test.js` — **5/5**: 7408 AND truth table (00→off, 01→off, 10→off, 11→on) + unpowered case.
- `test2.js` — **22/22**: 7404 NOT (both polarities), 7402 NOR (3 rows incl. reversed pinout),
  **74133** 13-input NAND (all-13-high→out 0, one-low→out 1, VCC/GND pin values, 16-pin hole
  skipping), plus unpowered gating.
- `test3.js` — **20/20**: full 4-row gate-1 truth tables for 7432 OR, 7400 NAND, 7486 XOR, 74266
  XNOR, 7408 AND.

**Bugs found & fixed during testing:** the initial 74133 and quad-chip test failures were **test-harness
errors** (sources/output wired onto holes that shared a net with the chip's top-row pins, so a source
shorted the output; and using `F11/F12/F13` instead of the correct `F10/F11/F12` for a chip at
column 10). The **engine was correct in every case** — after correcting the test wiring, all 47
assertions pass. No product code needed changing for these.

**Manual UI QA — partially verified.** No browser automation is available in this environment, so
interactive pointer flows (drag-to-place, pin-wire drags, undo/redo clicks, zoom) were verified by
code review, SSR marker checks, and the engine unit tests above — **not** by scripted clicking. The
acceptance criteria that depend on physical interaction (place each chip, drag wires, multi-chip
breadboarding, delete/reconnect, reset) should be spot-checked in a real browser.

## 6. Known limitations

- **Digital-only.** No analog behaviour, no pull-up/pull-down resistors, no propagation delay, no
  open-collector/open-drain, no tri-state. Floating inputs read as 0.
- **Rails are single nets.** Each power rail is one continuous net (no per-segment rail splitting).
  Documented simplification.
- **Source-vs-output conflict.** Tying a hard HIGH/LOW source directly onto a chip's output net
  forces that net to the source value (models a short). The gate output is ignored on that net.
- **Resistors are ideal links.** They connect two nets with no resistance (useful as jumpers; not
  for current limiting maths). LEDs light on a logic-1 net regardless of series resistance.
- **No wire routing/obstruction.** Wires are drawn as bezier curves for clarity; they don't avoid
  components or each other electrically (they connect only at the two endpoint holes you pick).
- **No persistence.** Sandbox layouts are session-only (not saved to localStorage like game
  progress).
- **Pin labels are numbers only** on the chip body; friendly names (1A/1Y/VCC) appear in the
  Inspector and on hover, not permanently on the package.

## 7. Polish / follow-ups

- Persist sandbox state to localStorage (opt-in) so students can save experiments.
- Wire-colour picker and per-wire labels.
- Logic probe tool and a "power the whole rail" convenience (tie TP↔BP with one control).
- Snap-to-grid multi-hole components (e.g. DIP sockets) and a component rotation option.
- Optional per-segment power-rail splitting for more faithful breadboard power distribution.
- Browser-based interactive QA pass (the one gap in verification above).
