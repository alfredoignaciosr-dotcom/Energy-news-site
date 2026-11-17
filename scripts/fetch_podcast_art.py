#!/usr/bin/env python3
"""Look up the cover image of each podcast episode listed in assets/js/data.js.

Uses Spotify's public oEmbed endpoint (no API key) and writes
assets/data/podcast-art.json as {"<episode id>": "<image url>"}. Images keep being served from
Spotify's CDN. Episodes whose lookup fails keep their previous image, if any.
"""
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_JS = ROOT / "assets" / "js" / "data.js"
OUT = ROOT / "assets" / "data" / "podcast-art.json"


def episode_ids():
    return re.findall(r'latest:\s*\{\s*id:\s*"([A-Za-z0-9]+)"', DATA_JS.read_text())


def thumbnail(episode_id):
    url = "https://open.spotify.com/oembed?url=" + urllib.parse.quote(
        f"https://open.spotify.com/episode/{episode_id}", safe="")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; GridbaseFeedReader/1.0)"})
    with urllib.request.urlopen(req, timeout=20) as r:
        thumb = json.load(r).get("thumbnail_url", "")
    return thumb if thumb.startswith("https://") else ""


def main():
    old = json.loads(OUT.read_text()) if OUT.exists() else {}
    art = {}
    for eid in episode_ids():
        try:
            art[eid] = thumbnail(eid) or old.get(eid, "")
        except Exception as exc:
            print(f"FAIL {eid}: {type(exc).__name__}: {exc}"[:200])
            art[eid] = old.get(eid, "")
    art = {k: v for k, v in art.items() if v}
    if art != old:
        OUT.write_text(json.dumps(art, indent=2) + "\n")
    print(f"{len(art)} episode images.")


if __name__ == "__main__":
    main()
