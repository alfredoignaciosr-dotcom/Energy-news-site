/*
 * Site content lives here. Add, edit or remove items and the pages update automatically.
 *
 * NOTE: Everything below is SAMPLE content (fictional authors, hosts and figures) so the
 * site has something to show. Replace it with your own reporting before publishing.
 *
 * type: "news" = short, timely updates; "article" = longer features / analysis.
 * category must be one of the keys in CATEGORIES.
 */

const SITE = {
  name: "Gridline",
  tagline: "Energy news, analysis & conversations",
  description:
    "Independent coverage of the energy transition — from solar farms and offshore wind to oil markets, nuclear, storage and the grid that ties it all together.",
};

const CATEGORIES = {
  solar:   { label: "Solar",          color: "#f5a524" },
  wind:    { label: "Wind",           color: "#3fb5c9" },
  storage: { label: "Grid & Storage", color: "#7c6cf0" },
  nuclear: { label: "Nuclear",        color: "#e0567a" },
  oilgas:  { label: "Oil & Gas",      color: "#8a6a4f" },
  ev:      { label: "EVs & Transport",color: "#2fb67c" },
  policy:  { label: "Policy",         color: "#4c7bd9" },
};

const AUTHORS = {
  mreyes: { name: "Marisol Reyes", role: "Senior Energy Reporter" },
  dokafor: { name: "Daniel Okafor", role: "Markets Editor" },
  hlindqvist: { name: "Hanna Lindqvist", role: "Climate & Policy Correspondent" },
  pnair: { name: "Priya Nair", role: "Technology Writer" },
};

