export const BUILDER_TITLES = [
  "Chaos Engineer",
  "Prompt Whisperer",
  "Ship-it Specialist",
  "Vibe Coder",
  "Midnight Deployer",
  "Stack Whisperer",
  "Bug Archaeologist",
  "Feature Velocity God",
  "Zero-to-Prod Wizard",
  "Context Window Surfer",
  "Async Cowboy",
  "PR Merge Maniac",
  "Token Economist",
  "Edge Case Hunter",
  "Demo-Driven Developer",
  "Hackathon Veteran",
  "Stack Overflow Archaeologist",
  "Rubber Duck Whisperer",
  "Production Daredevil",
  "API Wrangler",
  "Tech Debt Archaeologist",
  "Serverless Shaman",
  "Latency Slayer",
  "Cursor Jockey",
  "Vibe Check Engineer",
];

export const VIBE_TAGS = [
  "HIGH FREQUENCY",
  "COFFEE POWERED",
  "MAXIMUM OVERDRIVE",
  "SHIP FIRST, ASK LATER",
  "ZERO DOWNTIME",
  "VIBE ALIGNED",
  "PROD RISK-TAKER",
  "CHAOS ENTHUSIAST",
  "10X SHIPPER",
  "SUSESEGAD DEV",
  "TERMINAL DWELLER",
  "CONTEXT WINNER",
  "PROMPT COMMANDER",
  "LATENCY SLAYER",
  "EDGE SURFER",
];

export function getBuilderTitle(role: string): string {
  const base = BUILDER_TITLES[Math.floor(Math.random() * BUILDER_TITLES.length)];
  if (!role.trim()) return base;
  const flavors = [
    `${base} & ${role} Oracle`,
    `${role} Whisperer · ${base}`,
    `${base} (${role} Edition)`,
  ];
  return flavors[Math.floor(Math.random() * flavors.length)];
}

export function getRandomVibe(): string {
  return VIBE_TAGS[Math.floor(Math.random() * VIBE_TAGS.length)];
}
