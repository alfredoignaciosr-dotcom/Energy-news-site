#!/usr/bin/env python3
"""Write a short AI summary of each show's latest episode in assets/data/podcasts.json.

Uses the episode's show notes (saved by fetch_podcasts.py) and asks Claude for one or two
sentences. Each episode is summarized once: "summaryFor" records which episode title the
summary belongs to, and it is only rewritten when a new episode comes out.

Needs the ANTHROPIC_API_KEY environment variable (a GitHub Actions secret). Without it the
script exits quietly and the site simply shows no summaries.
"""
import json
import os
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "assets" / "data" / "podcasts.json"
MODEL = "claude-opus-5-5"
MIN_NOTES = 80  # characters; thinner show notes don't say enough to summarize

SYSTEM = """You write one-line episode summaries for a podcast listings page on an energy and \
world-affairs news site.

Rules:
- One or two sentences, at most 45 words, in plain present-tense English \
(e.g. "Guests from X and Y discuss ...").
- Use only facts from the show notes you are given. Never add names, numbers or claims that \
are not in them.
- Leave out sponsors, ads, promo codes, subscription pitches, social links and credits.
- No hype and no opinions. Don't start with "In this episode".
- If the notes don't say what the episode is about, reply with exactly: SKIP"""


def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY is not set; skipping episode summaries.")
        return

    import anthropic  # installed by the workflow (pip install anthropic)

    data = json.loads(DATA.read_text())
    todo = [s for s in data["shows"]
            if s.get("latest", {}).get("summaryFor") != s.get("latest", {}).get("title")
            and len(s.get("latest", {}).get("notes", "")) >= MIN_NOTES]
    if not todo:
        print("No new episodes to summarize.")
        return

    client = anthropic.Anthropic()
    done = 0
    for show in todo:
        ep = show["latest"]
        prompt = f"Podcast: {show['name']} ({show['publisher']})\nEpisode: {ep['title']}\n\nShow notes:\n{ep['notes']}"
        try:
            response = client.beta.messages.create(
                model=MODEL,
                max_tokens=4000,
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
                output_config={"effort": "low"},
                system=SYSTEM,
                messages=[{"role": "user", "content": prompt}],
            )
        except anthropic.AuthenticationError:
            sys.exit("The ANTHROPIC_API_KEY secret was rejected.")
        except anthropic.RateLimitError:
            print("Rate limited; the rest will be summarized on the next refresh.")
            break
        except (anthropic.APIStatusError, anthropic.APIConnectionError) as e:
            print(f"FAIL {show['name']}: {type(e).__name__}; will retry next refresh.")
            continue

        if response.stop_reason != "end_turn":
            print(f"SKIP {show['name']}: stop_reason={response.stop_reason}")
            continue
        text = " ".join(b.text for b in response.content if b.type == "text").strip()
        summary = "" if text == "SKIP" or len(text) > 400 else text
        ep["summary"], ep["summaryFor"] = summary, ep["title"]  # don't retry this episode
        done += 1
        print(f"OK   {show['name']}: {summary or '(notes too thin; no summary)'}")

    if done:
        DATA.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print(f"Saved {done} summaries.")


if __name__ == "__main__":
    main()
