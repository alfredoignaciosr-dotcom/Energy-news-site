/* Gridline — shared rendering for every page. Content comes from data.js. */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = (iso) =>
    new Date(iso + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const byDate = (a, b) => b.date.localeCompare(a.date);
  const cat = (key) => CATEGORIES[key] || { label: key, color: "#888" };
  const author = (key) => AUTHORS[key] || { name: key, role: "" };
  const page = document.body.dataset.page;

  const ICONS = {
    solar: '<circle cx="32" cy="32" r="11"/><g stroke-linecap="round"><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M15 49l6-6M43 21l6-6"/></g>',
    wind: '<path d="M32 30v28M26 58h12"/><path d="M32 30 30 8c4 0 7 2 7 6l-5 16zM32 30l20 10c-2 3-6 4-9 2L32 30zM32 30 12 40c-1-4 1-7 4-8l16-2z"/>',
    storage: '<rect x="14" y="18" width="34" height="30" rx="4"/><path d="M48 28h4v10h-4M30 24l-6 12h8l-4 10"/>',
    nuclear: '<circle cx="32" cy="32" r="4"/><ellipse cx="32" cy="32" rx="22" ry="8"/><ellipse cx="32" cy="32" rx="22" ry="8" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="22" ry="8" transform="rotate(-60 32 32)"/>',
    oilgas: '<path d="M32 10C26 22 20 29 20 38a12 12 0 0 0 24 0c0-9-6-16-12-28z"/>',
    ev: '<path d="M12 40l4-12c1-3 3-4 6-4h20c3 0 5 1 6 4l4 12v8H12z"/><circle cx="22" cy="48" r="4"/><circle cx="42" cy="48" r="4"/><path d="M33 28l-4 7h6l-4 7"/>',
    policy: '<path d="M32 10v44M20 54h24M14 20h36M14 20l-6 14a7 7 0 0 0 12 0zM50 20l-6 14a7 7 0 0 0 12 0z"/>',
  };

  function cover(key, extraClass = "") {
    const c = cat(key);
    return `<div class="cover ${extraClass}" style="--c:${c.color}" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">${ICONS[key] || ""}</svg>
    </div>`;
  }

  const tag = (key) =>
    `<a class="tag" href="news.html?cat=${encodeURIComponent(key)}" style="--c:${cat(key).color}">${esc(cat(key).label)}</a>`;

  const postUrl = (p) => `article.html?id=${encodeURIComponent(p.id)}`;

  function card(p, variant = "") {
    return `<article class="card ${variant}">
      <a href="${postUrl(p)}" class="card-media" tabindex="-1" aria-hidden="true">${cover(p.category)}</a>
      <div class="card-body">
        <div class="meta">${tag(p.category)}<span>${p.type === "news" ? "News" : "Feature"}</span></div>
        <h3><a href="${postUrl(p)}">${esc(p.title)}</a></h3>
        <p>${esc(p.excerpt)}</p>
        <div class="byline">${esc(author(p.author).name)} · ${fmtDate(p.date)} · ${p.readMinutes} min read</div>
      </div>
    </article>`;
  }

  function newsRow(p) {
    return `<li class="news-row">
      <time datetime="${p.date}">${fmtDate(p.date)}</time>
      <div>${tag(p.category)}<a href="${postUrl(p)}">${esc(p.title)}</a></div>
    </li>`;
  }

  function episodeRow(ep) {
    return `<li class="episode" id="ep-${ep.number}">
      <button class="play-btn" data-ep="${ep.number}" aria-label="Play episode ${ep.number}: ${esc(ep.title)}">
        <svg viewBox="0 0 24 24" class="i-play"><path d="M8 5v14l11-7z"/></svg>
        <svg viewBox="0 0 24 24" class="i-pause"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
      </button>
      <div class="episode-info">
        <div class="meta">${tag(ep.category)}<span>Episode ${ep.number}</span><span>${fmtDate(ep.date)}</span><span>${esc(ep.duration)}</span></div>
        <h3>${esc(ep.title)}</h3>
        <p class="guest">With ${esc(ep.guest)}</p>
        <p>${esc(ep.summary)}</p>
      </div>
    </li>`;
  }


  /* ---------- recommended podcasts (Spotify) ---------- */
  const spotifyShow = (id) => `https://open.spotify.com/show/${encodeURIComponent(id)}`;
  function showCard(s) {
    const initials = s.name.split(/[\s:]+/).filter((w) => w && !/^(the|with|and|of|a)$/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
    return `<article class="show-card" style="--c:${cat(s.category).color}">
      <div class="show-top">
        <div class="show-mono" aria-hidden="true">${esc(initials)}</div>
        <div>
          <h3><a href="${spotifyShow(s.id)}" target="_blank" rel="noopener">${esc(s.name)}</a></h3>
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
        <button class="btn btn-sm load-embed" data-episode="${esc(s.latest.id)}" data-title="${esc(s.latest.title)}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>Play latest episode
        </button>
        <a class="btn-ghost btn-sm" href="${spotifyShow(s.id)}" target="_blank" rel="noopener">Open in Spotify ↗</a>
      </div>
    </article>`;
  }

  function wireEmbeds() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".load-embed");
      if (!b) return;
      const slot = b.closest(".show-card").querySelector(".embed-slot");
      slot.innerHTML = `<iframe title="Spotify player: ${b.dataset.title}" src="https://open.spotify.com/embed/episode/${encodeURIComponent(b.dataset.episode)}?utm_source=generator"
        height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
      b.remove();
    });
  }


  /* ---------- external headlines (Utility Dive, refreshed by a GitHub Action) ---------- */
  async function renderExternalNews() {
    const slots = document.querySelectorAll("[data-external-news]");
    if (!slots.length) return;
    let feed;
    try {
      const res = await fetch("assets/data/utilitydive.json", { cache: "no-cache" });
      feed = await res.json();
    } catch (e) { return; }
    if (!feed.items || !feed.items.length) return;
    const when = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    slots.forEach((slot) => {
      const limit = Number(slot.dataset.limit) || feed.items.length;
      slot.querySelector(".ext-list").innerHTML = feed.items.slice(0, limit).map((it) => `
        <li class="ext-item">
          <a href="${esc(it.url)}" target="_blank" rel="noopener">
            <span class="ext-meta">${it.date ? `<time datetime="${esc(it.date)}">${when(it.date)}</time>` : ""}${it.author ? ` · ${esc(it.author)}` : ""}</span>
            <strong>${esc(it.title)}</strong>
            ${slot.dataset.summaries !== undefined && it.summary ? `<span class="ext-summary">${esc(it.summary)}</span>` : ""}
          </a>
        </li>`).join("");
      const updated = slot.querySelector(".ext-updated");
      if (updated && feed.fetchedAt) updated.textContent = `Updated ${new Date(feed.fetchedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
      slot.hidden = false;
    });
  }

  /* ---------- layout: header & footer ---------- */
  function renderChrome() {
    const nav = [
      ["index.html", "Home", "home"],
      ["news.html", "News", "news"],
      ["articles.html", "Articles", "articles"],
      ["podcasts.html", "Podcast", "podcasts"],
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
        ${nav.map(([href, label, key]) => `<a href="${href}"${key === page || (page === "article" && key === "articles") ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
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
        <h4>Sections</h4>
        ${Object.entries(CATEGORIES).map(([k, c]) => `<a href="news.html?cat=${k}">${esc(c.label)}</a>`).join("")}
      </div>
      <div>
        <h4>Listen</h4>
        <a href="podcasts.html">${esc(PODCAST.title)}</a>
        ${PODCAST.links.map((l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join("")}
      </div>
    </div>
    <div class="wrap footer-bottom">© ${new Date().getFullYear()} ${esc(SITE.name)}. All rights reserved.</div>`;
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

  /* ---------- newsletter (front-end only) ---------- */
  function wireNewsletter() {
    document.querySelectorAll(".newsletter-form").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = form.querySelector("input[type=email]");
        if (!email.checkValidity()) { email.reportValidity(); return; }
        // Hook up your mailing-list provider here (Mailchimp, Buttondown, ConvertKit…).
        form.innerHTML = `<p class="form-success">Thanks! You're on the list.</p>`;
      });
    });
  }

  /* ---------- pages ---------- */
  function renderHome() {
    const posts = [...POSTS].sort(byDate);
    const featured = posts.filter((p) => p.featured);
    const lead = featured[0] || posts[0];
    const side = featured.filter((p) => p !== lead).slice(0, 2);

    $("#hero").innerHTML = `
      <article class="lead">
        <a href="${postUrl(lead)}" class="lead-media" tabindex="-1" aria-hidden="true">${cover(lead.category, "cover-lg")}</a>
        <div class="lead-body">
          <div class="meta">${tag(lead.category)}<span>Featured</span></div>
          <h1><a href="${postUrl(lead)}">${esc(lead.title)}</a></h1>
          <p>${esc(lead.excerpt)}</p>
          <div class="byline">${esc(author(lead.author).name)} · ${fmtDate(lead.date)} · ${lead.readMinutes} min read</div>
        </div>
      </article>
      <div class="hero-side">${side.map((p) => card(p, "card-compact")).join("")}</div>`;

    $("#latest-news").innerHTML = posts.filter((p) => p.type === "news").slice(0, 6).map(newsRow).join("");
    $("#latest-articles").innerHTML = posts.filter((p) => p.type === "article" && !side.includes(p) && p !== lead).slice(0, 3).map((p) => card(p, "card-row card-row-sm")).join("");
    $("#latest-episodes").innerHTML = [...EPISODES].sort(byDate).slice(0, 3).map(episodeRow).join("");

    const picks = $("#recommended-home");
    if (picks) picks.innerHTML = [...RECOMMENDED_PODCASTS].sort((a, b) => b.latest.date.localeCompare(a.latest.date)).slice(0, 3).map(showCard).join("");

    $("#topics").innerHTML = Object.entries(CATEGORIES)
      .map(([k, c]) => {
        const n = POSTS.filter((p) => p.category === k).length;
        return `<a class="topic" href="news.html?cat=${k}" style="--c:${c.color}">${cover(k, "cover-sm")}<span>${esc(c.label)}</span><small>${n} ${n === 1 ? "story" : "stories"}</small></a>`;
      })
      .join("");
  }

  function renderListing(fixedType) {
    const params = new URLSearchParams(location.search);
    let active = params.get("cat") || "all";
    let query = params.get("q") || "";
    let type = fixedType || params.get("type") || "all";
    const list = $("#listing");
    const search = $("#search");
    const filters = $("#filters");
    const types = $("#types");

    filters.innerHTML = [["all", "All topics"], ...Object.entries(CATEGORIES).map(([k, c]) => [k, c.label])]
      .map(([k, label]) => `<button class="chip" data-cat="${k}" style="--c:${k === "all" ? "var(--accent)" : cat(k).color}">${esc(label)}</button>`)
      .join("");
    if (types) {
      types.innerHTML = [["all", "All"], ["news", "News"], ["article", "Features"]]
        .map(([k, label]) => `<button data-type="${k}">${label}</button>`).join("");
      types.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (b) { type = b.dataset.type; draw(); }
      });
    }
    search.value = query;

    function draw() {
      filters.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === active)));
      types?.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.type === type)));
      const q = query.trim().toLowerCase();
      const items = POSTS
        .filter((p) => type === "all" || p.type === type)
        .filter((p) => active === "all" || p.category === active)
        .filter((p) => !q || [p.title, p.excerpt, author(p.author).name, cat(p.category).label].join(" ").toLowerCase().includes(q))
        .sort(byDate);
      list.innerHTML = items.length
        ? items.map((p) => card(p, "card-row")).join("")
        : `<p class="empty">No stories match${q ? ` “${esc(query)}”` : ""}. Try another search or topic.</p>`;
      $("#result-count").textContent = `${items.length} ${items.length === 1 ? "story" : "stories"}`;
      const url = new URL(location.href);
      const set = (k, v, def) => (v === def || !v ? url.searchParams.delete(k) : url.searchParams.set(k, v));
      set("cat", active, "all"); set("q", q && query, ""); if (!fixedType) set("type", type, "all");
      history.replaceState(null, "", url);
    }

    filters.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (b) { active = b.dataset.cat; draw(); }
    });
    search.addEventListener("input", () => { query = search.value; draw(); });
    draw();
  }

  function renderArticle() {
    const id = new URLSearchParams(location.search).get("id");
    const p = POSTS.find((x) => x.id === id);
    const root = $("#article");
    if (!p) {
      root.innerHTML = `<div class="empty"><h1>Story not found</h1><p>It may have moved. <a href="articles.html">Browse all articles</a>.</p></div>`;
      return;
    }
    document.title = `${p.title} — ${SITE.name}`;
    const a = author(p.author);
    const body = p.body
      .map((para) => {
        if (para.startsWith("## ")) return `<h2>${esc(para.slice(3))}</h2>`;
        if (para.startsWith("> ")) return `<blockquote>${esc(para.slice(2))}</blockquote>`;
        return `<p>${esc(para)}</p>`;
      })
      .join("");
    const related = POSTS.filter((x) => x !== p && x.category === p.category)
      .concat(POSTS.filter((x) => x !== p && x.category !== p.category))
      .slice(0, 3);

    root.innerHTML = `
      <header class="article-head">
        <div class="meta">${tag(p.category)}<span>${p.type === "news" ? "News" : "Feature"}</span></div>
        <h1>${esc(p.title)}</h1>
        <p class="dek">${esc(p.excerpt)}</p>
        <div class="author-line">
          <span class="avatar" aria-hidden="true">${esc(a.name.split(" ").map((w) => w[0]).join(""))}</span>
          <div><strong>${esc(a.name)}</strong><span>${esc(a.role)}</span></div>
          <span class="dot-sep">${fmtDate(p.date)} · ${p.readMinutes} min read</span>
        </div>
      </header>
      ${cover(p.category, "cover-xl")}
      <div class="prose">${body}</div>
      <div class="share">
        <span>Share</span>
        <button class="btn-ghost" id="copy-link">Copy link</button>
      </div>`;
    $("#related").innerHTML = related.map((x) => card(x)).join("");
    $("#copy-link").addEventListener("click", async (e) => {
      try { await navigator.clipboard.writeText(location.href); e.target.textContent = "Copied!"; }
      catch { e.target.textContent = "Copy failed"; }
    });
  }

  function renderPodcasts() {
    $("#show-hosts").textContent = `Hosted by ${PODCAST.hosts.join(" & ")}`;
    $("#show-desc").textContent = PODCAST.description;
    $("#show-links").innerHTML = PODCAST.links.map((l) => `<a class="btn-ghost" href="${esc(l.url)}">${esc(l.label)}</a>`).join("");
    $("#episodes").innerHTML = [...EPISODES].sort(byDate).map(episodeRow).join("");
    $("#recommended").innerHTML = RECOMMENDED_PODCASTS.map(showCard).join("");
    const hash = location.hash.match(/^#ep-(\d+)/);
    if (hash) $(`#ep-${hash[1]}`)?.classList.add("highlight");
  }

  /* ---------- audio player (shared, sticky) ---------- */
  function setupPlayer() {
    if (!document.querySelector(".play-btn")) return;
    const audio = new Audio();
    audio.preload = "none";
    let current = null;

    const bar = document.createElement("div");
    bar.className = "player";
    bar.hidden = true;
    bar.innerHTML = `<div class="wrap player-inner">
      <button class="play-btn player-toggle" aria-label="Play/pause">
        <svg viewBox="0 0 24 24" class="i-play"><path d="M8 5v14l11-7z"/></svg>
        <svg viewBox="0 0 24 24" class="i-pause"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
      </button>
      <div class="player-meta"><small id="player-ep"></small><strong id="player-title"></strong></div>
      <span class="time" id="player-cur">0:00</span>
      <input type="range" id="player-seek" min="0" max="100" value="0" step="0.1" aria-label="Seek">
      <span class="time" id="player-dur">0:00</span>
      <button class="btn-ghost speed" id="player-speed" aria-label="Playback speed">1×</button>
      <button class="icon-btn" id="player-close" aria-label="Close player">✕</button>
    </div>`;
    document.body.append(bar);

    const t = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
    const seek = $("#player-seek");

    function sync() {
      document.querySelectorAll(".play-btn").forEach((b) => {
        const mine = b.classList.contains("player-toggle") || Number(b.dataset.ep) === current?.number;
        b.classList.toggle("playing", mine && !audio.paused);
      });
    }

    function load(ep) {
      current = ep;
      audio.src = ep.audio;
      $("#player-ep").textContent = `Episode ${ep.number} · ${PODCAST.title}`;
      $("#player-title").textContent = ep.title;
      bar.hidden = false;
      document.body.classList.add("has-player");
    }

    document.addEventListener("click", (e) => {
      const b = e.target.closest(".play-btn");
      if (!b) return;
      if (!b.classList.contains("player-toggle")) {
        const ep = EPISODES.find((x) => x.number === Number(b.dataset.ep));
        if (ep !== current) { load(ep); audio.play(); return; }
      }
      audio.paused ? audio.play() : audio.pause();
    });

    ["play", "pause", "ended"].forEach((ev) => audio.addEventListener(ev, sync));
    audio.addEventListener("loadedmetadata", () => ($("#player-dur").textContent = t(audio.duration)));
    audio.addEventListener("timeupdate", () => {
      $("#player-cur").textContent = t(audio.currentTime);
      if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
    });
    audio.addEventListener("error", () => {
      $("#player-title").textContent = `${current?.title || ""} — audio unavailable`;
    });
    seek.addEventListener("input", () => { if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration; });

    const speeds = [1, 1.25, 1.5, 2];
    $("#player-speed").addEventListener("click", (e) => {
      audio.playbackRate = speeds[(speeds.indexOf(audio.playbackRate) + 1) % speeds.length];
      e.target.textContent = `${audio.playbackRate}×`;
    });
    $("#player-close").addEventListener("click", () => {
      audio.pause();
      bar.hidden = true;
      document.body.classList.remove("has-player");
    });
  }

  /* ---------- boot ---------- */
  renderChrome();
  if (page === "home") renderHome();
  if (page === "news") renderListing(null);
  if (page === "articles") renderListing("article");
  if (page === "article") renderArticle();
  if (page === "podcasts") renderPodcasts();
  setupPlayer();
  wireEmbeds();
  wireNewsletter();
  renderExternalNews();
})();
