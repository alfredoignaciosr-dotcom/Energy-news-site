/*
 * Site settings and topics.
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

/* Podcasts live in assets/data/podcasts.json (shows you pick; latest episodes refresh automatically). */
