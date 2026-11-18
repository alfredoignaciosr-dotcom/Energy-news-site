#!/usr/bin/env python3
"""Refresh the latest episode of every show in assets/data/podcasts.json.

For each show:
  1. If it has no "feed" yet, find its public RSS feed through Apple's free podcast directory
     (iTunes Search API, no key) by matching the show name, and save it. To pin a feed by hand,
     set "feed" yourself and it will be used as-is.
  2. Read the feed and store the newest episode's title, date and cover image in "latest".
  3. Store the show's cover from Spotify in "artwork" (small, reliable image; used first on the site).
If anything fails for a show, its previous details are kept. Standard library only.
"""
import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "data" / "podcasts.json"
UA = {"User-Agent": "Mozilla/5.0 (compatible; GridbaseFeedReader/1.0)"}
ITUNES = "{http://www.itunes.com/dtds/podcast-1.0.dtd}"
CONTENT = "{http://purl.org/rss/1.0/modules/content/}"


def get(url, timeout=30):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read()


def spotify_cover(spotify_id):
    """Show cover from Spotify's public oEmbed endpoint (small image on Spotify's CDN, no key)."""
    url = "https://open.spotify.com/oembed?url=" + urllib.parse.quote(
        f"https://open.spotify.com/show/{spotify_id}", safe="")
    thumb = json.loads(get(url, timeout=20)).get("thumbnail_url", "")
    return thumb if thumb.startswith("https://") else ""


def norm(s):
    s = re.sub(r"[^a-z0-9 ]+", " ", html.unescape(s or "").lower())
    return " ".join(w for w in s.split() if w != "the")


def find_feed(show):
    want, pub = norm(show["name"]), set(norm(show.get("publisher")).split())
    best, best_score = None, 0
    for term in (show["name"], f"{show['name']} {show.get('publisher', '')}"):
        q = urllib.parse.urlencode({"term": term, "media": "podcast", "entity": "podcast", "limit": 25})
        for r in json.loads(get(f"https://itunes.apple.com/search?{q}")).get("results", []):
            name, feed = norm(r.get("collectionName")), r.get("feedUrl", "")
            if not feed:
                continue
            score = (3 if name == want else 2 if name.startswith(want) or want.startswith(name)
                     else 1 if want in name or name in want else 0)
            if score and pub & set(norm(r.get("artistName")).split()):
                score += 2  # publisher matches too
            if score > best_score:
                best, best_score = feed, score
        if best_score >= 3:
            break
    return best


def latest_episode(feed_url):
    root = ET.fromstring(get(feed_url))
    channel = root.find("channel")
    show_img = ""
    if channel is not None:
        el = channel.find(f"{ITUNES}image")
        show_img = (el.get("href") if el is not None else "") or channel.findtext("image/url", "")
    newest, newest_date = None, ""
    for it in root.iter("item"):
        try:
            d = parsedate_to_datetime(it.findtext("pubDate", "")).astimezone(timezone.utc).date().isoformat()
        except (TypeError, ValueError, IndexError):
            continue
        if d > newest_date:
            newest, newest_date = it, d
    if newest is None:
        return None
    el = newest.find(f"{ITUNES}image")
    image = (el.get("href") if el is not None else "") or show_img
    title = re.sub(r"\s+", " ", html.unescape(newest.findtext("title", ""))).strip()
    if not title:
        return None
    # Show notes, used for the AI summary (scripts/summarize_episodes.py).
    notes = (newest.findtext(f"{CONTENT}encoded") or newest.findtext("description")
             or newest.findtext(f"{ITUNES}summary") or "")
    notes = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", notes))).strip()[:4000]
    return {"title": title, "date": newest_date, "image": image if image.startswith("https://") else "",
            "notes": notes}


def main():
    data = json.loads(OUT.read_text())
    before = json.dumps(data["shows"])
    for show in data["shows"]:
        try:
            show["artwork"] = spotify_cover(show["spotifyId"]) or show.get("artwork", "")
        except Exception as exc:
            print(f"FAIL {show['name']} cover: {type(exc).__name__}: {exc}"[:200])
        try:
            if not show.get("feed"):
                show["feed"] = find_feed(show) or ""
                print(f"{show['name']}: feed {'found ' + show['feed'] if show['feed'] else 'NOT FOUND'}")
            if show["feed"]:
                ep = latest_episode(show["feed"])
                if ep:
                    old = show.get("latest", {})
                    new = {**ep, "image": ep["image"] or old.get("image", "")}
                    if old.get("summaryFor") == ep["title"]:  # same episode: keep its AI summary
                        new.update(summary=old.get("summary", ""), summaryFor=old["summaryFor"])
                    show["latest"] = new
                    print(f"OK   {show['name']}: {ep['date']} {ep['title'][:70]}")
                else:
                    print(f"FAIL {show['name']}: no episodes in feed")
        except Exception as exc:
            print(f"FAIL {show['name']}: {type(exc).__name__}: {exc}"[:200])
    if json.dumps(data["shows"]) != before:
        from datetime import datetime
        data["updatedAt"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print("Saved podcasts.json")
    else:
        print("No changes.")


if __name__ == "__main__":
    main()
