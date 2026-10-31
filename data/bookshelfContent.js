// Books on the bedroom shelf. Each book is a few short pages so the text
// stays large and readable instead of one dense block.
export const BOOKS = [
  {
    id: "intro_logic",
    title: "Introduction to Logic Gates",
    color: "#c0392b",
    pages: [
      {
        heading: "What is a logic gate?",
        body: [
          "A logic gate is a tiny electronic switch that takes one or more inputs and produces a single output.",
          "Every input and output is either 1 (ON, HIGH) or 0 (OFF, LOW). This is called binary.",
        ],
      },
      {
        heading: "The basic gates",
        points: [
          ["AND", "Output is 1 only when ALL inputs are 1."],
          ["OR", "Output is 1 when AT LEAST ONE input is 1."],
          ["NOT", "Flips the input: 1 becomes 0, 0 becomes 1."],
        ],
      },
      {
        heading: "The combined gates",
        points: [
          ["NAND", "AND followed by NOT. Output is 0 only when all inputs are 1."],
          ["NOR", "OR followed by NOT. Output is 1 only when all inputs are 0."],
          ["XOR", "Output is 1 when the inputs are DIFFERENT."],
          ["XNOR", "Output is 1 when the inputs are the SAME."],
        ],
      },
    ],
  },
  {
    id: "networking",
    title: "Basics of Computer Networking",
    color: "#2d6cdf",
    pages: [
      {
        heading: "What is a network?",
        body: [
          "A network lets computers and devices talk to each other and share information.",
          "In a home or school, a Local Area Network (LAN) connects devices using switches, routers, and Ethernet cables.",
        ],
      },
      {
        heading: "Ethernet cables",
        body: [
          "An Ethernet cable has 8 small wires twisted into 4 pairs. An RJ45 connector is crimped onto each end.",
          "The order of the coloured wires inside the connector follows a standard: T568A or T568B.",
        ],
      },
      {
        heading: "Three cable types",
        points: [
          ["Straight-through", "Same standard on both ends. Connects a PC to a switch or router."],
          ["Crossover", "T568A on one end, T568B on the other. Connects two similar devices."],
          ["Rollover", "Wire order fully reversed. Used for a router's console port."],
        ],
      },
    ],
  },
  {
    id: "digital_circuits",
    title: "Digital Circuits",
    color: "#1d7a35",
    pages: [
      {
        heading: "From gates to circuits",
        body: [
          "By wiring logic gates together, we can build circuits that make decisions, add numbers, and remember data.",
          "Adders, multiplexers, and memory cells are all made from simple gates.",
        ],
      },
      {
        heading: "Logic chips (ICs)",
        body: [
          "Gates come packaged in chips such as the 7408 (AND) or 7432 (OR). Each chip has numbered pins.",
          "A chip only works when it is powered: VCC goes to +5V and GND goes to ground.",
        ],
      },
      {
        heading: "Building on a breadboard",
        points: [
          ["Breadboard", "Lets you build circuits without soldering."],
          ["DIP switch", "Sets each input to ON (1) or OFF (0)."],
          ["LED", "Lights up to show when an output is 1."],
          ["Jumper wires", "Connect the parts together."],
        ],
      },
    ],
  },
];
