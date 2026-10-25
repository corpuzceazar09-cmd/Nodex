---
date: 2026-10-25
topic: "Breadboard wires blocking hole interaction + wire select/move"
status: validated
---

# Breadboard Wire Hit-Test Fix & Wire Interaction Design

## Problem Statement

In the NODEX breadboard sandbox (`/sandbox`), two defects share one origin:

1. **Existing wires block the holes underneath them.** In WIRE and PLACE mode the user
   cannot start a new wire on, or place a component on, any hole visually covered by an
   existing wire's line.
2. **Wires themselves are un-interactable.** Clicking a wire outside DELETE mode does
   nothing — it cannot be selected, moved, or otherwise interacted with.

### Root cause (verified with exact code evidence)

**File: `components/sandbox/Breadboard.tsx`**

- Holes render first (rails at L436, rows at L511); wires render after (L515–546), so
  SVG paint order puts wires on top in hit-testing.
- Wire hit path (L523–533): `stroke="transparent"`, `strokeWidth={13}` (L527), default
  `visiblePainted` pointer-events → hit-testable across a ±6.5px corridor (26px total)
  against a 24×22px hole grid (COL_W=24, ROW pitch 22). Half-pitches (12/11px) are both
  < 13, so **no clear lane exists** — every hole a wire passes within ~13px of is covered.
- The wire hit path's `onPointerDown` (L529–532) unconditionally calls
  `e.stopPropagation()` then `onWirePointerDown(wire.id, e)`.
- Hole hit circle (L151–163): `r={6.5}` with its own `onPointerDown` → never becomes the
  event target when a wire paints over it (siblings, not ancestor — stopPropagation is
  irrelevant; paint order alone decides).

**File: `components/sandbox/SandboxClient.tsx`**

- `onWirePointerDown` (L335–337) is exactly:
  ```tsx
  function onWirePointerDown(id: string) {
    if (mode === "delete") deleteWire(id);
  }
  ```
  → In `select`, `place`, `wire` modes the pointerdown is **swallowed**: hole handler
  never fires (paint order), background handler never fires (stopPropagation), and the
  wire handler does nothing. No error, silent loss.
- **No wire selection/drag machinery exists**: `DragState` (L37–44) has
  `kind: "component" | "chip"` only; repo-wide grep for `selectedWire|wireDrag|
  kind: "wire"|moveWire` → zero matches. `onPointerMove` (L339–404) and `onPointerUp`
  (L406–438) have no wire branch.

**Latent bug (becomes user-visible once wires are selectable by id):**
`idRef` (L107) starts at `1`, but `DEMO` seeds wires `"w1"`…`"w5"` (L78–82). The first
user-created wire gets id `w1` — a duplicate React key and ambiguous id lookup.

## Constraints

- Design-only scope: no simulation/model changes. `lib/sandboxSimulation.ts` never reads
  `wire.id`, so id changes are safe there.
- No visual redesign — wire appearance must stay identical except for a selection
  highlight.
- Existing behaviors must be preserved: component/chip drag, switch toggle, wire drawing
  and drop thresholds, delete mode, undo/redo, zoom (0.7–1.8 via CSS `scale` on
  `.sandbox-board-scroll`; `toBoard` uses `getScreenCTM()` so it already handles zoom).
- No new dependencies. No test harness exists in the repo (prior engine tests were run
  ad hoc from temp dirs); UI verification is manual.

## Approach

**Chosen: mode-conditional hit-layer ordering.**

Hit-priority rule: **holes win over wires everywhere except DELETE mode**, where wires
must win so they remain deletable even where they cross holes (the hole handler no-ops in
delete mode, so a hole winning there would make wires undeletable at those points).

Alternatives considered and rejected:

1. **Event forwarding** — wire handler converts pointer to board coords, finds nearest
   hole, delegates. Rejected: duplicates `nearestHole` hit logic, fragile thresholds,
   more code in the hot path.
2. **Narrow the hit stroke** (13 → ~7). Rejected: wire endpoints terminate at hole
   centers, so endpoint holes stay covered regardless. Symptom patch, not a fix.

## Architecture

Two rendering passes for wires inside `Breadboard.tsx`, both derived from the same
`wires` prop:

```
paint order (mode !== "delete"):
  rail holes → labels → trench → WIRE HIT LAYER (pointer-events per mode)
  → row holes → wire visuals (pointerEvents="none") → parts → chips → draft

paint order (mode === "delete"):
  rail holes → labels → trench → row holes
  → WIRE HIT LAYER (active) → wire visuals → parts → chips → draft
```

The visual layer never moves and never participates in hit-testing — **appearance is
unchanged**.

## Components

### `components/sandbox/Breadboard.tsx`

- **Wire hit layer (restructured):** the transparent `strokeWidth={13}` path + its
  handlers are extracted from the current `wires.map` block (L515–546) into a layer that
  renders:
  - **before** the hole layers when `mode !== "delete"`
  - **after** the hole layers when `mode === "delete"` (current position)
  - `pointerEvents="none"` when `mode` is `"wire"` or `"place"` (wires are not
    actionable in those modes; this also guarantees hole access even if layering is
    misordered — belt and suspenders)
  - cursor: `not-allowed` in delete (existing), `pointer`/`grab` in select
- **Wire visual layer:** colored path + two endpoint dots, rendered at the current
  location (after holes), `pointerEvents="none"` — unchanged, plus:
  - **Selection highlight** when `selectedId === wire.id`: a blue halo stroke
    (`#1414d2`, wider stroke, lower opacity) under the colored path and slightly larger
    endpoint dots — mirrors the component selection pattern
    (`outline = "#1414d2"`, `outlineWidth = 3` at L173–175).
- No prop changes required beyond what exists (`selectedId`, `mode` are already passed).

