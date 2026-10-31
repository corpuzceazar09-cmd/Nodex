import Link from "next/link";
import ScreenFrame from "@/components/ScreenFrame";
import { ui } from "@/lib/uiStyles";

const RULES: [string, string][] = [
  ["PICK A MODE", "START begins a fresh run (tutorial first). CONTINUE jumps back to your current level path."],
  ["ONE SHORT CHALLENGE PER LEVEL", "Either pick the correct answer (multiple choice) or build the circuit and fill in the truth table."],
  ["CHECK YOUR ANSWER", "You get instant feedback plus a short explanation — on success AND on failure."],
  ["EARN XP & KEEP THE STREAK", "Regular levels pay 50 XP, final challenges pay 150 XP. Every correct answer extends your streak."],
  ["UNLOCK THE PATH", "Each completed level unlocks the next node. Locked nodes show a padlock — clear the one before it."],
  ["USE THE LOGIC GATE LAB", "Stuck? The lab has every gate's symbol, Boolean expression, truth table and IC pins. Drag the switches to watch the output live."],
  ["TRY THE CIRCUIT CHALLENGES", "Bonus quests where several gates are wired together. Flip the switches, read the LED, then predict the output."],
  ["WIRE REAL ETHERNET CABLES", "The RJ45 Cabling Game teaches straight-through, crossover and rollover leads. Drag each coloured wire from a pin to its correct destination."],
];

export default function HowToPlayPage() {
  return (
    <div className={ui.page}>
      <ScreenFrame title="HOW TO PLAY">
        <p className={`${ui.hint} text-center`}>
          Nodex teaches logic gates through short, game-style challenges.
        </p>

        <ol className="flex flex-col gap-3">
          {RULES.map(([title, body], i) => (
            <li
              key={title}
              className="flex gap-3 border-[3px] border-black bg-white p-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-[#1414d2] font-black text-white">
                {i + 1}
              </span>
              <span>
                <b className="block">{title}</b>
                <span className="text-sm leading-snug">{body}</span>
              </span>
            </li>
          ))}
        </ol>

        <Link href="/menu" className={`${ui.button} ${ui.buttonPrimary} mx-auto`}>
          GOT IT ▶
        </Link>
      </ScreenFrame>
    </div>
  );
}