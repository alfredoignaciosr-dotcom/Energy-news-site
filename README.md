# Gridline — energy news, articles & podcast

A fast, dependency-free static website for energy news, long-form articles and a podcast.
No build step: open it with any static web server or host it on GitHub Pages / Netlify as-is.

## Pages

| Page | What it shows |
| --- | --- |
| `index.html` | Featured story, "must read" picks, latest news, features, latest podcast episodes, topics, newsletter |
| `news.html` | Every story with search, topic filters and a News / Features toggle (`?cat=solar&type=news&q=grid`) |
| `articles.html` | Features & analysis only, with search and topic filters |
| `article.html?id=…` | A single story with author, related stories and copy-link sharing |
| `podcasts.html` | "The best energy podcasts" (12 real shows, playable via Spotify embeds), plus Gridline's own episodes with a sticky audio player |
| `about.html` | About copy and the team (from `AUTHORS`) |

Also included: light/dark mode (follows the system, with a toggle), responsive mobile layout, and accessible markup.

## Editing content

All content lives in **`assets/js/data.js`**:

- `POSTS` — news (`type: "news"`) and features (`type: "article"`). Set `featured: true` to promote a feature to the home hero.
  Body paragraphs support `## Heading` and `> Pull quote`.
- `EPISODES` — podcast episodes. Point `audio` at an `.mp3`/`.m4a` URL or a file in `assets/audio/`.
- `RECOMMENDED_PODCASTS` — real shows on Spotify (show id + latest episode id). "Play latest episode" loads Spotify's embedded player; update `latest` as shows publish.
- `CATEGORIES`, `AUTHORS`, `PODCAST`, `SITE` — topics (with colours), bylines, show links and site name.

> The bundled stories, people and figures are **sample placeholders**, and `assets/audio/demo-episode.wav`
> is a short test tone. Replace them with real content before publishing.

## Running locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

- **GitHub Pages:** Settings → Pages → deploy from branch, folder `/ (root)`.
- **Netlify / Vercel / Cloudflare Pages:** no build command; publish directory is the repo root.

## Next steps

- Connect the newsletter form (`wireNewsletter` in `assets/js/app.js`) to a mailing-list provider.
- Add real podcast feed URLs in `PODCAST.links`.
- For a large archive or several editors, move `data.js` to a headless CMS or Markdown files with a static site generator.
