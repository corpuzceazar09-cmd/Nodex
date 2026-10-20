import Link from "next/link";
import ScreenFrame from "@/components/ScreenFrame";

export default function LandingPage() {
  return (
    <div className="wf-page">
      <div className="text-center text-white">
        <h1 className="text-4xl sm:text-5xl font-black tracking-widest">
          Nodex
        </h1>
        <p className="mt-1 text-xs opacity-75">
          LOGIC GATE ADVENTURE — WIREFRAME BUILD
        </p>
      </div>

      <ScreenFrame>
        {/* pixel-ish lab scene, built from plain boxes (wireframe level) */}
        <div className="wf-scene">
          <div
            className="absolute left-6 top-8 h-20 w-32 border-4 border-black bg-[#555]"
            aria-hidden
          >
            <div className="m-2 flex h-12 items-center justify-center border-2 border-black bg-[#222] font-bold text-[#6fd97f]">
              0 1 0 1
            </div>
          </div>
          <div
            className="absolute right-28 top-12 h-14 w-20 border-4 border-black bg-[#6a6a6a] text-center text-xs font-bold leading-[3rem]"
            aria-hidden
          >
            IC
          </div>
          <div
            className="absolute right-12 top-8 h-24 w-5 border-4 border-black bg-[#ff5f5f]"
            aria-hidden
          />
          <div
            className="absolute bottom-16 left-10 h-10 w-16 border-4 border-black bg-[#8a8a8a]"
            aria-hidden
          />
          <div
            className="absolute bottom-16 right-24 h-10 w-24 border-4 border-black bg-[#8a8a8a]"
            aria-hidden
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-12 border-t-4 border-black bg-[#4a4a4a]"
            aria-hidden
          />
          <div className="absolute bottom-1 left-2 text-[10px] text-white/60">
            © NODEX — DIGITAL LOGIC ACADEMY
          </div>
        </div>

        <Link href="/intro" className="wf-btn wf-btn-primary wf-blink mt-1">
          ▶ PRESS START
        </Link>
        <p className="wf-hint text-center">
          Master BUFFER, AND, OR, NOT, NAND, NOR, XOR and XNOR — earn XP, keep
          your streak, become a Nodex.
        </p>
      </ScreenFrame>
    </div>
  );
}