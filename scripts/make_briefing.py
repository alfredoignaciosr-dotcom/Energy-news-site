#!/usr/bin/env python3
"""Write an AI-generated briefing of the day's top energy stories to assets/data/briefing.json.

Reads assets/data/feeds.json (written by fetch_feeds.py), sends the most recent headlines and
summaries to Claude, and asks for a short briefing in which every point cites the stories it
came from. The site links each point to those original articles.

Needs the ANTHROPIC_API_KEY environment variable (a GitHub Actions secret). Without it the
script exits quietly and the site keeps showing the last briefing (or none).
"""
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FEEDS = ROOT / "assets" / "data" / "feeds.json"
OUT = ROOT / "assets" / "data" / "briefing.json"
MODEL = "claude-opus-5-5"
MAX_STORIES = 60

SYSTEM = """You are the editor of an energy news site. You write a short daily briefing of the most \
important energy stories for busy readers.

Rules:
- Use only the facts in the stories you are given. Never add numbers, names, dates or claims that \
are not in them, and never speculate.
- Choose the 4 to 6 most significant developments across the energy sector (power and utilities, \
renewables, storage, nuclear, oil and gas, transport, policy, climate tech). Prefer stories with \
broad impact over niche ones, and combine stories that cover the same development.
- Each point gets a short headline (under 10 words) and one or two plain-language sentences.
- Cite the story ids each point is based on. Every point must cite at least one id from the list.
- The intro is one sentence that captures the day's overall theme.
- Write in neutral, factual news style. No hype, no opinions."""

SCHEMA = {
    "type": "object",
    "properties": {
        "intro": {"type": "string"},
        "points": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "headline": {"type": "string"},
                    "text": {"type": "string"},
                    "story_ids": {"type": "array", "items": {"type": "integer"}},
                },
                "required": ["headline", "text", "story_ids"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["intro", "points"],
    "additionalProperties": False,
}


def pick_stories(items):
    """The last ~36 hours of stories, or the newest MAX_STORIES if the news is quiet."""
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=36)).isoformat()
    recent = [i for i in items if i.get("date", "") >= cutoff]
    if len(recent) < 15:
        recent = items
    return sorted(recent, key=lambda i: i.get("date", ""), reverse=True)[:MAX_STORIES]


def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY is not set; skipping the briefing.")
        return

    import anthropic  # installed by the workflow (pip install anthropic)

    feed = json.loads(FEEDS.read_text())
    stories = pick_stories(feed.get("items", []))
    if not stories:
        print("No stories to summarize.")
        return

    listing = "\n\n".join(
        f"[{n}] {s['source']} ({s.get('date', '')[:10]}): {s['title']}\n{s.get('summary', '')}"
        for n, s in enumerate(stories)
    )
    client = anthropic.Anthropic()
    try:
        response = client.beta.messages.create(
            model=MODEL,
            max_tokens=16000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            output_config={"effort": "medium", "format": {"type": "json_schema", "schema": SCHEMA}},
            system=SYSTEM,
            messages=[{"role": "user", "content": f"Today's stories:\n\n{listing}\n\nWrite the briefing."}],
        )
    except anthropic.AuthenticationError:
        sys.exit("The ANTHROPIC_API_KEY secret was rejected; keeping the previous briefing.")
    except anthropic.RateLimitError:
        print("Rate limited; keeping the previous briefing until the next refresh.")
        return
    except anthropic.APIStatusError as e:
        print(f"API error {e.status_code}; keeping the previous briefing.")
        return
    except anthropic.APIConnectionError:
        print("Could not reach the API; keeping the previous briefing.")
        return

    if response.stop_reason != "end_turn":
        print(f"No briefing written (stop_reason={response.stop_reason}); keeping the previous one.")
        return
    text = next(b.text for b in response.content if b.type == "text")
    data = json.loads(text)

    points = []
    for p in data["points"]:
        cited = [stories[i] for i in dict.fromkeys(p["story_ids"]) if 0 <= i < len(stories)]
        if not cited:
            continue  # drop any point that isn't backed by a real story
        points.append({
            "headline": p["headline"].strip(),
            "text": p["text"].strip(),
            "stories": [{"title": s["title"], "url": s["url"], "source": s["source"]} for s in cited],
        })
    if not points:
        print("The briefing had no usable points; keeping the previous one.")
        return

    OUT.write_text(json.dumps({
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "model": response.model,
        "storiesConsidered": len(stories),
        "intro": data["intro"].strip(),
        "points": points,
    }, indent=2, ensure_ascii=False) + "\n")
    print(f"Saved a briefing with {len(points)} points from {len(stories)} stories.")


if __name__ == "__main__":
    main()
