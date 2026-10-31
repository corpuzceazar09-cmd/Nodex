// The opening is one conversation. Selection and input steps are rendered
// inside the same RPG dialogue box as the spoken lines.
// The guide is PROF. LOGIC, the same professor who meets the player again on
// the computer (/intro) for the logic lessons.
const GUIDE = "PROF. LOGIC";

export const TUTORIAL_DIALOGUE = [
  { speaker: GUIDE, text: "Hello there! Welcome to the world of NODEX! I'm PROF. LOGIC." },
  { speaker: GUIDE, text: "Before we begin, I'd like to know a little about you." },
  { speaker: GUIDE, text: "First, which one are you? Pick your character!", mode: "gender" },
  { speaker: GUIDE, text: "And what is your name?", mode: "name" },
  { speaker: GUIDE, text: "So your name is {name}. Is that correct?", mode: "confirm" },
  { speaker: GUIDE, text: "Nice to meet you, {name}! Now, welcome to NODEX, your digital logic adventure." },
  { speaker: GUIDE, text: "You'll learn about logic gates, build circuits, and practice network cabling." },
  { speaker: GUIDE, text: "Use WASD or the arrow keys to walk. Hold a direction to keep moving!" },
  { speaker: GUIDE, text: "Walk right up to an object until a prompt appears, then press E, Enter, or Space to interact." },
  { speaker: GUIDE, text: "Try resting in bed, reading the books, checking the drawers for your circuit and RJ45 kits, or watching TV." },
  { speaker: GUIDE, text: "See that computer? Walk up to it and press E to enter NODEX." },
  { speaker: GUIDE, text: "Your lessons, challenges, cabling game, and circuit sandbox are all inside." },
  { speaker: GUIDE, text: "You're ready, {name}! Boot up the computer when you are. I'll meet you there!" }
];
