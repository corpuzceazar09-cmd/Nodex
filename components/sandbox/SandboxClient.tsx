"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ScreenFrame from "@/components/ScreenFrame";
import { sounds } from "@/lib/sound";
import { CHIPS, CHIP_ORDER, type ChipId } from "@/lib/data/chips";
import {
  chipPinHole,
  holeX,
  holeY,
  maxChipStart,
  nearestColumn,
  nearestHole,
  splitHole,
} from "@/lib/breadboard";
import {
  DIP_PACKAGE_PINS,
  dipPinHole,
  simulate,
  type SandboxComponent,
  type SandboxKind,
  type SandboxState,
} from "@/lib/sandboxSimulation";
import Breadboard, {
  type DraftWire,
  type GhostChip,
  type SandboxMode,
} from "./Breadboard";
import ChipOnBoard, { type PinHover } from "./ChipOnBoard";
import DipSwitchOnBoard from "./DipSwitchOnBoard";

type PartKind = Exclude<SandboxKind, "chip">;

type LibraryItem =
  | { type: "chip"; chipId: ChipId }
  | { type: "part"; kind: PartKind };

type DragState = {
  kind: "component" | "chip" | "wire";
  id: string;
  startState: SandboxState;
  moved: boolean;
  sx: number;
  sy: number;
  bx: number;
  by: number;
};

const PART_LABEL: Record<PartKind, string> = {
  switch: "SWITCH",
  high: "HIGH 1",
  low: "LOW 0",
  led: "LED",
  resistor: "RESISTOR",
  power: "5V",
  ground: "GND",
  dip: "DIP SWITCH (4 Pins / 2 Positions)",
};

const PART_ORDER: PartKind[] = [
  "switch",
  "dip",
  "high",
  "low",
  "led",
  "resistor",
  "power",
  "ground",
];

