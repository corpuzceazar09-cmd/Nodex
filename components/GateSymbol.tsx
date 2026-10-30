import type { GateId } from "@/lib/data/gates";

const FILL = "#d4d4d4";
const STROKE = "#111111";

/**
 * Wireframe-level SVG symbols for the logic gates (basic shapes only —
 * Phase 6 will replace these with the real visual design).
 */
export default function GateSymbol({
  gate,
  className = "",
}: {
  gate: GateId | "buffer";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 104 72"
      className={className}
      role="img"
      aria-label={`${gate.toUpperCase()} symbol`}
    >
      <g
        fill={FILL}
        stroke={STROKE}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* input stubs for two-input symbols */}
        {(gate === "and" ||
          gate === "or" ||
          gate === "xor" ||
          gate === "nand" ||
          gate === "nor" ||
          gate === "xnor") && (
          <>
            <line x1={0} y1={24} x2={14} y2={24} />
            <line x1={0} y1={48} x2={14} y2={48} />
          </>
        )}
        {gate === "not" && <line x1={0} y1={36} x2={14} y2={36} />}
        {gate === "buffer" && (
          <>
            <line x1={0} y1={36} x2={16} y2={36} />
            <rect x={16} y={14} width={44} height={44} />
            <line x1={60} y1={36} x2={96} y2={36} />
          </>
        )}
        {gate === "and" && (
          <path d="M14,8 H48 A28,28 0 0 1 48,64 H14 Z" />
        )}
        {gate === "nand" && (
          <>
            <path d="M14,8 H48 A28,28 0 0 1 48,64 H14 Z" />
            <circle cx={82} cy={36} r={7} />
            <line x1={89} y1={36} x2={100} y2={36} />
          </>
        )}
        {(gate === "or" || gate === "xor" || gate === "nor" || gate === "xnor") && (
          <path d="M14,8 Q44,8 88,36 Q44,64 14,64 Q30,36 14,8 Z" />
        )}
        {(gate === "xor" || gate === "xnor") && (
          <path d="M4,8 Q20,36 4,64" fill="none" />
        )}
        {(gate === "nor" || gate === "xnor") && (
          <>
            <circle cx={94} cy={36} r={6} />
            <line x1={100} y1={36} x2={104} y2={36} />
          </>
        )}
        {(gate === "or" || gate === "xor") && (
          <line x1={88} y1={36} x2={104} y2={36} />
        )}
        {gate === "not" && (
          <>
            <path d="M14,8 L64,36 L14,64 Z" />
            <circle cx={71} cy={36} r={7} />
            <line x1={78} y1={36} x2={96} y2={36} />
          </>
        )}
      </g>
    </svg>
  );
}