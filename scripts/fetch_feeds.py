#!/usr/bin/env python3
"""Collect headlines from energy publications' RSS/Atom feeds into assets/data/feeds.json.

Only the headline, link, date, author and a short summary are kept; readers click through to
the publisher for the full story. Each item is tagged with a topic by keyword so the site can
filter by Solar, Wind, Nuclear and so on. If a feed fails, its previous headlines are kept.

Standard library only, so it runs on any GitHub Actions runner.

Usage:
  python3 scripts/fetch_feeds.py                      # fetch every source
  python3 scripts/fetch_feeds.py --test NAME FILE     # parse a saved feed file as source NAME (no network)
"""
import gzip
import html
import html.entities
import zlib
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "data" / "feeds.json"
PER_SOURCE = 12
SUMMARY_CHARS = 240

# kind: "news" (timely reporting), "analysis" (explainers, data, long-form) or "world"
# (geopolitics & international development; tagged with the source's own "category").
# "feed" may be a list of candidate URLs; the first that works is used.
SOURCES = [
    {"name": "Utility Dive", "site": "https://www.utilitydive.com/", "feed": "https://www.utilitydive.com/feeds/news/", "kind": "news"},
    {"name": "pv magazine", "site": "https://www.pv-magazine.com/", "feed": "https://www.pv-magazine.com/feed/", "kind": "news"},
    {"name": "Energy-Storage.news", "site": "https://www.energy-storage.news/", "feed": "https://www.energy-storage.news/feed/", "kind": "news"},
    {"name": "Carbon Brief", "site": "https://www.carbonbrief.org/", "feed": "https://www.carbonbrief.org/feed/", "kind": "analysis"},
    {"name": "EIA Today in Energy", "site": "https://www.eia.gov/todayinenergy/", "feed": "https://www.eia.gov/rss/todayinenergy.xml", "kind": "analysis"},
    {"name": "CTVC by Sightline Climate", "site": "https://www.ctvc.co/", "feed": "https://www.ctvc.co/rss/", "kind": "analysis"},
    {"name": "Canary Media", "site": "https://www.canarymedia.com/", "feed": "https://www.canarymedia.com/rss.rss", "kind": "analysis"},
    # World: geopolitics
    {"name": "Foreign Affairs", "site": "https://www.foreignaffairs.com/", "kind": "world", "category": "geopolitics",
     "feed": ["https://www.foreignaffairs.com/rss.xml"]},
    {"name": "Foreign Policy", "site": "https://foreignpolicy.com/", "kind": "world", "category": "geopolitics",
     "feed": ["https://foreignpolicy.com/feed/"]},
    {"name": "Council on Foreign Relations", "site": "https://www.cfr.org/", "kind": "world", "category": "geopolitics",
     "feed": ["https://www.cfr.org/rss.xml", "https://www.cfr.org/rss/publications", "https://feeds.cfr.org/publication"]},
    {"name": "Atlantic Council", "site": "https://www.atlanticcouncil.org/", "kind": "world", "category": "geopolitics",
     "feed": ["https://www.atlanticcouncil.org/feed/"]},
    {"name": "The Diplomat", "site": "https://thediplomat.com/", "kind": "world", "category": "geopolitics",
     "feed": ["https://thediplomat.com/feed/"]},
    {"name": "War on the Rocks", "site": "https://warontherocks.com/", "kind": "world", "category": "geopolitics",
     "feed": ["https://warontherocks.com/feed/"]},
    # World: international development
    {"name": "The New Humanitarian", "site": "https://www.thenewhumanitarian.org/", "kind": "world", "category": "development",
     "feed": ["https://www.thenewhumanitarian.org/rss/all.xml", "https://www.thenewhumanitarian.org/rss.xml"]},
    {"name": "UN News", "site": "https://news.un.org/", "kind": "world", "category": "development",
     "feed": ["https://news.un.org/feed/subscribe/en/news/all/rss.xml"]},
    {"name": "The Guardian: Global development", "site": "https://www.theguardian.com/global-development", "kind": "world", "category": "development",
     "feed": ["https://www.theguardian.com/global-development/rss"]},
    {"name": "Inter Press Service", "site": "https://www.ipsnews.net/", "kind": "world", "category": "development",
     "feed": ["https://www.ipsnews.net/feed/"]},
]

# Topic keywords (regex, case-insensitive unless noted). Title hits count triple.
TOPICS = {
    "solar": r"\bsolar\b|photovoltaic|\bpv\b|perovskite|rooftop",
    "wind": r"\bwind\b|turbines?\b|offshore wind|\bnacelle",
    "storage": r"batter(y|ies)|\bstorage\b|\bgrid\b|transmission|interconnect|\bvpp\b|virtual power plant|\bbess\b|substation|power lines?",
    "nuclear": r"nuclear|reactors?\b|\bsmrs?\b|uranium|fusion|fission",
    "oilgas": r"\boil\b|\bgas\b|\blng\b|crude|opec|petroleum|pipeline|drilling|refiner|shale|brent|\bwti\b",
    "ev": r"electric vehicles?|\bevs?\b|charging|chargers?|\btesla\b|e-bikes?|electric (car|truck|bus)",
    "policy": r"\bferc\b|\bdoe\b|\bepa\b|congress|senate|regulat|policy|legislat|\btariffs?\b|tax credits?|court|lawsuit|government|minister|\bbill\b|\blaw\b|cop\d+",
}
TOPIC_RE = {k: re.compile(v, re.I) for k, v in TOPICS.items()}

ATOM = "{http://www.w3.org/2005/Atom}"
DC = "{http://purl.org/dc/elements/1.1/}"


