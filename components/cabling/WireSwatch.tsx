import { WIRES } from "@/lib/data/cabling";

/** A small colour chip for one UTP wire; striped wires show white stripes. */
export default function WireSwatch({ index, className = "h-4 w-10" }: { index: number; className?: string }) {
  const wire = WIRES[index];
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 border-2 border-[#3b3452] ${className}`}
      style={{
        background: wire.striped
          ? `repeating-linear-gradient(135deg, ${wire.color} 0 5px, #ffffff 5px 10px)`
          : wire.color,
      }}
    />
  );
}
