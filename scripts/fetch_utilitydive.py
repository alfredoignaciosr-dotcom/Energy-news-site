#!/usr/bin/env python3
"""Fetch the Utility Dive news RSS feed and save headlines to assets/data/utilitydive.json.

Only headline, link, date, author and a short summary are stored; readers click through to
utilitydive.com for the full story. Standard library only, so it runs on any GitHub runner.

Usage: python3 scripts/fetch_utilitydive.py [--from-file feed.xml]
"""
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

FEED_URL = "https://www.utilitydive.com/feeds/news/"
OUT = Path(__file__).resolve().parent.parent / "assets" / "data" / "utilitydive.json"
MAX_ITEMS = 24
SUMMARY_CHARS = 240
DC = "{http://purl.org/dc/elements/1.1/}"


def clean(text):
    text = re.sub(r"<[^>]+>", " ", text or "")
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def shorten(text, n=SUMMARY_CHARS):
    if len(text) <= n:
        return text
    return text[:n].rsplit(" ", 1)[0].rstrip(",.;:") + "…"


def parse(xml_bytes):
    root = ET.fromstring(xml_bytes)
    items = []
    for it in root.iter("item"):
        title = clean(it.findtext("title"))
        link = (it.findtext("link") or "").strip()
        if not title or not link.startswith("https://"):
            continue
        date = ""
        if it.findtext("pubDate"):
            try:
                date = parsedate_to_datetime(it.findtext("pubDate")).astimezone(timezone.utc).isoformat()
            except (TypeError, ValueError):
                pass
        items.append({
            "title": title,
            "url": link,
            "date": date,
            "author": clean(it.findtext(f"{DC}creator") or it.findtext("author")),
            "summary": shorten(clean(it.findtext("description"))),
        })
    items.sort(key=lambda x: x["date"], reverse=True)
    return items[:MAX_ITEMS]


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--from-file":
        data = Path(sys.argv[2]).read_bytes()
    else:
        req = urllib.request.Request(FEED_URL, headers={
            "User-Agent": "Mozilla/5.0 (compatible; GridlineFeedReader/1.0)",
            "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        })
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()

    items = parse(data)
    if not items:
        # Keep the last good file rather than publishing an empty list.
        sys.exit("No items parsed from the feed; leaving existing data untouched.")

    old = json.loads(OUT.read_text()) if OUT.exists() else {}
    if old.get("items") == items:
        print("No new headlines.")
        return
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "source": "Utility Dive",
        "sourceUrl": "https://www.utilitydive.com/",
        "fetchedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "items": items,
    }, indent=2, ensure_ascii=False) + "\n")
    print(f"Saved {len(items)} headlines to {OUT}")


if __name__ == "__main__":
    main()
