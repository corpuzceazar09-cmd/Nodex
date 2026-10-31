import type { ReactNode } from "react";

/**
 * The shared wireframe "screen": white outer card, thick blue frame,
 * optional red title bar — mirrors the frames in the wireframe document.
 */
export default function ScreenFrame({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex h-full min-h-0 w-full min-w-0 max-w-[min(84vw,1750px)] flex-1 border-[5px] border-[#3b3452] bg-[#fdf9ef] p-[8px] shadow-[8px_8px_0_#2a2540] max-[640px]:max-w-full max-[480px]:p-1.5 ${className}`}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col border-4 border-[#6c5ccf] bg-[#f4eedf] shadow-[inset_0_0_0_3px_#e9e5fe]">
        {title ? (
          <div className="border-b-4 border-[#3b3452] bg-[#6c5ccf] px-3 py-[0.6rem] text-center text-[1.05rem] font-bold uppercase tracking-[0.1em] text-[#fdf9ef] [text-shadow:2px_2px_0_#3b3452] max-[480px]:px-2 max-[480px]:py-[0.4rem] max-[480px]:text-[0.82rem] max-[480px]:tracking-[0.03em]">
            {title}
          </div>
        ) : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-start gap-5 overflow-y-auto overscroll-contain p-6 max-[640px]:gap-3 max-[640px]:p-3">{children}</div>
      </div>
    </div>
  );
}