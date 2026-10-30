// The opening is one conversation. Selection and input steps are rendered
// inside the same RPG dialogue box as the spoken lines.
export const TUTORIAL_DIALOGUE = [
  { speaker: "NODEX GUIDE", text: "Hello there! Welcome to the world of NODEX!" },
  { speaker: "NODEX GUIDE", text: "Before we begin, I'd like to know a little about you." },
  { speaker: "NODEX GUIDE", text: "First, are you a boy or a girl?", mode: "gender" },
  { speaker: "NODEX GUIDE", text: "And what is your name?", mode: "name" },
  { speaker: "NODEX GUIDE", text: "So your name is {name}. Is that correct?", mode: "confirm" },
  { speaker: "NODEX GUIDE", text: "Nice to meet you, {name}! Now, welcome to NODEX, your digital logic adventure." },
  { speaker: "NODEX GUIDE", text: "You'll learn about logic gates, build circuits, and practice network cabling." },
  { speaker: "NODEX GUIDE", text: "Use WASD or the arrow keys to walk. Hold a direction to keep moving!" },
  { speaker: "NODEX GUIDE", text: "Approach an object to see its highlight, then press E, Enter, or Space to interact." },
  { speaker: "NODEX GUIDE", text: "Try resting in bed, reading books, opening the drawer, or watching TV." },
  { speaker: "NODEX GUIDE", text: "See that computer? Walk up to it and press E to enter NODEX." },
  { speaker: "NODEX GUIDE", text: "Your lessons, challenges, cabling game, and circuit sandbox are all inside." },
  { speaker: "NODEX GUIDE", text: "You're ready, {name}! I'll leave you to explore. Good luck!" }
];

export const TUTORIAL_STORAGE_KEY = "nodex_tutorial_completed";
