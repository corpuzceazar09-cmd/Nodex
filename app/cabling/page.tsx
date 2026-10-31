"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import ScreenFrame from "@/components/ScreenFrame";
import { sounds } from "@/lib/sound";
import { ui } from "@/lib/uiStyles";

type Mode = "straight" | "crossover" | "rollover";
type Wire = { name: string; color: string; striped: boolean };
type Connection = { from: number; to: number };
type Point = { x: number; y: number };

const WIRES: Wire[] = [
  { name: "WHITE / ORANGE", color: "#ed891b", striped: true },
  { name: "ORANGE", color: "#ed891b", striped: false },
  { name: "WHITE / GREEN", color: "#39a94d", striped: true },
  { name: "BLUE", color: "#4375b8", striped: false },
  { name: "WHITE / BLUE", color: "#4375b8", striped: true },
  { name: "GREEN", color: "#39a94d", striped: false },
  { name: "WHITE / BROWN", color: "#74504b", striped: true },
  { name: "BROWN", color: "#74504b", striped: false },
];
const MAPS: Record<Mode, number[]> = {
  straight: [1, 2, 3, 4, 5, 6, 7, 8],
  crossover: [3, 6, 1, 4, 5, 2, 7, 8],
  rollover: [8, 7, 6, 5, 4, 3, 2, 1],
};
const LABELS: Record<Mode, string> = {
  straight: "STRAIGHT-THROUGH (T568B TO T568B)",
  crossover: "CROSSOVER (T568B TO T568A)",
  rollover: "ROLLOVER (REVERSED)",
};
const START_X = 112;
const END_X = 708;
const TOP_Y = 60;
const STEP_Y = 43;
const yFor = (pin: number) => TOP_Y + (pin - 1) * STEP_Y;
const pointInSvg = (svg: SVGSVGElement, x: number, y: number): Point | null => {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const pt = new DOMPoint(x, y).matrixTransform(matrix.inverse());
  return { x: pt.x, y: pt.y };
};
const pathFor = (from: Point, to: Point) => {
  const bend = Math.max(65, Math.abs(to.x - from.x) * 0.4);
  return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`;
};

export default function CablingPage() {
  const [mode, setMode] = useState<Mode>("straight");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [drag, setDrag] = useState<{ from: number; cursor: Point } | null>(null);
  const [hoverPin, setHoverPin] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const correct = connections.filter((c) => MAPS[mode][c.from - 1] === c.to).length;
  const complete = connections.length === 8 && correct === 8 && checked;
  const occupied = (pin: number) => connections.some((c) => c.to === pin);
  const connected = (pin: number) => connections.some((c) => c.from === pin);

  function reset() {
    setConnections([]);
    setDrag(null);
    setHoverPin(null);
    setChecked(false);
    setHint(null);
  }
  function selectMode(next: Mode) {
    setMode(next);
    reset();
  }
  function beginDrag(event: PointerEvent<SVGCircleElement>, pin: number) {
    if (!svgRef.current) return;
    const cursor = pointInSvg(svgRef.current, event.clientX, event.clientY);
    if (!cursor) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setChecked(false);
    setHint(null);
    // Allow reconnection: pick up an existing wire and drop it elsewhere.
    setConnections((prev) => prev.filter((c) => c.from !== pin));
    setDrag({ from: pin, cursor });
    sounds.playBtn();
  }
  function moveDrag(event: PointerEvent<SVGCircleElement>) {
    if (!drag || !svgRef.current) return;
    const cursor = pointInSvg(svgRef.current, event.clientX, event.clientY);
    if (!cursor) return;
    setDrag((prev) => prev ? { ...prev, cursor } : null);
    const near = Math.round((cursor.y - TOP_Y) / STEP_Y) + 1;
    setHoverPin(cursor.x >= END_X - 50 && near >= 1 && near <= 8 &&
      Math.abs(cursor.y - yFor(near)) <= 20 && !occupied(near) ? near : null);
  }
  function endDrag(event: PointerEvent<SVGCircleElement>) {
    if (!drag || !svgRef.current) return;
    const cursor = pointInSvg(svgRef.current, event.clientX, event.clientY);
    if (cursor) {
      const pin = Math.round((cursor.y - TOP_Y) / STEP_Y) + 1;
      if (cursor.x >= END_X - 50 && pin >= 1 && pin <= 8 &&
          Math.abs(cursor.y - yFor(pin)) <= 20 && !occupied(pin)) {
        setConnections((prev) => [...prev, { from: drag.from, to: pin }]);
        sounds.playSnap();
      }
    }
    setDrag(null);
    setHoverPin(null);
  }
  function checkWiring() {
    setChecked(true);
    setHint(null);
    if (connections.length === 8 && correct === 8) {
      sounds.playFanfare();
    } else {
      sounds.playIncorrect();
    }
  }
  function showHint() {
    const next = WIRES.findIndex((_, i) => !connections.some((c) => c.from === i + 1 && c.to === MAPS[mode][i]));
    if (next < 0) { setHint("All wires are connected correctly!"); return; }
    const source = next + 1;
    setHint(`${WIRES[next].name}: connect left pin ${source} to right pin ${MAPS[mode][next]}. You can undo the last connection if that pin is occupied.`);
  }
  return (
    <div className={ui.page}>
      <ScreenFrame title="NODEX — RJ45 CABLING CHALLENGE">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black tracking-wider">ETHERNET WIRING LAB</h1>
            <p className="text-xs">Drag each colored wire from the left connector to a pin on the right.</p>
          </div>
          <Link href="/menu" className={`${ui.button} text-xs`}>BACK TO MENU</Link>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Choose cable wiring mode">
          {(["straight", "crossover", "rollover"] as Mode[]).map((item) => (
            <button key={item} type="button" className={`${ui.button} text-xs ${mode === item ? ui.buttonPrimary : ""}`} onClick={() => selectMode(item)} aria-pressed={mode === item}>
              {item === "straight" ? "STRAIGHT-THROUGH" : item.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="min-w-0 overflow-x-auto border-[3px] border-black bg-white p-2 sm:p-4">
          <div className="mb-2 text-center text-sm font-black">{LABELS[mode]}</div>
          <svg ref={svgRef} viewBox="0 0 820 420" className="w-full min-w-[700px] select-none" role="group" aria-label={`Interactive ${mode} wiring diagram. Drag colored wire endpoints from left to right.`} style={{ touchAction: "none" }}>
            <defs>
              {WIRES.filter((w) => w.striped).map((w, i) => (
                <pattern key={w.name} id={`cable-stripe-${i}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="14" height="14" fill="white" />
                  <rect width="5" height="14" fill={w.color} />
                </pattern>
              ))}
            </defs>
            <rect x="36" y="36" width="76" height="326" rx="5" fill="#d9d9d9" stroke="#111" strokeWidth="3" />
            <rect x="708" y="36" width="76" height="326" rx="5" fill="#d9d9d9" stroke="#111" strokeWidth="3" />
            {WIRES.map((wire, i) => {
              const pin = i + 1;
              const match = connections.find((c) => c.from === pin);
              const paint = wire.striped ? `url(#cable-stripe-${[0,2,4,6].indexOf(i)})` : wire.color;
              const state = !checked || !match ? null : MAPS[mode][i] === match.to;
              return (
                <g key={pin}>
                  <text x="22" y={yFor(pin) + 5} fontSize="15" textAnchor="middle" fill="#111" fontWeight="bold">{pin}</text>
                  <rect x="53" y={yFor(pin)-7} width="59" height="14" fill={paint} stroke="#222" strokeWidth="1" />
                  {match && <path d={pathFor({ x: START_X, y: yFor(pin) }, { x: END_X, y: yFor(match.to) })} fill="none" stroke={state === null ? "#292929" : state ? "#228444" : "#d12121"} strokeWidth="12" strokeLinecap="round" opacity=".25" />}
                  {match && <path d={pathFor({ x: START_X, y: yFor(pin) }, { x: END_X, y: yFor(match.to) })} fill="none" stroke={paint} strokeWidth="8" strokeLinecap="round" />}
                  <circle cx={START_X} cy={yFor(pin)} r="13" fill={connected(pin) ? "#d9d9d9" : "#fff"} stroke="#111" strokeWidth="2" onPointerDown={(e) => beginDrag(e, pin)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => {setDrag(null);setHoverPin(null);}} style={{cursor: "grab",touchAction:"none"}} />
                  <circle cx={START_X} cy={yFor(pin)} r="5" fill={wire.color} pointerEvents="none" />
                </g>
              );
            })}
            {WIRES.map((_, i) => {
              const pin = i+1;
              const used = occupied(pin);
              return <g key={`end-${pin}`}>
                <circle cx={END_X} cy={yFor(pin)} r={hoverPin === pin ? 15 : 11} fill={hoverPin === pin ? "#6fd97f" : used ? "#bcbcbc" : "white"} stroke="#111" strokeWidth="2" />
                <text x="798" y={yFor(pin)+5} fill="#111" fontWeight="bold" fontSize="15" textAnchor="middle">{pin}</text>
              </g>;
            })}
            {drag && <path d={pathFor({x:START_X,y:yFor(drag.from)},drag.cursor)} fill="none" stroke={WIRES[drag.from-1].striped ? `url(#cable-stripe-${[0,2,4,6].indexOf(drag.from-1)})` : WIRES[drag.from-1].color} strokeWidth="8" strokeLinecap="round" pointerEvents="none" />}
            <text x="75" y="390" textAnchor="middle" fill="#111" fontSize="14" fontWeight="bold">T568B</text>
            <text x="747" y="390" textAnchor="middle" fill="#111" fontSize="14" fontWeight="bold">{mode === "crossover" ? "T568A" : mode === "straight" ? "T568B" : "REVERSED"}</text>
          </svg>
          <p className="text-center text-xs text-gray-700">Tip: Drop a wire near a numbered right-side pin. Wires can cross each other.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
          <span>CONNECTED: {connections.length} / 8</span>
          {checked && <span aria-live="polite">CORRECT: {correct} / 8</span>}
        </div>
        <div className="h-3 border border-black bg-white" aria-label={`${connections.length} of 8 wires connected`}>
          <div className="h-full bg-[#1414d2]" style={{width:`${connections.length/8*100}%`}} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={checkWiring}>CHECK WIRING</button>
          <button type="button" className={ui.button} onClick={() => {setConnections((prev)=>prev.slice(0,-1));setChecked(false);setHint(null);sounds.playBtn();}} disabled={connections.length === 0}>UNDO LAST</button>
          <button type="button" className={ui.button} onClick={showHint}>HINT</button>
          <button type="button" className={ui.button} onClick={() => { reset(); sounds.playBtn(); }}>RESET</button>
        </div>
        <div aria-live="polite" className="border-[2px] border-black bg-white p-3 text-sm font-bold">
          {complete ? "PERFECT! All 8 pins are wired correctly. Choose another mode to continue practicing." :
            hint ?? (checked ? (connections.length < 8 ? "Connect all 8 wires before checking the finished cable." : `${correct} out of 8 correct. Use UNDO LAST or RESET to adjust your wiring.`) : "Connect the wires, then press CHECK WIRING to test your cable.")}
        </div>
      </ScreenFrame>
    </div>
  );
}