def clean(text):
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = html.unescape(text)
    text = re.sub(r"The post .{0,300}? appeared first on .{0,120}?\.?\s*$", "", text)  # WordPress footer
    return re.sub(r"\s+", " ", text).strip()


def shorten(text, n=SUMMARY_CHARS):
    if len(text) <= n:
        return text
    return text[:n].rsplit(" ", 1)[0].rstrip(",.;:-–") + "…"


def to_iso(value):
    if not value:
        return ""
    value = value.strip()
    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
    except (TypeError, ValueError, IndexError):
        pass
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).isoformat()
    except ValueError:
        return ""


def topic(title, summary):
    scores = {k: 3 * len(r.findall(title)) + len(r.findall(summary)) for k, r in TOPIC_RE.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "general"


XML_ENTITIES = {"amp", "lt", "gt", "quot", "apos"}


def tidy(raw, encoding=""):
    """Undo compression and replace HTML-only entities (&nbsp; etc.) that strict XML rejects."""
    if raw[:2] == b"\x1f\x8b" or encoding == "gzip":
        raw = gzip.decompress(raw)
    elif encoding == "deflate":
        raw = zlib.decompress(raw)
    raw = raw.lstrip(b"\xef\xbb\xbf \t\r\n")
    def fix(m):
        name = m.group(1).decode()
        if name in XML_ENTITIES:
            return m.group(0)
        ch = html.entities.html5.get(name + ";")
        return ch.encode() if ch else b""
    raw = re.sub(rb"&([A-Za-z][A-Za-z0-9]*);", fix, raw)
    return re.sub(rb"&(?!#?[A-Za-z0-9]+;)", b"&amp;", raw)  # bare "&" in text


def parse(xml_bytes, source):
    root = ET.fromstring(tidy(xml_bytes))
    entries = []
    for it in root.iter("item"):  # RSS 2.0
        entries.append({
            "title": it.findtext("title"),
            "url": (it.findtext("link") or "").strip(),
            "date": it.findtext("pubDate") or it.findtext(f"{DC}date"),
            "author": it.findtext(f"{DC}creator") or it.findtext("author"),
            "summary": it.findtext("description"),
        })
    for it in root.iter(f"{ATOM}entry"):  # Atom
        link = ""
        for l in it.findall(f"{ATOM}link"):
            if l.get("rel", "alternate") == "alternate":
                link = l.get("href", "")
                break
        entries.append({
            "title": it.findtext(f"{ATOM}title"),
            "url": link,
            "date": it.findtext(f"{ATOM}published") or it.findtext(f"{ATOM}updated"),
            "author": it.findtext(f"{ATOM}author/{ATOM}name"),
            "summary": it.findtext(f"{ATOM}summary") or it.findtext(f"{ATOM}content"),
        })

    items, seen = [], set()
    for e in entries:
        title, url = clean(e["title"]), e["url"]
        if not title or not url.startswith(("https://", "http://")) or url in seen:
            continue
        seen.add(url)
        summary = shorten(clean(e["summary"]))
        items.append({
            "title": title,
            "url": url,
            "date": to_iso(e["date"]),
            "author": clean(e["author"]),
            "summary": summary,
            "source": source["name"],
            "kind": source["kind"],
            "category": source.get("category") or topic(title, summary),
        })
    items.sort(key=lambda x: x["date"], reverse=True)
    return items[:PER_SOURCE]


def fetch(source):
    urls = source["feed"] if isinstance(source["feed"], list) else [source["feed"]]
    errors = []
    for url in urls:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/130.0 Safari/537.36 GridbaseFeedReader/1.0",
            "Accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
            "Accept-Language": "en",
        })
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                items = parse(tidy(r.read(), r.headers.get("Content-Encoding", "")), source)
            if items:
                return source, items, None
            errors.append(f"{url}: no items")
        except Exception as exc:  # network errors, HTTP errors, bad XML
            errors.append(f"{url}: {type(exc).__name__}: {exc}"[:150])
    return source, [], " | ".join(errors)[:400] or "no feed URL"


def main():
    if len(sys.argv) == 4 and sys.argv[1] == "--test":
        src = next(s for s in SOURCES if s["name"] == sys.argv[2])
        print(json.dumps(parse(Path(sys.argv[3]).read_bytes(), src), indent=2, ensure_ascii=False))
        return

    old = json.loads(OUT.read_text()) if OUT.exists() else {}
    old_items = old.get("items", [])

    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(fetch, SOURCES))

    items, status = [], []
    for source, fresh, error in results:
        kept = fresh or [i for i in old_items if i.get("source") == source["name"]]
        items += kept
        status.append({
            "name": source["name"], "site": source["site"], "kind": source["kind"],
            "ok": bool(fresh), "count": len(kept), **({"error": error} if error else {}),
        })
        print(f"{'OK  ' if fresh else 'FAIL'} {source['name']}: {len(fresh)} new"
              + (f" ({error}); kept {len(kept)} previous" if error else ""))

    if not any(s["ok"] for s in status):
        sys.exit("Every feed failed; leaving existing data untouched.")

    items.sort(key=lambda x: x["date"], reverse=True)
    if old.get("items") == items and [s["ok"] for s in old.get("sources", [])] == [s["ok"] for s in status]:
        print("No changes.")
        return
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "fetchedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "sources": status,
        "items": items,
    }, indent=2, ensure_ascii=False) + "\n")
    print(f"Saved {len(items)} items from {sum(s['ok'] for s in status)}/{len(status)} sources.")


if __name__ == "__main__":
    main()
