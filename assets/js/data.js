/*
 * Site settings, topics and podcasts.
 *
 * News and analysis headlines are NOT stored here: they come from assets/data/feeds.json, which
 * scripts/fetch_feeds.py refreshes every 3 hours from real publishers' feeds (see README).
 */

const SITE = {
  name: "Gridbase",
  tagline: "Energy news, analysis & podcasts",
  description: "Energy news, analysis and podcasts in one place.",
};

/* Topics. Feed items are tagged with these keys by scripts/fetch_feeds.py. */
const CATEGORIES = {
  solar:   { label: "Solar",           color: "#f5a524" },
  wind:    { label: "Wind",            color: "#3fb5c9" },
  storage: { label: "Grid & Storage",  color: "#7c6cf0" },
  nuclear: { label: "Nuclear",         color: "#e0567a" },
  oilgas:  { label: "Oil & Gas",       color: "#8a6a4f" },
  ev:      { label: "EVs & Transport", color: "#2fb67c" },
  policy:  { label: "Policy",          color: "#4c7bd9" },
  general: { label: "Energy",          color: "#5f6b7a" },
};

/*
 * Energy podcasts — real shows on Spotify, shown on the Podcasts page and home page.
 * id = the Spotify show id (open.spotify.com/show/<id>); latest.id = a Spotify episode id.
 * The "Play" button loads Spotify's official embedded player, so audio streams from Spotify.
 * Latest-episode details were taken from Spotify on 2026-11-17; update them as shows publish.
 */
const RECOMMENDED_PODCASTS = [
  {
    id: "0GT5BuD33AiPnqOzQE7YAE",
    name: "Energy Gang",
    publisher: "Wood Mackenzie",
    category: "policy",
    description: "A weekly roundtable on the biggest stories in energy, from oil and gas to power, renewables and climate policy.",
    latest: { id: "6AOfomG6dTMHbk5y7Nliux", title: "The future of the grid: Can new technologies deliver more electricity without building more infrastructure?", date: "2026-10-29" },
  },
  {
    id: "4AnIQG21dDcwNSHwMcW4yh",
    name: "Columbia Energy Exchange",
    publisher: "Columbia University",
    category: "policy",
    description: "Interviews with leaders across government, business and research on energy policy and global energy markets.",
    latest: { id: "5XamLFmhWOaoKjrOjr6Pdv", title: "Aliya Haq and Rich Powell on Energy Affordability and the New Congress", date: "2026-11-10" },
  },
  {
    id: "5rHwnJEjFRnivIdpWwnZyZ",
    name: "Zero: The Climate Race",
    publisher: "Bloomberg",
    category: "policy",
    description: "Bloomberg's show on the people, technologies and money racing to cut emissions.",
    latest: { id: "3EkmTCpfhAXbnfXf6s4J7u", title: "Why electricity is the answer to energy security", date: "2026-11-12" },
  },
  {
    id: "0KREPYRAQorrSYIedTnBel",
    name: "The Energy Transition Show with Chris Nelder",
    publisher: "XE Network",
    category: "storage",
    description: "Long-form, technically detailed conversations about how the energy system is changing.",
    latest: { id: "3yPqDBc5OIVLy57RxpaTlE", title: "[Episode #287] – Clearing the Connection Queue", date: "2026-11-12" },
  },
  {
    id: "3dYMY5T3UZJLDKFQaA3tFS",
    name: "Volts",
    publisher: "David Roberts",
    category: "policy",
    description: "Deep-dive interviews on clean energy technology, politics and policy.",
    latest: { id: "5QHHIKODsEL5RZRwbISg6B", title: "Forcing utilities to justify their distribution-system spending", date: "2026-07-08" },
  },
  {
    id: "4C5Qx3wJn0GeTnDxIVYcAR",
    name: "Catalyst with Shayle Kann",
    publisher: "Latitude Media",
    category: "storage",
    description: "Conversations about the technologies and business models of climate tech and clean energy.",
    latest: { id: "481jlJBm9jl3vrWSg53IVi", title: "Volts crossover: Six big energy questions", date: "2026-02-25" },
  },
  {
    id: "2HZmokyIl2h4UuiO1qx5XP",
    name: "Open Circuit",
    publisher: "Latitude Media",
    category: "policy",
    description: "A weekly panel breaking down the business and economics of the energy transition.",
    latest: { id: "2spSoQzwnsYv4G2g9hDY5h", title: "State of the transition: The biggest fights in energy", date: "2026-03-20" },
  },
  {
    id: "19HNFf7SZ2ox90YqVC4RUt",
    name: "Interchange Recharged",
    publisher: "Wood Mackenzie",
    category: "storage",
    description: "Wood Mackenzie's show on power markets, grid flexibility and the companies reshaping electricity.",
    latest: { id: "3RNSYkELhtt4OIkGuE1P57", title: "Re-release: Flexibility as a service: Can Octopus's acquisition of Uplight finally make US residential VPPs work?", date: "2026-11-03" },
  },
  {
    id: "4FDIRo16s1C9Fpc9v1HyGi",
    name: "Redefining Energy",
    publisher: "Laurent Segalen and Gerard Reid",
    category: "storage",
    description: "Two energy financiers discuss markets, investment and the global energy transition.",
    latest: { id: "59pmmtT4pXY2No4jhliJW3", title: "219. Hyperscalers vs US Utilities - Mar26", date: "2026-03-09" },
  },
  {
    id: "1HdsWBxHggXj7WdhoWfd3k",
    name: "Climate Rising",
    publisher: "Harvard Business School",
    category: "policy",
    description: "Business leaders and researchers on how companies and investors are responding to climate change.",
    latest: { id: "4ltS8AMdwexEH68TS47qwB", title: "Powering AI and the Energy Transition: Why Permitting Reform Matters", date: "2026-09-30" },
  },
  {
    id: "5abw6M8GZWklf4SueAu19v",
    name: "Oil and Gas This Week",
    publisher: "Mark LaCour & Paige Wilson",
    category: "oilgas",
    description: "A weekly rundown of oil and gas industry news.",
    latest: { id: "5DG3EnGoysBKKzoHBZnbz8", title: "Oil and Gas This Week | Oct 28 2026 | Ep 413", date: "2026-10-28" },
  },
  {
    id: "3wgqiNgOydzUFD4Mb3M1KU",
    name: "The Big Switch",
    publisher: "Dr. Melissa Lott",
    category: "ev",
    description: "Season-long series that explain a single clean energy topic in depth.",
    latest: { id: "2Ev0TdagUDFHsyCXHg2SD7", title: "Part 5: The Battery Recycling Dilemma", date: "2024-03-27" },
  },
];