const POSTS = [
  {
    id: "community-solar-rural-coops",
    type: "article",
    featured: true,
    category: "solar",
    title: "How rural co-ops are quietly becoming community solar's biggest builders",
    excerpt:
      "Member-owned utilities once lagged on renewables. Now many are leading, using shared solar gardens to cut costs and keep money in local economies.",
    author: "mreyes",
    date: "2026-11-16",
    readMinutes: 9,
    body: [
      "For decades, rural electric cooperatives were seen as the slow movers of the power sector — long-term coal contracts, thin margins, and members spread across vast service territories. That picture is changing fast.",
      "Across the plains and the Southeast, co-ops are building shared solar arrays sized between one and ten megawatts. Members subscribe to a slice of the output and see a credit on their bill, without needing a suitable roof of their own.",
      "## Why co-ops have an edge",
      "Co-op boards answer directly to the people paying the bills, which shortens decision cycles. Many also own land near substations, which avoids the long interconnection queues that stall larger developers.",
      "> \"The cheapest kilowatt-hour is the one you don't have to ship across three states,\" one co-op general manager told us.",
      "## The challenges ahead",
      "Financing remains the main hurdle. Smaller balance sheets make it harder to absorb upfront costs, although transferable tax credits have opened the door to partnerships with regional banks.",
      "Grid integration is the other question. As midday solar output grows, co-ops are pairing new arrays with modest battery systems to shift energy into the evening peak — a pattern we expect to become standard by the end of the decade.",
    ],
  },
  {
    id: "offshore-wind-port-upgrades",
    type: "news",
    category: "wind",
    title: "East Coast ports race to finish heavy-lift quays for next wave of offshore turbines",
    excerpt:
      "Three port authorities say reinforced quays will be ready for 15 MW-class components by next summer.",
    author: "hlindqvist",
    date: "2026-11-16",
    readMinutes: 3,
    body: [
      "Offshore wind turbines have outgrown much of the existing port infrastructure. Nacelles for the newest models weigh more than many quays were designed to carry.",
      "Port officials say reinforced staging areas, deeper berths and new crane pads are on track, and that the work is creating hundreds of construction jobs in coastal towns.",
      "Developers argue the upgrades will reduce reliance on overseas staging ports and cut installation timelines by several weeks per project.",
    ],
  },
  {
    id: "long-duration-storage-explainer",
    type: "article",
    featured: true,
    category: "storage",
    title: "Beyond lithium: a field guide to long-duration energy storage",
    excerpt:
      "Iron-air, flow batteries, compressed air and thermal bricks all promise to store power for days, not hours. Here's how they compare.",
    author: "pnair",
    date: "2026-11-14",
    readMinutes: 12,
    body: [
      "Lithium-ion batteries have become the workhorse of grid storage, but they are best suited to shifting energy by two to four hours. Covering a windless week calls for different chemistry — and different economics.",
      "## Flow batteries",
      "Flow batteries keep their energy in liquid electrolytes stored in tanks. Doubling the duration means adding bigger tanks rather than more cells, which makes them attractive for eight-hour-plus applications.",
      "## Iron-air",
      "Iron-air cells essentially rust and un-rust iron pellets. They are slow and bulky but extremely cheap per kilowatt-hour, targeting multi-day storage.",
      "## Compressed air and thermal storage",
      "Compressed-air systems pump air into caverns or tanks and release it through turbines. Thermal systems heat bricks or molten salt to high temperatures and release that heat for industry or power generation.",
      "## What to watch",
      "The deciding factor will not be the technology alone but market design: grids need ways to pay for capacity that sits idle most of the year and saves the day during rare, extended shortfalls.",
    ],
  },
  {
    id: "crude-prices-weekly",
    type: "news",
    category: "oilgas",
    title: "Crude steadies as traders weigh winter demand against rising inventories",
    excerpt:
      "Benchmark prices moved in a narrow band this week as stockpile data offset forecasts of a colder-than-average winter.",
    author: "dokafor",
    date: "2026-11-15",
    readMinutes: 2,
    body: [
      "Oil markets were rangebound this week. Traders balanced inventory builds against weather models pointing to stronger heating demand in the northern hemisphere.",
      "Analysts noted that refinery maintenance season is winding down, which could tighten product markets heading into December.",
    ],
  },
  {
    id: "smr-licensing-milestone",
    type: "news",
    category: "nuclear",
    title: "Small modular reactor design clears key safety review stage",
    excerpt:
      "Regulators completed a major phase of their review, moving the design one step closer to a construction permit.",
    author: "hlindqvist",
    date: "2026-11-13",
    readMinutes: 3,
    body: [
      "A small modular reactor design has completed a key phase of its safety review, according to the developer.",
      "Supporters say factory-built reactors could cut construction risk; critics point to unresolved questions about fuel supply and waste management.",
      "The next stage involves public hearings and an environmental assessment, expected to take at least a year.",
    ],
  },
  {
    id: "ev-charging-reliability",
    type: "article",
    category: "ev",
    title: "The broken charger problem: why reliability is now the EV industry's top priority",
    excerpt:
      "Drivers say a working plug matters more than a fast one. Operators are responding with uptime guarantees and remote diagnostics.",
    author: "pnair",
    date: "2026-11-12",
    readMinutes: 7,
    body: [
      "Ask EV drivers about their biggest frustration and you will rarely hear about range. You will hear about arriving at a charger that doesn't work.",
      "Charging networks are now publishing uptime figures and tying funding to reliability targets. Remote monitoring lets technicians diagnose many faults before a driver ever notices.",
      "## Standardisation helps",
      "The convergence on fewer connector types and common payment protocols is reducing the number of handshake failures between car and charger.",
      "## The maintenance gap",
      "Still, hardware installed in the early rush is ageing. Operators that budget for maintenance — not just installation — are expected to win driver loyalty.",
    ],
  },
  {
    id: "transmission-permitting-reform",
    type: "article",
    featured: true,
    category: "policy",
    title: "The wires bottleneck: can permitting reform unlock the next decade of clean power?",
    excerpt:
      "Hundreds of gigawatts of projects sit in interconnection queues. Lawmakers and grid operators are pulling different levers to clear them.",
    author: "hlindqvist",
    date: "2026-11-10",
    readMinutes: 10,
    body: [
      "Building a solar farm can take two years. Building the transmission line to connect it can take ten. That mismatch has become the defining constraint of the energy transition.",
      "## The queue",
      "Interconnection queues now hold far more generating capacity than is currently installed. Most projects will never be built, but the backlog slows everyone down.",
      "## Reform options",
      "Proposals range from shorter environmental review timelines and clearer cost allocation rules to 'first-ready, first-served' cluster studies that prioritise projects with land and financing in place.",
      "## Reconductoring",
      "A faster fix may already be hanging overhead: swapping old conductors for advanced cables can nearly double a line's capacity without new towers or new rights-of-way.",
    ],
  },
  {
    id: "perovskite-tandem-efficiency",
    type: "news",
    category: "solar",
    title: "Perovskite-silicon tandem cells post new lab efficiency record",
    excerpt:
      "Researchers report another jump in conversion efficiency, though durability in the field remains the open question.",
    author: "pnair",
    date: "2026-11-09",
    readMinutes: 2,
    body: [
      "A research group reported a new efficiency record for perovskite-on-silicon tandem solar cells, pushing past previous lab results.",
      "The challenge remains scaling: perovskite layers can degrade under heat and humidity, and commercial modules must last 25 years or more.",
    ],
  },
  {
    id: "heat-pump-cold-climate",
    type: "article",
    category: "policy",
    title: "Cold-climate heat pumps are winning over skeptics — one frozen winter at a time",
    excerpt:
      "Field data from northern installations shows modern units holding up well below freezing, reshaping the home-heating debate.",
    author: "mreyes",
    date: "2026-11-07",
    readMinutes: 8,
    body: [
      "The old wisdom held that heat pumps struggle when temperatures plunge. A new generation of variable-speed compressors is changing that story.",
      "Installers in colder regions report that properly sized systems handle the vast majority of the heating season without backup, with resistance strips kicking in only on the coldest nights.",
      "## The grid angle",
      "Utilities are watching closely: widespread electric heating shifts the system peak from summer afternoons to winter mornings, with big implications for planning.",
    ],
  },
  {
    id: "battery-gigafactory-hiring",
    type: "news",
    category: "storage",
    title: "New battery plant begins hiring ahead of first production line",
    excerpt:
      "The facility will produce cells for stationary storage, with an initial focus on lithium iron phosphate chemistry.",
    author: "dokafor",
    date: "2026-11-06",
    readMinutes: 2,
    body: [
      "A new battery manufacturing plant has opened applications for its first production shifts, with training partnerships set up at local community colleges.",
      "The plant will initially make LFP cells for grid storage, a segment where demand has grown faster than for EVs over the past year.",
    ],
  },
];