### `components/sandbox/SandboxClient.tsx`

- **Selection:** reuse the existing `selectedId` state for wires.
  - Safe: generated component ids are `` `c${idRef.current++}` `` (L458/487/513/542),
    wire ids `` `w${idRef.current++}` `` (L189) — disjoint namespaces; demo ids
    (`chip1`, `sw-a`, …) match neither. Inspector lookup (L616–618) returns `undefined`
    for wire ids and every branch is guarded (`!selected && …` at L824) → renders the
    empty-state panel. No Inspector changes needed.
- **`DragState`:** extend `kind` with `"wire"`; the existing `startState` field carries
  the wire's original endpoints (read `startState.wires.find(...)` during drag). Add a
  board-space pointer origin (`bx`,`by` from `toBoard(event)`) so wire deltas are in
  board units (component drags only need raw `clientX/Y` for the 4px move threshold —
  keep that logic untouched).
- **`onWirePointerDown(id, e)`** becomes mode-aware:
  - `delete` → `deleteWire(id)` (unchanged)
  - `select` → `setPointerCapture`, set `dragRef = { kind: "wire", ... }`,
    `setSelectedId(id)`
  - `wire` / `place` → no-op (hit path has `pointerEvents="none"`; handler won't fire)
- **`onPointerMove` — new wire branch** (after the draft branch, alongside component/chip):
  - same 4px move threshold via `sx/sy`
  - delta = current `toBoard(point)` − stored board origin
  - each endpoint: `nearestHole(orig + delta, { maxDist: 22 })` (same radius as wire
    drop at L411); if null, that endpoint **holds its original position**
  - live `setSandbox` without commit (identical to component-drag pattern)
- **`onPointerUp` — wire branch:**
  - `moved` → `pushPast(drag.startState)` + `sounds.playSnap()` (existing pattern)
  - validation on drop: if resulting `from === to`, or the `(from,to)` pair duplicates
    another wire (same check as `addWire` L178–186) → **revert to original endpoints**
    + `notify("THOSE HOLES ARE ALREADY CONNECTED")` for the duplicate case
  - not moved → selection already set on pointerdown; nothing else
- **`deleteWire`** clears `selectedId` when it matches the deleted wire (mirrors
  `deleteComponent` L225).
- **ID fix:** initialize `idRef` so generated wire ids cannot collide with demo wires
  `w1`–`w5` (e.g. start the counter at 6, or seed DEMO wires from the counter). Must be
  done in the same change — selection correctness depends on unique wire ids.

## Data Flow

**Placing a wire through an existing wire (bug 1):**
```
pointerdown on hole covered by wire
  → hit-test: wire hit layer is below holes (or pointerEvents="none") → HOLE wins
  → onHolePointerDown → startWire (wire/select mode) | placeAt (place mode)
  → draft proceeds normally
```

**Selecting/moving a wire (bug 2):**
```
pointerdown on wire mid-span (select mode; no hole there → wire layer wins)
  → onWirePointerDown → capture + dragRef(kind:"wire") + setSelectedId
pointermove → delta applied to both endpoints, each snapped to nearest hole (maxDist 22)
pointerup  → moved? pushPast(startState) + snap sound
             invalid (self-loop/duplicate)? revert + toast
```

**Delete mode (unchanged):**
```
pointerdown anywhere on wire (hit layer above holes) → deleteWire
```

Note: in select mode a click on a wire **endpoint** lands on the hole (holes win) and
starts a draft wire — that is correct and consistent: holes are always actionable in
select/wire modes. Wires are selected by clicking their mid-span.

## Error Handling

- **Duplicate pair / self-loop after move** → revert endpoints to drag-start values,
  toast `THOSE HOLES ARE ALREADY CONNECTED` (existing message).
- **`toBoard` returns null** (CTM unavailable) → abort branch, same as existing
  handlers.
- **Endpoint snap fails** (`nearestHole` null) → endpoint holds original position; the
  wire never teleports to an invalid location.
- **Pointer capture lost / `pointercancel`** → `onPointerUp` already bound to cancel
  (L368); wire branch behaves like a normal drop.
- **Undo** → `pushPast(startState)` only on actual movement; a plain click never
  pollutes history (matches component behavior).

## Testing Strategy

No UI test harness exists; the simulation engine is unaffected (it never reads
`wire.id`). Verification is a manual browser checklist, run at 100% and 150% zoom:

1. **Wire mode:** start a new wire on a hole covered by an existing wire → draft starts
   from that hole (bug 1 fix).
2. **Place mode:** place a component on a hole covered by a wire → lands correctly.
3. **Select mode:** click a hole covered by a wire → draft starts (holes win).
4. **Select mode:** click wire mid-span → blue highlight appears; Inspector shows
   empty-state (no crash).
5. **Select mode:** drag the wire → both endpoints follow with hole snap; release →
   wire commits; **Undo** restores original position.
6. **Select mode:** drag an endpoint onto a hole already paired with the other endpoint
   → reverts + toast.
7. **Delete mode:** click a wire where it crosses holes → still deletes.
8. **Regression:** component drag, chip drag, switch toggle, DIP toggle, wire drawing
   with hover preview, redo, reset demo, clear — all unchanged.
9. **New wire after load** gets a unique id (no duplicate `w1` React key warning in
   console).

Engine-level ad-hoc tests (prior `nodex-simtest` pattern) may be re-run to confirm the
simulation is untouched, but no new engine tests are required.

## Open Questions

None — decisions made:

- Whole-wire move (both endpoints translate together), not per-endpoint rerouting.
  Endpoint rerouting can be layered on later if wanted.
- No Delete-key shortcut; DELETE mode remains the removal path.
- No Inspector panel for selected wires (shows empty state); add later only if asked.
