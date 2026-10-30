// Daily randomized TV content
const PROGRAM_POOL = {
  techNews: [
    {
      title: "TECH NEWS",
      content: "Did you know? The first logic gate was conceptualized long before modern computers existed. Binary logic powers everything from calculators to supercomputers!"
    },
    {
      title: "TECH NEWS",
      content: "Network speeds have evolved from kilobits to gigabits. But understanding the fundamentals of cabling is still crucial in networking."
    },
    {
      title: "TECH NEWS",
      content: "Logic gates form the foundation of all digital circuits. Every smartphone contains billions of transistors implementing these basic gates."
    }
  ],
  logicTips: [
    {
      title: "LOGIC TIPS",
      content: "AND Gate: Output is 1 only when BOTH inputs are 1. Think of it as a series circuit - both switches must be closed."
    },
    {
      title: "LOGIC TIPS",
      content: "OR Gate: Output is 1 when AT LEAST one input is 1. Like parallel switches - any closed switch gives output."
    },
    {
      title: "LOGIC TIPS",
      content: "XOR Gate: Output is 1 when inputs are DIFFERENT. It's useful for addition circuits and comparisons."
    },
    {
      title: "LOGIC TIPS",
      content: "NOT Gate: The simplest gate - it INVERTS the input. A 1 becomes 0, and a 0 becomes 1."
    }
  ],
  dailyChallenge: [
    {
      title: "DAILY CHALLENGE",
      content: "Quick Quiz: What is the output of an AND gate with inputs (1, 0)? Answer: 0 (false)!"
    },
    {
      title: "DAILY CHALLENGE",
      content: "Cable Challenge: A straight-through Ethernet cable is used to connect different types of devices. A crossover connects similar devices."
    },
    {
      title: "DAILY CHALLENGE",
      content: "Think: How many NAND gates are needed to build an OR gate? The answer might surprise you!"
    }
  ]
};

export const getDailyPrograms = () => {
  const today = new Date().toDateString();
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i);
  }
  
  const randomize = (arr, offset) => {
    const idx = (seed + offset) % arr.length;
    return arr[idx];
  };
  
  return [
    randomize(PROGRAM_POOL.techNews, 0),
    randomize(PROGRAM_POOL.logicTips, 1),
    randomize(PROGRAM_POOL.dailyChallenge, 2)
  ];
};