const PODCAST = {
  title: "The Gridline Podcast",
  description:
    "Weekly conversations with the engineers, traders, policymakers and builders shaping how the world makes and moves energy.",
  hosts: ["Marisol Reyes", "Daniel Okafor"],
  // Add your own feed links here once the show is live.
  links: [
    { label: "RSS feed", url: "#" },
    { label: "Apple Podcasts", url: "#" },
    { label: "Spotify", url: "#" },
  ],
};

/* audio: path or URL to an .mp3/.wav/.m4a file. The demo clip is a placeholder tone. */
const EPISODES = [
  {
    number: 42,
    title: "Who pays for the grid of the future?",
    guest: "a utility regulator and a consumer advocate",
    date: "2026-11-14",
    duration: "48:12",
    category: "policy",
    audio: "assets/audio/demo-episode.wav",
    summary:
      "Transmission, distribution upgrades and rising demand from data centers all cost money. We debate how those costs should be split between households, industry and new loads.",
  },
  {
    number: 41,
    title: "Inside an offshore wind installation vessel",
    guest: "a jack-up vessel captain",
    date: "2026-11-07",
    duration: "39:45",
    category: "wind",
    audio: "assets/audio/demo-episode.wav",
    summary:
      "What it takes to install a turbine taller than most skyscrapers in the open ocean — weather windows, crane limits, and life on board.",
  },
  {
    number: 40,
    title: "Oil markets in a transition decade",
    guest: "a commodities strategist",
    date: "2026-10-31",
    duration: "52:30",
    category: "oilgas",
    audio: "assets/audio/demo-episode.wav",
    summary:
      "Peak demand forecasts, spare capacity and why price volatility might increase — not decrease — as the energy mix shifts.",
  },
  {
    number: 39,
    title: "Batteries that last a week",
    guest: "a long-duration storage founder",
    date: "2026-10-24",
    duration: "44:05",
    category: "storage",
    audio: "assets/audio/demo-episode.wav",
    summary:
      "Iron-air, flow chemistries and the market rules that will decide whether multi-day storage gets built at scale.",
  },
  {
    number: 38,
    title: "Nuclear's second act",
    guest: "a reactor engineer",
    date: "2026-10-17",
    duration: "57:18",
    category: "nuclear",
    audio: "assets/audio/demo-episode.wav",
    summary:
      "Small modular reactors, plant life extensions and restarts — separating realistic timelines from hype.",
  },
];
