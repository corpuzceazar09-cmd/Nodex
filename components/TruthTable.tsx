import type { Gate } from "@/lib/data/gates";

/** Static reference truth table (literal data — never computed). */
export default function TruthTable({ gate }: { gate: Gate }) {
  const labels =
    gate.inputs === 1 ? ["A"] : ["A", "B"];
  return (
    <table className="wf-table">
      <thead>
        <tr>
          {labels.map((l) => (
            <th key={l}>{l}</th>
          ))}
          <th className="wf-table-out">OUT</th>
        </tr>
      </thead>
      <tbody>
        {gate.table.map((row, i) => (
          <tr key={i}>
            {row.inputs.map((v, j) => (
              <td key={j}>{v}</td>
            ))}
            <td className="wf-table-out">{row.out}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}