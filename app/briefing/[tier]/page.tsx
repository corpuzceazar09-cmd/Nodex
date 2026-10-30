import Link from "next/link";
import { redirect } from "next/navigation";
import ScreenFrame from "@/components/ScreenFrame";
import GateSymbol from "@/components/GateSymbol";
import TruthTable from "@/components/TruthTable";
import IcChip from "@/components/IcChip";
import { GATES } from "@/lib/data/gates";
import { TIERS, isTierId } from "@/lib/data/tiers";

export default async function BriefingPage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = await params;
  if (!isTierId(tier)) redirect("/difficulty");
  const t = TIERS[tier];

  return (
    <div className="wf-page">
      <ScreenFrame title={`DESCRIPTIONS OF BASIC GATES — ${t.name}`}>
        <p className="wf-hint text-center">
          {t.levelLabel} · These are the gates featured on your level path.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.gateIds.map((id) => {
            const gate = GATES[id];
            return (
              <div
                key={id}
                className="flex flex-col gap-2 border-[3px] border-black bg-white p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-black">{gate.name}</span>
                  <span className="wf-chip text-[10px]">
                    {gate.expression}
                  </span>
                </div>
                <GateSymbol gate={gate.id} className="h-16 w-28 self-center" />
                <p className="text-xs leading-snug">{gate.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <TruthTable gate={gate} />
                  <IcChip
                    label={gate.ic.split("—")[0].trim()}
                    className="h-14 w-24 shrink-0"
                  />
                </div>
                <p className="wf-hint">{gate.ic}</p>
                <Link
                  href={`/lab?gate=${gate.id}`}
                  className="wf-btn self-start text-[10px]"
                >
                  PRACTICE IN THE LAB ▶
                </Link>
              </div>
            );
          })}

          {t.topics.map((topic) => (
            <div
              key={topic.title}
              className="flex flex-col gap-2 border-[3px] border-dashed border-black bg-white p-3"
            >
              <span className="text-lg font-black">{topic.title}</span>
              <p className="text-xs leading-snug">{topic.body}</p>
              <span className="wf-chip mt-auto self-start text-[10px]">
                COVERED ON THIS PATH
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <Link href="/difficulty" className="wf-btn text-xs">
            ◀ CHANGE DIFFICULTY
          </Link>
          <Link href={`/map/${tier}`} className="wf-btn wf-btn-primary">
            BEGIN LEVEL PATH ▶
          </Link>
        </div>
      </ScreenFrame>
    </div>
  );
}