const DEMO: SandboxState = {
  components: [
    { id: "chip1", kind: "chip", chipId: "7408", label: "7408", startCol: 8 },
    { id: "sw-a", kind: "switch", label: "A", hole: "A2", state: 1 },
    { id: "sw-b", kind: "switch", label: "B", hole: "A3", state: 0 },
    { id: "led-y", kind: "led", label: "Y", hole: "A4" },
    { id: "pwr", kind: "power", label: "5V", hole: "TP1" },
    { id: "gnd", kind: "ground", label: "GND", hole: "BN1" },
  ],
  wires: [
    { id: "w1", from: "A2", to: "F8" },
    { id: "w2", from: "A3", to: "F9" },
    { id: "w3", from: "F10", to: "A4" },
    { id: "w4", from: "TP1", to: "E8" },
    { id: "w5", from: "BN1", to: "F14" },
  ],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default function SandboxClient() {
  const [sandbox, setSandbox] = useState<SandboxState>(DEMO);
  const [past, setPast] = useState<SandboxState[]>([]);
  const [future, setFuture] = useState<SandboxState[]>([]);
  const [mode, setMode] = useState<SandboxMode>("select");
  const [pending, setPending] = useState<LibraryItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>("chip1");
  const [hoverHole, setHoverHole] = useState<string | null>(null);
  const [hoverPin, setHoverPin] = useState<PinHover>(null);
  const [draft, setDraft] = useState<DraftWire>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [resistorStart, setResistorStart] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const stateRef = useRef<SandboxState>(DEMO);
  const dragRef = useRef<DragState | null>(null);
  const idRef = useRef(6);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sim = useMemo(() => simulate(sandbox), [sandbox]);

  useEffect(() => {
    stateRef.current = sandbox;
  }, [sandbox]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  function commit(next: SandboxState) {
    setPast((prev) => [...prev.slice(-49), stateRef.current]);
    setFuture([]);
    stateRef.current = next;
    setSandbox(next);
  }

  function mutate(update: (current: SandboxState) => SandboxState) {
    commit(update(stateRef.current));
  }

  function pushPast(previous: SandboxState) {
    setPast((prev) => [...prev.slice(-49), previous]);
    setFuture([]);
  }

  function toBoard(event: React.PointerEvent): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const local = point.matrixTransform(matrix.inverse());
    return { x: local.x, y: local.y };
  }

  function undo() {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setFuture((next) => [stateRef.current, ...next].slice(0, 50));
    setPast(past.slice(0, -1));
    stateRef.current = previous;
    setSandbox(previous);
    sounds.playBtn();
  }

  function redo() {
    if (future.length === 0) return;
    const next = future[0];
    setPast((prev) => [...prev.slice(-49), stateRef.current]);
    setFuture(future.slice(1));
    stateRef.current = next;
    setSandbox(next);
    sounds.playBtn();
  }

  function addWire(from: string, to: string) {
    const current = stateRef.current;
    const exists = current.wires.some(
      (wire) =>
        (wire.from === from && wire.to === to) ||
        (wire.from === to && wire.to === from),
    );
    if (exists) {
      notify("THOSE HOLES ARE ALREADY CONNECTED");
      return;
    }
    commit({
      ...current,
      wires: [...current.wires, { id: `w${idRef.current++}`, from, to }],
    });
    sounds.playSnap();
  }

  function toggleSwitch(id: string) {
    commit({
      ...stateRef.current,
      components: stateRef.current.components.map((component) =>
        component.id === id
          ? { ...component, state: component.state === 1 ? 0 : 1 }
          : component,
      ),
    });
  }

  function toggleDip(id: string, index: 0 | 1) {
    commit({
      ...stateRef.current,
      components: stateRef.current.components.map((component) => {
        if (component.id !== id) return component;
        const next: [number, number] = [
          component.dipStates?.[0] ?? 0,
          component.dipStates?.[1] ?? 0,
        ];
        next[index] = next[index] === 1 ? 0 : 1;
        return { ...component, dipStates: next };
      }),
    });
  }

  function deleteComponent(id: string) {
    mutate((current) => ({
      ...current,
      components: current.components.filter((component) => component.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
    sounds.playBtn();
  }

  function deleteWire(id: string) {
    mutate((current) => ({
      ...current,
      wires: current.wires.filter((wire) => wire.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
    sounds.playBtn();
  }

  function startWire(hole: string, event: React.PointerEvent) {
    const point = toBoard(event);
    if (!point) return;
    svgRef.current?.setPointerCapture(event.pointerId);
    setDraft({ from: hole, x: point.x, y: point.y });
    sounds.playBtn();
  }

  function onHolePointerDown(hole: string, event: React.PointerEvent) {
    if (mode === "place") {
      placeAt(hole);
      return;
    }
    if (mode === "delete") return;
    startWire(hole, event);
  }

  function onBackgroundPointerDown(event: React.PointerEvent) {
    if (mode === "place" && pending) {
      const point = toBoard(event);
      if (!point) return;
      const hole = nearestHole(point.x, point.y, { maxDist: 999 });
      if (hole) placeAt(hole);
      return;
    }
    if (mode === "select") setSelectedId(null);
  }

  function onPartPointerDown(id: string, event: React.PointerEvent) {
    event.stopPropagation();
    if (mode === "delete") {
      deleteComponent(id);
      return;
    }
    if (mode === "place") return;
    svgRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind: "component",
      id,
      startState: stateRef.current,
      moved: false,
      sx: event.clientX,
      sy: event.clientY,
      bx: 0,
      by: 0,
    };
    setSelectedId(id);
  }

  function onChipPointerDown(id: string, event: React.PointerEvent) {
    event.stopPropagation();
    if (mode === "delete") {
      deleteComponent(id);
      return;
    }
    if (mode === "place") return;
    svgRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind: "chip",
      id,
      startState: stateRef.current,
      moved: false,
      sx: event.clientX,
      sy: event.clientY,
      bx: 0,
      by: 0,
    };
    setSelectedId(id);
  }

  function onPinPointerDown(
    componentId: string,
    pin: number,
    event: React.PointerEvent,
  ) {
    if (mode === "delete") {
      deleteComponent(componentId);
      return;
    }
    if (mode === "place") return;
    const component = stateRef.current.components.find(
      (entry) => entry.id === componentId,
    );
    if (component?.kind === "dip" && component.startCol !== undefined) {
      const hole = dipPinHole(component.startCol, pin);
      const parts = splitHole(hole);
      if (!parts) return;
      startWire(hole, event);
      return;
    }
    if (!component?.chipId) return;
    const def = CHIPS[component.chipId];
    const hole = chipPinHole(
      component.startCol ?? 1,
      def.packagePins,
      pin,
    );
    const parts = splitHole(hole);
    if (!parts) return;
    startWire(hole, event);
  }

  function onWirePointerDown(id: string, event: React.PointerEvent) {
    if (mode === "delete") {
      deleteWire(id);
      return;
    }
    if (mode !== "select") return;
    const point = toBoard(event);
    if (!point) return;
    svgRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind: "wire",
      id,
      startState: stateRef.current,
      moved: false,
      sx: event.clientX,
      sy: event.clientY,
      bx: point.x,
      by: point.y,
    };
    setSelectedId(id);
  }

  function onPointerMove(event: React.PointerEvent) {
    const point = toBoard(event);
    if (!point) return;

    if (draft) {
      const target = nearestHole(point.x, point.y, { maxDist: 18 });
      setDraft({ ...draft, x: point.x, y: point.y });
      setHoverHole(target);
      return;
    }

    const drag = dragRef.current;
    if (drag) {
      const dx = event.clientX - drag.sx;
      const dy = event.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 4) drag.moved = true;
      if (!drag.moved) return;

      if (drag.kind === "wire") {
        const wire = drag.startState.wires.find((entry) => entry.id === drag.id);
        const fromParts = splitHole(wire?.from ?? "");
        const toParts = splitHole(wire?.to ?? "");
        if (!wire || !fromParts || !toParts) return;
        const delta = { x: point.x - drag.bx, y: point.y - drag.by };
        const fromTarget = nearestHole(
          holeX(fromParts.col) + delta.x,
          holeY(fromParts.row) + delta.y,
          { maxDist: 22 },
        );
        const toTarget = nearestHole(
          holeX(toParts.col) + delta.x,
          holeY(toParts.row) + delta.y,
          { maxDist: 22 },
        );
        setSandbox((prev) => {
          const next: SandboxState = {
            ...prev,
            wires: prev.wires.map((entry) =>
              entry.id === drag.id
                ? { ...entry, from: fromTarget ?? entry.from, to: toTarget ?? entry.to }
                : entry,
            ),
          };
          stateRef.current = next;
          return next;
        });
        return;
      }

      if (drag.kind === "component") {
        const target = nearestHole(point.x, point.y, { maxDist: 40 });
        if (target) {
          setSandbox((prev) => {
            const next: SandboxState = {
              ...prev,
              components: prev.components.map((component) =>
                component.id === drag.id
                  ? { ...component, hole: target }
                  : component,
              ),
            };
            stateRef.current = next;
            return next;
          });
        }
      } else {
        const component = stateRef.current.components.find(
          (entry) => entry.id === drag.id,
        );
        if (component?.chipId || component?.kind === "dip") {
          const pins = component.chipId
            ? CHIPS[component.chipId].packagePins
            : DIP_PACKAGE_PINS;
          const column = Math.max(
            1,
            Math.min(maxChipStart(pins), nearestColumn(point.x - 24)),
          );
          setSandbox((prev) => {
            const next: SandboxState = {
              ...prev,
              components: prev.components.map((entry) =>
                entry.id === drag.id ? { ...entry, startCol: column } : entry,
              ),
            };
            stateRef.current = next;
            return next;
          });
        }
      }
      return;
    }

    if (mode === "place" && pending) {
      const target = nearestHole(point.x, point.y, { maxDist: 34 });
      setHoverHole(target);
    }
  }

  function onPointerUp(event: React.PointerEvent) {
    if (draft) {
      const from = draft.from;
      const point = toBoard(event);
      const target = point
        ? nearestHole(point.x, point.y, { maxDist: 22 })
        : null;
      setDraft(null);
      setHoverHole(null);
      if (target && target !== from) addWire(from, target);
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;

    if (drag.moved) {
      if (drag.kind === "wire") {
        const current = stateRef.current;
        const wire = current.wires.find((entry) => entry.id === drag.id);
        const original = drag.startState.wires.find(
          (entry) => entry.id === drag.id,
        );
        if (wire && original) {
          const duplicate = current.wires.some(
            (entry) =>
              entry.id !== drag.id &&
              ((entry.from === wire.from && entry.to === wire.to) ||
                (entry.from === wire.to && entry.to === wire.from)),
          );
          if (wire.from === wire.to || duplicate) {
            const reverted: SandboxState = {
              ...current,
              wires: current.wires.map((entry) =>
                entry.id === drag.id
                  ? { ...entry, from: original.from, to: original.to }
                  : entry,
              ),
            };
            stateRef.current = reverted;
            setSandbox(reverted);
            if (duplicate) notify("THOSE HOLES ARE ALREADY CONNECTED");
          } else {
            pushPast(drag.startState);
            sounds.playSnap();
          }
        }
        return;
      }
      pushPast(drag.startState);
      sounds.playSnap();
      return;
    }

    if (drag.kind === "wire") return;

    if (drag.kind === "component") {
      const component = stateRef.current.components.find(
        (entry) => entry.id === drag.id,
      );
      if (component?.kind === "switch") toggleSwitch(drag.id);
      else setSelectedId(drag.id);
    } else {
      setSelectedId(drag.id);
    }
  }

  function placeAt(hole: string) {
    if (!pending) {
      notify("PICK A COMPONENT FROM THE LIBRARY FIRST");
      return;
    }
    const parts = splitHole(hole);
    if (!parts) return;

    if (pending.type === "chip") {
      const def = CHIPS[pending.chipId];
      const bottomCount = Math.ceil(def.packagePins / 2);
      const start = Math.max(
        1,
        Math.min(
          maxChipStart(def.packagePins),
          parts.col - Math.floor(bottomCount / 2),
        ),
      );
      const id = `c${idRef.current++}`;
      const component: SandboxComponent = {
        id,
        kind: "chip",
        chipId: pending.chipId,
        label: pending.chipId,
        startCol: start,
      };
      commit({
        ...stateRef.current,
        components: [...stateRef.current.components, component],
      });
      setSelectedId(id);
      sounds.playBtn();
      notify(
        `${pending.chipId} PLACED · VCC PIN ${def.vcc} / GND PIN ${def.gnd} · CLICK AGAIN FOR ANOTHER`,
      );
      return;
    }

    if (pending.kind === "dip") {
      const bottomCount = Math.ceil(DIP_PACKAGE_PINS / 2);
      const start = Math.max(
        1,
        Math.min(
          maxChipStart(DIP_PACKAGE_PINS),
          parts.col - Math.floor(bottomCount / 2),
        ),
      );
      const id = `c${idRef.current++}`;
      const component: SandboxComponent = {
        id,
        kind: "dip",
        label: "DIP",
        startCol: start,
        dipStates: [0, 0],
      };
      commit({
        ...stateRef.current,
        components: [...stateRef.current.components, component],
      });
      setSelectedId(id);
      sounds.playBtn();
      notify("DIP SWITCH PLACED · CLICK A PIN OR TOGGLE IN INSPECTOR");
      return;
    }

    if (pending.kind === "resistor" || pending.kind === "led") {
      if (!resistorStart) {
        setResistorStart(hole);
        notify(
          pending.kind === "led"
            ? "LED: CLICK THE SECOND HOLE"
            : "RESISTOR: CLICK THE SECOND HOLE",
        );
        sounds.playBtn();
        return;
      }
      if (resistorStart === hole) return;
      const id = `c${idRef.current++}`;
      const component: SandboxComponent = {
        id,
        kind: pending.kind,
        label: pending.kind === "led" ? "LED" : "R",
        hole: resistorStart,
        hole2: hole,
      };
      commit({
        ...stateRef.current,
        components: [...stateRef.current.components, component],
      });
      setResistorStart(null);
      setSelectedId(id);
      sounds.playBtn();
      notify(
        pending.kind === "led"
          ? "LED PLACED · CLICK AGAIN FOR ANOTHER"
          : "RESISTOR PLACED · CLICK AGAIN FOR ANOTHER",
      );
      return;
    }

    const occupied = stateRef.current.components.some(
      (component) =>
        component.kind !== "chip" &&
        (component.hole === hole || component.hole2 === hole),
    );
    if (occupied) {
      notify("THAT HOLE IS ALREADY OCCUPIED");
      return;
    }

    const id = `c${idRef.current++}`;
    const component: SandboxComponent = {
      id,
      kind: pending.kind,
      label: PART_LABEL[pending.kind],
      hole,
    };
    commit({
      ...stateRef.current,
      components: [...stateRef.current.components, component],
    });
    setSelectedId(id);
    sounds.playBtn();
    notify(`${PART_LABEL[pending.kind]} PLACED · CLICK AGAIN FOR ANOTHER`);
  }

  function pickChip(chipId: ChipId) {
    setPending({ type: "chip", chipId });
    setMode("place");
    setResistorStart(null);
    sounds.playBtn();
    notify(`PLACING ${chipId} · CLICK THE BREADBOARD`);
  }

  function pickPart(kind: PartKind) {
    setPending({ type: "part", kind });
    setMode("place");
    setResistorStart(null);
    sounds.playBtn();
    notify(`PLACING ${PART_LABEL[kind]} · CLICK A HOLE`);
  }

  function chooseMode(next: SandboxMode) {
    setMode(next);
    setDraft(null);
    if (next !== "place") {
      setPending(null);
      setResistorStart(null);
      setHoverHole(null);
    }
    sounds.playBtn();
  }

  function resetDemo() {
    commit(clone(DEMO));
    setSelectedId("chip1");
    setMode("select");
    setPending(null);
    setDraft(null);
    setResistorStart(null);
    setHoverHole(null);
    sounds.playBtn();
    notify("DEMO RESTORED · 7408 AND GATE");
  }

  function clearAll() {
    commit({ components: [], wires: [] });
    setSelectedId(null);
    setPending(null);
    setResistorStart(null);
    setDraft(null);
    sounds.playBtn();
    notify("WORKSPACE CLEARED");
  }

  function toggleFullscreen() {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const parts = sandbox.components.filter(
    (component) => component.kind !== "chip" && component.kind !== "dip",
  );
  const chips = sandbox.components.filter(
    (component) => component.kind === "chip",
  );
  const dips = sandbox.components.filter(
    (component) => component.kind === "dip",
  );
  const selected = sandbox.components.find(
    (component) => component.id === selectedId,
  );
  const poweredCount = Object.values(sim.chips).filter(
    (reading) => reading.powered,
  ).length;
  const ledOnCount = Object.values(sim.ledOn).filter(Boolean).length;
  const ghostChip: GhostChip =
    pending?.type === "chip"
      ? { label: pending.chipId, pins: CHIPS[pending.chipId].packagePins }
      : pending?.type === "part" && pending.kind === "dip"
        ? { label: "DIP", pins: DIP_PACKAGE_PINS }
        : null;
  const pendingLabel =
    pending?.type === "chip"
      ? pending.chipId
      : pending?.type === "part"
        ? PART_LABEL[pending.kind]
        : null;

  function handleRemoveSelected() {
    if (selected) deleteComponent(selected.id);
  }

  function handleToggleSelectedSwitch() {
    if (selected && selected.kind === "switch") toggleSwitch(selected.id);
  }

  function handleToggleSelectedDip(index: 0 | 1) {
    if (selected && selected.kind === "dip") toggleDip(selected.id, index);
  }

  return (
    <ScreenFrame title="NODEX — BREADBOARD SANDBOX">
      <div className="sandbox-toolbar">
        {(["select", "place", "wire", "delete"] as SandboxMode[]).map(
          (entry) => (
            <button
              key={entry}
              type="button"
              className="wf-btn"
              aria-pressed={mode === entry}
              onClick={() => {
                if (entry === "place" && !pending) {
                  setMode("place");
                  notify("PICK A COMPONENT FROM THE LIBRARY");
                  return;
                }
                chooseMode(entry);
              }}
            >
              {entry.toUpperCase()}
            </button>
          ),
        )}
        <span className="sandbox-toolbar-gap" />
        <button type="button" className="wf-btn" onClick={undo} disabled={past.length === 0}>
          ↶ UNDO
        </button>
        <button type="button" className="wf-btn" onClick={redo} disabled={future.length === 0}>
          ↷ REDO
        </button>
        <button type="button" className="wf-btn" onClick={resetDemo}>
          RESET DEMO
        </button>
        <button type="button" className="wf-btn wf-btn-red" onClick={clearAll}>
          CLEAR
        </button>
        <button type="button" className="wf-btn" onClick={toggleFullscreen}>
          {isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
        </button>
        <span className="sandbox-toolbar-gap" />
        <button
          type="button"
          className="wf-btn"
          onClick={() => setZoom((value) => Math.max(0.7, Math.round((value - 0.1) * 10) / 10))}
        >
          −
        </button>
        <span className="sandbox-zoom">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className="wf-btn"
          onClick={() => setZoom((value) => Math.min(1.8, Math.round((value + 0.1) * 10) / 10))}
        >
          +
        </button>
      </div>

      <div className={`sandbox-layout ${isFullscreen ? "sandbox-layout-fullscreen" : ""}`}>
        <aside className={`sandbox-panel ${isFullscreen ? "sandbox-panel-hidden" : ""}`}>
          <h3>COMPONENT LIBRARY</h3>
          <div className="sandbox-group-label">Logic ICs</div>
          {CHIP_ORDER.map((chipId) => {
            const def = CHIPS[chipId];
            return (
              <button
                key={chipId}
                type="button"
                className="sandbox-lib-item"
                aria-pressed={
                  pending?.type === "chip" && pending.chipId === chipId
                }
                onClick={() => pickChip(chipId)}
              >
                <span>{chipId}</span>
                <small>{def.short}</small>
              </button>
            );
          })}
          <div className="sandbox-group-label">Inputs / Outputs</div>
          {PART_ORDER.map((kind) => (
            <button
              key={kind}
              type="button"
              className="sandbox-lib-item"
              aria-pressed={pending?.type === "part" && pending.kind === kind}
              onClick={() => pickPart(kind)}
            >
              <span>{PART_LABEL[kind]}</span>
              <small>
                {kind === "switch"
                  ? "toggle"
                  : kind === "dip"
                    ? "4-pin · 2 pos"
                    : kind === "led"
                      ? "2 holes"
                      : kind === "resistor"
                        ? "2 holes"
                        : "source"}
              </small>
            </button>
          ))}
          <h4>SIGNAL MONITOR</h4>
          <div className="sandbox-monitor">
            <span>PARTS {sandbox.components.length}</span>
            <span>WIRES {sandbox.wires.length}</span>
            <span>POWERED {poweredCount}</span>
            <span>LED ON {ledOnCount}</span>
          </div>
          <p className="sandbox-detail-empty">
            Demo: a 7408 AND gate. Toggle switch <b>B</b> to light the LED.
          </p>
        </aside>

        <div className="sandbox-board-wrap">
          <div
            className={`sandbox-board-scroll ${isFullscreen ? "sandbox-board-scroll-fullscreen" : ""}`}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            <Breadboard
              svgRef={svgRef}
              wires={sandbox.wires}
              parts={parts}
              sim={sim}
              mode={mode}
              hoverHole={hoverHole}
              selectedId={selectedId}
              draft={draft}
              ghostChip={ghostChip}
              onHolePointerDown={onHolePointerDown}
              onHoleEnter={setHoverHole}
              onHoleLeave={() => setHoverHole(null)}
              onPartPointerDown={onPartPointerDown}
              onWirePointerDown={onWirePointerDown}
              onBackgroundPointerDown={onBackgroundPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {chips.map((component) => (
                <ChipOnBoard
                  key={component.id}
                  component={component}
                  reading={sim.chips[component.id]}
                  selected={selectedId === component.id}
                  hoverPin={hoverPin}
                  onBodyPointerDown={onChipPointerDown}
                  onPinPointerDown={onPinPointerDown}
                  onPinEnter={(id, pin) =>
                    setHoverPin({ componentId: id, pin })
                  }
                  onPinLeave={() => setHoverPin(null)}
                />
              ))}
              {dips.map((component) => (
                <DipSwitchOnBoard
                  key={component.id}
                  component={component}
                  sim={sim}
                  selected={selectedId === component.id}
                  onBodyPointerDown={onChipPointerDown}
                  onToggle={(id, index) => toggleDip(id, index)}
                  onPinPointerDown={onPinPointerDown}
                  onPinEnter={(id, pin) =>
                    setHoverPin({ componentId: id, pin })
                  }
                  onPinLeave={() => setHoverPin(null)}
                />
              ))}
            </Breadboard>
          </div>
          <div className="sandbox-board-hint">
            {mode === "place"
              ? `PLACE MODE${pendingLabel ? ` · ${pendingLabel}` : ""} · click a hole to drop it`
              : mode === "delete"
                ? "DELETE MODE · click a wire or part to remove it"
                : mode === "wire"
                  ? "WIRE MODE · drag hole → hole (chips: drag from a pin)"
                  : "SELECT MODE · drag parts · click a switch to toggle · drag hole → hole to wire"}
          </div>
        </div>

        <aside className={`sandbox-panel ${isFullscreen ? "sandbox-panel-hidden" : ""}`}>
          <h3>INSPECTOR</h3>
          {!selected && (
            <div className="sandbox-detail-empty">
              <b>FREE EXPERIMENT GUIDE</b>
              <p>1. Pick a logic IC from the library and click the board.</p>
              <p>
                2. Wire the chip&apos;s VCC pin to a 5V source and its GND pin
                to ground.
              </p>
              <p>3. Add a switch for each input, then wire switch → input pin.</p>
              <p>4. Wire an output pin to an LED to see the result.</p>
              <p>
                A chip only evaluates when VCC is HIGH and GND is LOW. The
                inspector shows live pin values.
              </p>
              <p>Select any part to inspect it.</p>
            </div>
          )}

          {selected && selected.kind === "dip" && (() => {
            const reading = sim.dips[selected.id];
            return (
              <div className="sandbox-detail">
                <h4>{PART_LABEL.dip}</h4>
                <p className="sandbox-detail-empty">
                  Passive bridge · Switch 1 joins pins 1 &amp; 4, Switch 2 joins
                  pins 2 &amp; 3. Wire to a source or ground to use it.
                </p>
                <div
                  className={
                    selected.dipStates?.[0] === 1
                      ? "sandbox-powered"
                      : "sandbox-unpowered"
                  }
                >
                  SW1 {selected.dipStates?.[0] === 1 ? "ON" : "OFF"}
                </div>
                <button
                  type="button"
                  className="wf-btn wf-btn-green"
                  onClick={() => handleToggleSelectedDip(0)}
                >
                  TOGGLE SW1
                </button>
                <div
                  className={
                    selected.dipStates?.[1] === 1
                      ? "sandbox-powered"
                      : "sandbox-unpowered"
                  }
                >
                  SW2 {selected.dipStates?.[1] === 1 ? "ON" : "OFF"}
                </div>
                <button
                  type="button"
                  className="wf-btn wf-btn-green"
                  onClick={() => handleToggleSelectedDip(1)}
                >
                  TOGGLE SW2
                </button>
                <table className="wf-table sandbox-pin-table">
                  <thead>
                    <tr>
                      <th>PIN</th>
                      <th>LABEL</th>
                      <th>ROLE</th>
                      <th>VAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 4, 2, 3].map((pin) => {
                      const pinReading = reading?.pins[pin];
                      return (
                        <tr key={pin}>
                          <td>{pin}</td>
                          <td>{pinReading?.label ?? "—"}</td>
                          <td>{pinReading?.role ?? "passive"}</td>
                          <td className="wf-table-out">
                            {pinReading?.value ?? 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="wf-btn wf-btn-red"
                  onClick={handleRemoveSelected}
                >
                  REMOVE DIP SWITCH
                </button>
              </div>
            );
          })()}

          {selected && selected.kind === "chip" && selected.chipId && (() => {
            const def = CHIPS[selected.chipId];
            const reading = sim.chips[selected.id];
            return (
              <div className="sandbox-detail">
                <h4>
                  {def.id} — {def.name}
                </h4>
                <p className="sandbox-detail-empty">{def.description}</p>
                <div
                  className={
                    reading?.powered ? "sandbox-powered" : "sandbox-unpowered"
                  }
                >
                  {reading?.powered
                    ? "POWERED — logic active"
                    : `NOT POWERED — tie VCC (pin ${def.vcc}) to 5V and GND (pin ${def.gnd}) to ground`}
                </div>
                <table className="wf-table sandbox-pin-table">
                  <thead>
                    <tr>
                      <th>PIN</th>
                      <th>LABEL</th>
                      <th>ROLE</th>
                      <th>VAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {def.pins.map((pin) => {
                      const value = reading?.pins[pin.pin];
                      const active =
                        hoverPin?.componentId === selected.id &&
                        hoverPin.pin === pin.pin;
                      const classes = [
                        `is-${pin.role}`,
                        active ? "is-hover" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <tr
                          key={pin.pin}
                          className={classes}
                          onMouseEnter={() =>
                            setHoverPin({
                              componentId: selected.id,
                              pin: pin.pin,
                            })
                          }
                          onMouseLeave={() => setHoverPin(null)}
                        >
                          <td>{pin.pin}</td>
                          <td>{pin.label}</td>
                          <td>{pin.role}</td>
                          <td className="wf-table-out">
                            {value?.value ?? 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <h4>GATE SECTIONS</h4>
                {def.gates.map((gate) => {
                  const inputs = gate.inputs
                    .map(
                      (pinNumber) =>
                        def.pins.find((pin) => pin.pin === pinNumber)?.label ??
                        String(pinNumber),
                    )
                    .join(" · ");
                  const outputLabel =
                    def.pins.find((pin) => pin.pin === gate.output)?.label ??
                    String(gate.output);
                  const outputValue =
                    reading?.pins[gate.output]?.value ?? 0;
                  return (
                    <div key={gate.index} className="sandbox-gate-row">
                      <span>
                        {gate.label} · {inputs}
                      </span>
                      <b>
                        {outputLabel}={outputValue}
                      </b>
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="wf-btn wf-btn-red"
                  onClick={handleRemoveSelected}
                >
                  REMOVE CHIP
                </button>
              </div>
            );
          })()}

          {selected && selected.kind !== "chip" && selected.kind !== "dip" && (() => {
            const net = sim.componentNets[selected.id];
            const value = net ? (sim.netValues[net] ?? 0) : 0;
            return (
              <div className="sandbox-detail">
                <h4>{PART_LABEL[selected.kind as PartKind]}</h4>
                <p className="sandbox-detail-empty">
                  HOLE {selected.hole ?? "—"}
                  {selected.hole2 ? ` → ${selected.hole2}` : ""}
                  <br />
                  NET {net ?? "floating"} · VALUE {value}
                </p>
                {selected.kind === "switch" && (
                  <>
                    <div className={selected.state === 1 ? "sandbox-powered" : "sandbox-unpowered"}>
                      SWITCH STATE {selected.state === 1 ? "1 (HIGH)" : "0 (LOW)"}
                    </div>
                    <button
                      type="button"
                      className="wf-btn wf-btn-green"
                      onClick={handleToggleSelectedSwitch}
                    >
                      TOGGLE TO {selected.state === 1 ? 0 : 1}
                    </button>
                  </>
                )}
                {selected.kind === "led" && (
                  <div className={sim.ledOn[selected.id] ? "sandbox-powered" : "sandbox-unpowered"}>
                    LED {sim.ledOn[selected.id] ? "ON" : "OFF"}
                  </div>
                )}
                {(selected.kind === "power" ||
                  selected.kind === "ground" ||
                  selected.kind === "high" ||
                  selected.kind === "low") && (
                  <div className="sandbox-powered">DRIVES VALUE {value}</div>
                )}
                <button
                  type="button"
                  className="wf-btn wf-btn-red"
                  onClick={handleRemoveSelected}
                >
                  REMOVE PART
                </button>
              </div>
            );
          })()}

          <h4>PIN COLOUR KEY</h4>
          <div className="sandbox-key">
            <span style={{ color: "#c0392b" }}>■ POWER</span>
            <span style={{ color: "#111111" }}>■ GROUND</span>
            <span style={{ color: "#1414d2" }}>■ INPUT</span>
            <span style={{ color: "#1d7a35" }}>■ OUTPUT</span>
          </div>

          <div className="sandbox-links">
            <Link href="/lab" className="wf-btn">
              GUIDED GATE LAB
            </Link>
            <Link href="/menu" className="wf-btn">
              BACK TO MENU
            </Link>
          </div>
        </aside>
      </div>

      {toast && <div className="wf-toast">{toast}</div>}
    </ScreenFrame>
  );
}
