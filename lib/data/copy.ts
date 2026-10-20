// Canned micro-copy. Picks are index-based — no real randomizer, no logic.

export const SUCCESS_LINES = [
  "Nice work! That's exactly right.",
  "Perfect! You're thinking like a circuit.",
  "Correct! Keep that streak alive.",
  "Spot on — great instinct!",
  "You got it! On to the next one.",
];

export const FAILURE_LINES = [
  "Almost! Look at the inputs once more.",
  "Not quite — but you're close.",
  "Tricky one! Check the truth table again.",
  "Nope this time. Every engineer misreads a gate now and then.",
  "Missed it — give it another shot!",
];

export const LOCKED_TOAST = "LEVEL LOCKED — finish the previous level first!";

export function successLine(index: number): string {
  return SUCCESS_LINES[index % SUCCESS_LINES.length];
}

export function failureLine(index: number): string {
  return FAILURE_LINES[index % FAILURE_LINES.length];
}