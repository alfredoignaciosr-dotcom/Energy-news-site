/* Gridbase — shared rendering for every page.
 * Headlines come from assets/data/feeds.json (refreshed by a GitHub Action); topics and
 * podcasts come from data.js. Every story links to its original publisher. */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const toDate = (s) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? s + "T12:00:00" : s);
  const fmtDate = (s) => (s ? toDate(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "");
  const byDate = (a, b) => String(b.date).localeCompare(String(a.date));
  const cat = (key) => CATEGORIES[key] || CATEGORIES.general;
  const page = document.body.dataset.page;
  const newTab = 'target="_blank" rel="noopener"';

  function ago(s) {
    const mins = Math.round((Date.now() - toDate(s)) / 60000);
    if (!isFinite(mins) || mins < 0) return fmtDate(s);
    if (mins < 60) return `${Math.max(mins, 1)} min ago`;
    if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
    if (mins < 60 * 24 * 7) return `${Math.round(mins / 1440)} d ago`;
    return fmtDate(s);
  }

  const ICONS = {
    solar: '<circle cx="32" cy="32" r="11"/><g stroke-linecap="round"><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M15 49l6-6M43 21l6-6"/></g>',
    wind: '<path d="M32 30v28M26 58h12"/><path d="M32 30 30 8c4 0 7 2 7 6l-5 16zM32 30l20 10c-2 3-6 4-9 2L32 30zM32 30 12 40c-1-4 1-7 4-8l16-2z"/>',
    storage: '<rect x="14" y="18" width="34" height="30" rx="4"/><path d="M48 28h4v10h-4M30 24l-6 12h8l-4 10"/>',
    nuclear: '<circle cx="32" cy="32" r="4"/><ellipse cx="32" cy="32" rx="22" ry="8"/><ellipse cx="32" cy="32" rx="22" ry="8" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="22" ry="8" transform="rotate(-60 32 32)"/>',
    oilgas: '<path d="M32 10C26 22 20 29 20 38a12 12 0 0 0 24 0c0-9-6-16-12-28z"/>',
    ev: '<path d="M12 40l4-12c1-3 3-4 6-4h20c3 0 5 1 6 4l4 12v8H12z"/><circle cx="22" cy="48" r="4"/><circle cx="42" cy="48" r="4"/><path d="M33 28l-4 7h6l-4 7"/>',
    policy: '<path d="M32 10v44M20 54h24M14 20h36M14 20l-6 14a7 7 0 0 0 12 0zM50 20l-6 14a7 7 0 0 0 12 0z"/>',
    general: '<path d="M36 6 16 36h14l-4 22 22-32H34z"/>',
  };

  function cover(key, extraClass = "") {
    return `<div class="cover ${extraClass}" style="--c:${cat(key).color}" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">${ICONS[key] || ICONS.general}</svg>
    </div>`;
  }

  const tag = (key) =>
    `<a class="tag" href="news.html?cat=${encodeURIComponent(key)}" style="--c:${cat(key).color}">${esc(cat(key).label)}</a>`;

  const byline = (it) =>
    `<div class="byline"><strong class="source">${esc(it.source)}</strong>${it.author ? ` · ${esc(it.author)}` : ""}${it.date ? ` · <time datetime="${esc(it.date)}" title="${esc(fmtDate(it.date))}">${ago(it.date)}</time>` : ""}</div>`;

  function card(it, variant = "") {
    return `<article class="card ${variant}">
      <a href="${esc(it.url)}" ${newTab} class="card-media" tabindex="-1" aria-hidden="true">${cover(it.category)}</a>
      <div class="card-body">
        <div class="meta">${tag(it.category)}<span>${it.kind === "analysis" ? "Analysis" : "News"}</span></div>
        <h3><a href="${esc(it.url)}" ${newTab}>${esc(it.title)}<span class="ext" aria-label="(opens ${esc(it.source)})"> ↗</span></a></h3>
        ${it.summary ? `<p>${esc(it.summary)}</p>` : ""}
        ${byline(it)}
      </div>
    </article>`;
  }

  function newsRow(it) {
    return `<li class="news-row">
      <time datetime="${esc(it.date)}">${ago(it.date)}</time>
      <div>
        <a href="${esc(it.url)}" ${newTab}>${esc(it.title)}</a>
        <div class="row-meta">${tag(it.category)}<span>${esc(it.source)}</span></div>
      </div>
    </li>`;
  }

  /* ---------- podcasts (Spotify) ---------- */
  const spotifyShow = (id) => `https://open.spotify.com/show/${encodeURIComponent(id)}`;
  const initials = (name) =>
    name.split(/[\s:]+/).filter((w) => w && !/^(the|with|and|of|a)$/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const playBtn = (s, label = "Play latest episode") =>
    `<button class="btn btn-sm load-embed" data-episode="${esc(s.latest.id)}" data-title="${esc(s.latest.title)}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>${label}</button>`;

  function showCard(s) {
    return `<article class="show-card" data-embed-host style="--c:${cat(s.category).color}">
      <div class="show-top">
        ${artwork(s)}
        <div>
          <h3><a href="${spotifyShow(s.id)}" ${newTab}>${esc(s.name)}</a></h3>
          <div class="byline">${esc(s.publisher)}</div>
        </div>
      </div>
      <p>${esc(s.description)}</p>
      <div class="show-latest">
        <small>Latest episode · ${fmtDate(s.latest.date)}</small>
        <span>${esc(s.latest.title)}</span>
      </div>
      <div class="embed-slot"></div>
      <div class="show-actions">
        ${playBtn(s)}
        <a class="btn-ghost btn-sm" href="${spotifyShow(s.id)}" ${newTab}>Open in Spotify ↗</a>
      </div>
    </article>`;
  }

  function episodeRow(s) {
    return `<li class="episode" data-embed-host style="--c:${cat(s.category).color}">
      ${artwork(s)}
      <div class="episode-info">
        <div class="meta"><span>${esc(s.name)}</span><span>${fmtDate(s.latest.date)}</span></div>
        <h3>${esc(s.latest.title)}</h3>
        <div class="embed-slot"></div>
        <div class="show-actions">${playBtn(s, "Play")}<a class="btn-ghost btn-sm" href="${spotifyShow(s.id)}" ${newTab}>Show on Spotify ↗</a></div>
      </div>
    </li>`;
  }

  let ART = {};
  async function loadArt() {
    try {
      const res = await fetch("assets/data/podcast-art.json", { cache: "no-cache" });
      if (res.ok) ART = await res.json();
    } catch (e) {}
  }
  const artwork = (s, cls = "show-mono") => ART[s.latest.id]
    ? `<img class="${cls} ep-art" src="${esc(ART[s.latest.id])}" alt="" loading="lazy" width="64" height="64">`
    : `<div class="${cls}" aria-hidden="true">${esc(initials(s.name))}</div>`;

  const latestEpisodes = () => [...RECOMMENDED_PODCASTS].sort((a, b) => b.latest.date.localeCompare(a.latest.date));

  function wireEmbeds() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".load-embed");
      if (!b) return;
      const slot = b.closest("[data-embed-host]").querySelector(".embed-slot");
      slot.innerHTML = `<iframe title="Spotify player: ${esc(b.dataset.title)}" src="https://open.spotify.com/embed/episode/${encodeURIComponent(b.dataset.episode)}?utm_source=generator"
        height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
      b.remove();
    });
  }

  /* ---------- feed data ---------- */
  async function loadFeed() {
    try {
      const res = await fetch("assets/data/feeds.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      const feed = await res.json();
      feed.items = (feed.items || []).filter((i) => i.title && i.url).sort(byDate);
      return feed;
    } catch (e) {
      return { items: [], sources: [], error: true };
    }
  }

  const updatedText = (feed) =>
    feed.fetchedAt ? `Updated ${new Date(feed.fetchedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : "";

  const emptyMsg = (feed) =>
    `<p class="empty">${feed.error ? "Headlines couldn't be loaded right now. Please try again in a moment." : "No stories yet. Headlines refresh every few hours."}</p>`;

  /* ---------- AI briefing ---------- */
  async function renderBriefing() {
    const box = $("#briefing");
    if (!box) return;
    let b;
    try {
      const res = await fetch("assets/data/briefing.json", { cache: "no-cache" });
      if (!res.ok) return;
      b = await res.json();
    } catch (e) { return; }
    if (!b.points || !b.points.length) return;
    $("#briefing-intro").textContent = b.intro || "";
    $("#briefing-updated").textContent = b.generatedAt ? `Updated ${ago(b.generatedAt)}` : "";
    $("#briefing-points").innerHTML = b.points.map((p) => `<li>
      <strong>${esc(p.headline)}</strong> ${esc(p.text)}
      <span class="briefing-src">${(p.stories || []).map((st) =>
        `<a href="${esc(st.url)}" ${newTab} title="${esc(st.title)}">${esc(st.source)} ↗</a>`).join("")}</span>
    </li>`).join("");
    box.hidden = false;
  }

  /* ---------- layout: header & footer ---------- */
  function renderChrome() {
    const nav = [
      ["index.html", "Home", "home"],
      ["news.html", "News", "news"],
      ["articles.html", "Analysis", "articles"],
      ["podcasts.html", "Podcasts", "podcasts"],
      ["about.html", "About", "about"],
    ];
    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `<div class="wrap header-inner">
      <a class="logo" href="index.html"><span class="logo-mark" aria-hidden="true">⚡</span>${esc(SITE.name)}</a>
      <button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <nav id="site-nav" class="site-nav">
        ${nav.map(([href, label, key]) => `<a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        <button class="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
          <svg viewBox="0 0 24 24" class="i-moon"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>
          <svg viewBox="0 0 24 24" class="i-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>
        </button>
      </nav>
    </div>`;
    document.body.prepend(header);

    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `<div class="wrap footer-inner">
      <div>
        <a class="logo" href="index.html"><span class="logo-mark" aria-hidden="true">⚡</span>${esc(SITE.name)}</a>
        <p>${esc(SITE.description)}</p>
      </div>
      <div>
        <h4>Topics</h4>
        ${Object.entries(CATEGORIES).filter(([k]) => k !== "general").map(([k, c]) => `<a href="news.html?cat=${k}">${esc(c.label)}</a>`).join("")}
      </div>
      <div>
        <h4>Explore</h4>
        <a href="news.html?type=news">Latest news</a>
        <a href="articles.html">Analysis</a>
        <a href="podcasts.html">Podcasts</a>
        <a href="about.html#sources">Our sources</a>
      </div>
    </div>
    <div class="wrap footer-bottom">Headlines and summaries belong to their publishers and link to the original stories.</div>`;
    document.body.append(footer);

    const toggle = $(".menu-toggle");
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      $("#site-nav").classList.toggle("open", !open);
    });

    $(".theme-toggle").addEventListener("click", () => {
      const current = document.documentElement.dataset.theme ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- pages ---------- */
  function renderHome(feed) {
    const items = feed.items;
    const analysis = items.filter((i) => i.kind === "analysis");
    const news = items.filter((i) => i.kind !== "analysis");
    const lead = analysis[0] || items[0];
    const side = lead ? (analysis.length > 3 ? analysis : items).filter((i) => i !== lead).slice(0, 3) : [];
    const shown = new Set([lead, ...side]);

    $("#hero").innerHTML = !lead ? emptyMsg(feed) : `
      <article class="lead">
        <a href="${esc(lead.url)}" ${newTab} class="lead-media" tabindex="-1" aria-hidden="true">${cover(lead.category, "cover-lg")}</a>
        <div class="lead-body">
          <div class="meta">${tag(lead.category)}<span>${lead.kind === "analysis" ? "Analysis" : "Top story"}</span></div>
          <h1><a href="${esc(lead.url)}" ${newTab}>${esc(lead.title)}</a></h1>
          ${lead.summary ? `<p>${esc(lead.summary)}</p>` : ""}
          ${byline(lead)}
        </div>
      </article>
      <div class="hero-side">${side.map((i) => card(i, "card-compact")).join("")}</div>`;

    $("#latest-news").innerHTML = news.filter((i) => !shown.has(i)).slice(0, 8).map(newsRow).join("") || emptyMsg(feed);
    $("#latest-analysis").innerHTML = analysis.filter((i) => !shown.has(i)).slice(0, 3).map((i) => card(i, "card-row card-row-sm")).join("")
      || `<p class="empty">More analysis soon.</p>`;
    $("#latest-episodes").innerHTML = latestEpisodes().slice(0, 3).map(episodeRow).join("");
    $("#updated").textContent = updatedText(feed);

    $("#topics").innerHTML = Object.entries(CATEGORIES)
      .filter(([k]) => k !== "general")
      .map(([k, c]) => {
        const n = items.filter((i) => i.category === k).length;
        return `<a class="topic" href="news.html?cat=${k}" style="--c:${c.color}">${cover(k, "cover-sm")}<span>${esc(c.label)}</span><small>${n} ${n === 1 ? "story" : "stories"}</small></a>`;
      })
      .join("");
  }

  function renderListing(feed, fixedKind) {
    const params = new URLSearchParams(location.search);
    let active = params.get("cat") || "all";
    let query = params.get("q") || "";
    let kind = fixedKind || params.get("type") || "all";
    let source = params.get("source") || "all";
    const pool = feed.items.filter((i) => !fixedKind || i.kind === fixedKind);
    const list = $("#listing");
    const search = $("#search");
    const filters = $("#filters");
    const types = $("#types");
    const sources = $("#sources");

    filters.innerHTML = [["all", "All topics"], ...Object.entries(CATEGORIES).map(([k, c]) => [k, c.label])]
      .filter(([k]) => k === "all" || k === active || pool.some((i) => i.category === k))
      .map(([k, label]) => `<button class="chip" data-cat="${k}" style="--c:${k === "all" ? "var(--accent)" : cat(k).color}">${esc(label)}</button>`)
      .join("");
    if (types) {
      types.innerHTML = [["all", "All"], ["news", "News"], ["analysis", "Analysis"]]
        .map(([k, label]) => `<button data-type="${k}">${label}</button>`).join("");
      types.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (b) { kind = b.dataset.type; draw(); }
      });
    }
    const names = [...new Set(pool.map((i) => i.source))].sort();
    sources.innerHTML = `<option value="all">All sources</option>` + names.map((n) => `<option>${esc(n)}</option>`).join("");
    if (!names.includes(source)) source = "all";
    sources.value = source;
    sources.addEventListener("change", () => { source = sources.value; draw(); });
    search.value = query;
    $("#updated").textContent = updatedText(feed);

    function draw() {
      filters.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === active)));
      types?.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.type === kind)));
      const q = query.trim().toLowerCase();
      const items = pool
        .filter((i) => kind === "all" || i.kind === kind)
        .filter((i) => active === "all" || i.category === active)
        .filter((i) => source === "all" || i.source === source)
        .filter((i) => !q || [i.title, i.summary, i.author, i.source, cat(i.category).label].join(" ").toLowerCase().includes(q));
      list.innerHTML = items.length
        ? items.map((i) => card(i, "card-row")).join("")
        : pool.length ? `<p class="empty">No stories match${q ? ` “${esc(query)}”` : ""}. Try another search, topic or source.</p>` : emptyMsg(feed);
      $("#result-count").textContent = `${items.length} ${items.length === 1 ? "story" : "stories"}`;
      const url = new URL(location.href);
      const set = (k, v, def) => (v === def || !v ? url.searchParams.delete(k) : url.searchParams.set(k, v));
      set("cat", active, "all"); set("q", q && query, ""); set("source", source, "all");
      if (!fixedKind) set("type", kind, "all");
      history.replaceState(null, "", url);
    }

    filters.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (b) { active = b.dataset.cat; draw(); }
    });
    search.addEventListener("input", () => { query = search.value; draw(); });
    draw();
  }

  function renderPodcasts() {
    $("#episodes").innerHTML = latestEpisodes().map(episodeRow).join("");
    $("#recommended").innerHTML = RECOMMENDED_PODCASTS.map(showCard).join("");
  }

  function renderAbout(feed) {
    const list = feed.sources || [];
    $("#source-list").innerHTML = list.length
      ? list.map((s) => `<li class="source-item">
          <a href="${esc(s.site)}" ${newTab}><strong>${esc(s.name)}</strong> ↗</a>
          <span>${s.kind === "analysis" ? "Analysis" : "News"} · ${s.count} ${s.count === 1 ? "story" : "stories"} now${s.ok ? "" : " · feed temporarily unavailable"}</span>
        </li>`).join("")
      : emptyMsg(feed);
    $("#podcast-list").innerHTML = RECOMMENDED_PODCASTS.map((s) =>
      `<li class="source-item"><a href="${spotifyShow(s.id)}" ${newTab}><strong>${esc(s.name)}</strong> ↗</a><span>${esc(s.publisher)}</span></li>`).join("");
    $("#updated").textContent = updatedText(feed);
  }

  /* ---------- boot ---------- */
  renderChrome();
  wireEmbeds();
  if (page === "podcasts") loadArt().then(renderPodcasts);
  if (page === "home") renderBriefing();
  if (["home", "news", "articles", "about"].includes(page)) {
    Promise.all([loadFeed(), page === "home" ? loadArt() : null]).then(([feed]) => {
      if (page === "home") renderHome(feed);
      if (page === "news") renderListing(feed, null);
      if (page === "articles") renderListing(feed, "analysis");
      if (page === "about") renderAbout(feed);
    });
  }
})();
