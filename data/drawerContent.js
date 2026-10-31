// What's inside the bedroom dresser.
// Top drawer: circuit-building materials. Bottom drawer: RJ45 / cabling tools.
export const DRAWERS = [
  {
    id: "top",
    label: "TOP DRAWER",
    title: "Circuit Kit",
    accent: "#1d7a35",
    items: [
      { id: "breadboard", icon: "breadboard", name: "Breadboard", desc: "Build circuits without soldering. Each 5-hole column is connected; the + / – rails carry power." },
      { id: "ics", icon: "ic", name: "Logic ICs (7408, 7432, 7404…)", desc: "Chips that hold logic gates. Pin 14 = VCC (+5V), pin 7 = GND." },
      { id: "dip", icon: "dip", name: "DIP Switch", desc: "Small slide switches that set each input to ON (1) or OFF (0)." },
      { id: "led", icon: "led", name: "LEDs", desc: "Light up when an output is HIGH (1)." },
      { id: "resistor", icon: "resistor", name: "Resistors", desc: "Limit current so LEDs and chips don't burn out." },
      { id: "jumpers", icon: "jumper", name: "Jumper Wires", desc: "Connect parts and power rails on the breadboard." },
      { id: "power", icon: "battery", name: "5V Power Supply", desc: "Provides +5V and GND for the whole circuit." },
    ],
  },
  {
    id: "bottom",
    label: "BOTTOM DRAWER",
    title: "RJ45 Cabling Kit",
    accent: "#2d6cdf",
    items: [
      { id: "cable", icon: "cable", name: "UTP Cable (Cat5e / Cat6)", desc: "8 copper wires twisted into 4 colour pairs." },
      { id: "rj45", icon: "rj45", name: "RJ45 Connectors", desc: "Clear 8-pin plugs crimped onto each end of the cable." },
      { id: "stripper", icon: "stripper", name: "Cable Stripper", desc: "Removes the outer jacket without cutting the inner wires." },
      { id: "crimper", icon: "crimper", name: "Crimping Tool", desc: "Presses the RJ45 pins down onto the wires to lock them in." },
      { id: "tester", icon: "tester", name: "Cable Tester", desc: "Checks that all 8 wires connect in the right order." },
      { id: "chart", icon: "chart", name: "T568A / T568B Chart", desc: "Wire colour order. B: white-orange, orange, white-green, blue, white-blue, green, white-brown, brown." },
    ],
  },
];
