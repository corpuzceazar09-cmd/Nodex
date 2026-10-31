import type { Gate } from "@/lib/data/gates";
import { ui } from "@/lib/uiStyles";

/** Static reference truth table (literal data — never computed). */
export default function TruthTable({ gate }: { gate: Gate }) {
  const labels =
    gate.inputs === 1 ? ["A"] : ["A", "B"];
  return (
    <table className={ui.table}>
      <thead>
        <tr>
          {labels.map((l) => (
            <th key={l}>{l}</th>
          ))}
          <th className={ui.tableOutputHeader} data-output>OUT</th>
        </tr>
      </thead>
      <tbody>
        {gate.table.map((row, i) => (
          <tr key={i}>
            {row.inputs.map((v, j) => (
              <td key={j}>{v}</td>
            ))}
            <td className={ui.tableOutput} data-output>{row.out}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}