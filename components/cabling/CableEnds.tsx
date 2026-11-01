import WireSwatch from "@/components/cabling/WireSwatch";
import { FAR_END, T568B, WIRES, type CableMode } from "@/lib/data/cabling";

function End({ label, order }: { label: string; order: number[] }) {
  return (
    <div className="flex min-w-[11rem] flex-col gap-1 border-[3px] border-[#3b3452] bg-[#f4eedf] p-2">
      <span className="text-center text-xs font-black tracking-widest">{label}</span>
      {order.map((wireIndex, pin) => (
        <div key={pin} className="flex items-center gap-2 text-[0.7rem]">
          <span className="w-4 text-right font-black">{pin + 1}</span>
          <WireSwatch index={wireIndex} />
          <span>{WIRES[wireIndex].name}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Both ends of a cable, pin by pin, so the player can tell the cable type from
 * its wiring. The labels deliberately don't name the standard on either end.
 */
export default function CableEnds({ mode }: { mode: CableMode }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-[3px] border-[#3b3452] bg-white p-3">
      <End label="END A" order={T568B} />
      <span className="text-2xl font-black" aria-hidden>⟷</span>
      <End label="END B" order={FAR_END[mode]} />
    </div>
  );
}
