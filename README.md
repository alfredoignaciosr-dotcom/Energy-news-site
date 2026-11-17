# Gridline — energy news, analysis & podcasts

A fast, dependency-free static site that brings together the day's energy news and analysis from
leading publications, plus the best energy podcasts. Every story links to its original publisher.
No build step: host it on GitHub Pages / Netlify as-is.

## Pages

| Page | What it shows |
| --- | --- |
| `index.html` | Top analysis story, latest news, more analysis, latest podcast episodes, topics |
| `news.html` | Every story with search, topic chips, a News / Analysis toggle and a source filter (`?cat=solar&type=news&source=Utility%20Dive&q=grid`) |
| `articles.html` | Analysis only (Carbon Brief, EIA Today in Energy, Canary Media) |
| `podcasts.html` | Latest episodes and 12 energy podcasts, playable through Spotify's embedded player |
| `about.html` | What the site is, plus live status of every source and the podcast list |

Also: light/dark mode, responsive layout, accessible markup.

## Where the content comes from

**News & analysis** — `scripts/fetch_feeds.py` reads the RSS/Atom feeds listed in `SOURCES` (Utility Dive,
pv magazine, Energy-Storage.news, offshoreWIND.biz, World Nuclear News, OilPrice.com, Electrek, CleanTechnica,
Carbon Brief, EIA Today in Energy, Canary Media) and writes `assets/data/feeds.json`. Only the headline, date,
author and a short summary are stored; each links to the full story. Stories are tagged with a topic by keyword.

`.github/workflows/news-feeds.yml` runs it every 3 hours (or on demand: Actions tab → *Update news feeds* →
*Run workflow*), commits the result and republishes the site. If a feed fails, its previous headlines are kept,
and the About page shows which feeds are currently unavailable.

To add or remove a publication, edit `SOURCES` in `scripts/fetch_feeds.py` (`kind` is `news` or `analysis`).

**Podcasts** — `RECOMMENDED_PODCASTS` in `assets/js/data.js`: real shows on Spotify (show id + latest episode id).
"Play" loads Spotify's embedded player. Update `latest` as shows publish.

**Site name, description, topics** — `SITE` and `CATEGORIES` in `assets/js/data.js`.

## Running locally

```bash
python3 -m http.server 8000      # then open http://localhost:8000
python3 scripts/fetch_feeds.py   # refresh assets/data/feeds.json (needs internet access)
```
