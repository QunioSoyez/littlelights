"""
Import Mary A. Lathbury's "Child's Story of the Bible" (1898, public domain)
from the Project Gutenberg HTML edition (#25309) into Little Lights.

Usage (from the littlelights_app folder):
    python scripts/import-lathbury.py ../sources/lathbury/25309-h

Creates:
    src/content/lathbury.json          story text + picture captions
    src/content/lathburyImages.ts      require() map for the pictures (generated)
    assets/stories/*.jpg               pictures resized for the app

Extra pictures for stories with none in the book are listed in
scripts/lathbury-extras.json (caption + file). Missing files are skipped.

New art for book pictures: save it as sources/story-art/<picture>.jpg (e.g. img_015.jpg) and it is
used instead of the book's picture (same caption). Each run also rebuilds
sources/story-art/_checklist.html: every black-and-white book picture, its story and caption, and
whether new art is in yet.

Needs Python 3 with Pillow (pip install pillow). Safe to re-run.
"""
import html
import json
import os
import re
import sys

from PIL import Image, ImageStat

MAX_WIDTH = 900  # pixels; keeps the app small but sharp on tablets
QUALITY = 80

src_dir = sys.argv[1] if len(sys.argv) > 1 else "../sources/lathbury/25309-h"
app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_img_dir = os.path.join(app_dir, "assets", "stories")
out_content_dir = os.path.join(app_dir, "src", "content")
os.makedirs(out_img_dir, exist_ok=True)
os.makedirs(out_content_dir, exist_ok=True)

page = open(os.path.join(src_dir, "25309-h.htm"), encoding="latin-1").read()


def clean(fragment: str) -> str:
    """HTML fragment -> plain text on one line."""
    text = re.sub(r"<[^>]+>", "", fragment)
    text = html.unescape(text)
    text = text.replace(" ", " ")
    return re.sub(r"\s+", " ", text).strip()


# Story titles in normal capitalization come from the table of contents
toc = {m.group(1): clean(m.group(2)) for m in re.finditer(r'<A HREF="#(chap\d+)">(.*?)</A>', page, re.S | re.I)}

anchors = list(re.finditer(r'<A NAME="(chap\d+)"></A>', page, re.I))
stories = []
images_used = []

for i, anchor in enumerate(anchors):
    chap_id = anchor.group(1)
    if chap_id == "chap0249":  # the Afterword is not a story
        continue
    end = anchors[i + 1].start() if i + 1 < len(anchors) else len(page)
    body = page[anchor.end():end]

    testament = "ot" if chap_id.startswith("chap01") else "nt"
    number = int(chap_id[-2:])
    story = {
        "id": f"{testament}-{number:02d}",
        "testament": testament,
        "number": number,
        "title": toc.get(chap_id, ""),
        "blocks": [],
    }

    # Walk through paragraphs and pictures in the order they appear
    for m in re.finditer(r"<P>(.*?)</P>|<A NAME=\"(img-[^\"]+)\"></A>\s*<CENTER>(.*?)</CENTER>", body, re.S | re.I):
        if m.group(1) is not None:
            text = clean(m.group(1))
            if text:
                story["blocks"].append({"type": "text", "text": text})
        else:
            center = m.group(3)
            # Color plates show a small preview that links to the full picture: use the full one
            full = re.search(r'<A HREF="images/([^"]+)">', center, re.I)
            shown = re.search(r'SRC="images/([^"]+)"', center, re.I)
            file = (full or shown).group(1)
            caption = clean(re.search(r"<H3[^>]*>(.*?)</H3>", center, re.S | re.I).group(1)).rstrip(".")
            key = os.path.splitext(file)[0].replace("-", "_")
            story["blocks"].append({"type": "image", "image": key, "caption": caption})
            images_used.append((key, file))

    # Use the first picture in the story as its thumbnail in the story list
    first = next((b["image"] for b in story["blocks"] if b["type"] == "image"), None)
    story["thumbnail"] = first
    stories.append(story)

# Add extra pictures (scripts/lathbury-extras.json) to stories that have none,
# right after the story's first paragraph
sources_dir = os.path.dirname(os.path.dirname(os.path.abspath(src_dir)))  # ...\sources
extras = json.load(open(os.path.join(app_dir, "scripts", "lathbury-extras.json"), encoding="utf-8"))
extra_paths = {}
for story in stories:
    extra = extras.get(story["id"])
    if not extra or story["thumbnail"]:
        continue
    path = os.path.join(sources_dir, extra["file"])
    if not os.path.exists(path):
        print(f"  (no picture yet for {story['id']}: {extra['file']})")
        continue
    key = "extra_" + story["id"].replace("-", "_")
    story["blocks"].insert(1, {"type": "image", "image": key, "caption": extra["caption"]})
    story["thumbnail"] = key
    extra_paths[key] = path
    images_used.append((key, path))

# New art that replaces book pictures: sources/story-art/<key>.jpg (or .png)
art_dir = os.path.join(sources_dir, "story-art")
os.makedirs(art_dir, exist_ok=True)


def story_art(key):
    for ext in (".jpg", ".jpeg", ".png"):
        path = os.path.join(art_dir, key + ext)
        if os.path.exists(path):
            return path
    return None


# Resize pictures into the app, and remember their sizes so the reader can
# reserve the right space for each picture before it loads
sizes = {}
replaced = []
for key, file in images_used:
    dest = os.path.join(out_img_dir, key + ".jpg")
    new_art = story_art(key) if key not in extra_paths else None
    if new_art:
        replaced.append(key)
    im = Image.open(new_art or extra_paths.get(key) or os.path.join(src_dir, "images", file)).convert("RGB")
    if im.width > MAX_WIDTH:
        im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
    im.save(dest, quality=QUALITY, optimize=True, progressive=True)
    sizes[key] = im.size

for story in stories:
    for block in story["blocks"]:
        if block["type"] == "image":
            block["width"], block["height"] = sizes[block["image"]]

content = {
    "source": "Mary A. Lathbury, Child's Story of the Bible (1898). Public domain.",
    "stories": stories,
}
with open(os.path.join(out_content_dir, "lathbury.json"), "w", encoding="utf-8") as f:
    json.dump(content, f, ensure_ascii=False, indent=1)

# Pictures must be listed with require() so the app bundles them (works offline)
lines = [
    "// GENERATED by scripts/import-lathbury.py - do not edit by hand.",
    "import type { ImageSource } from \"expo-image\";",
    "",
    "export const lathburyImages: Record<string, ImageSource> = {",
]
for key, _ in sorted(set(images_used)):
    lines.append(f'  {key}: require("../../assets/stories/{key}.jpg"),')
lines.append("};")
with open(os.path.join(out_content_dir, "lathburyImages.ts"), "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

ot = sum(1 for s in stories if s["testament"] == "ot")
missing = [s["id"] for s in stories if not s["thumbnail"]]
print(f"Stories: {len(stories)} ({ot} Old Testament, {len(stories) - ot} New Testament)")
print(f"Pictures: {len(set(images_used))} ({len(extra_paths)} extra)")
print(f"Stories still without a picture: {len(missing)}")


# ---- Checklist of black-and-white book pictures (sources/story-art/_checklist.html) ----
def is_black_and_white(path):
    im = Image.open(path).convert("HSV")
    im.thumbnail((200, 200))
    return ImageStat.Stat(im.split()[1]).mean[0] < 40  # average color saturation (0 = gray)


rows = []
for story in stories:
    for block in story["blocks"]:
        key = block.get("image")
        if block["type"] != "image" or key in extra_paths:
            continue
        original = os.path.join(src_dir, "images", dict(images_used)[key])
        if not is_black_and_white(original):
            continue
        rows.append((story, key, block["caption"], story_art(key) is not None))

done = sum(1 for r in rows if r[3])
html = [
    "<!doctype html><meta charset='utf-8'><title>Story art checklist</title>",
    "<style>body{font-family:system-ui,sans-serif;margin:24px;color:#1f2a37}table{border-collapse:collapse;width:100%}",
    "td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left;vertical-align:middle}img{height:110px;border-radius:6px}",
    ".done{color:#2e9e6a;font-weight:bold}.todo{color:#c0392b}code{background:#f4eee0;padding:2px 6px;border-radius:4px;font-size:15px}</style>",
    "<h1>Black-and-white story pictures to replace</h1>",
    f"<p><b>{done} of {len(rows)} done.</b> Save each new picture in this folder (<code>sources\\story-art</code>) with the "
    "name shown, 900 x 1160 upright (any size works; wider than 900 is shrunk). Keep the same subject so the caption still fits. "
    "Then run <code>python scripts/import-lathbury.py ../sources/lathbury/25309-h</code> from the app folder. "
    "This page is rebuilt each time.</p>",
    "<table><tr><th>Status</th><th>Now in the app</th><th>Story</th><th>Caption</th><th>Save as</th></tr>",
]
for story, key, caption, is_done in rows:
    status = "<span class='done'>&#10003; done</span>" if is_done else "<span class='todo'>to do</span>"
    html.append(
        f"<tr><td>{status}</td><td><img src='../../littlelights_app/assets/stories/{key}.jpg'></td>"
        f"<td><b>{story['id']}</b><br>{story['title']}</td><td>{caption}</td><td><code>{key}.jpg</code></td></tr>"
    )
html.append("</table>")
with open(os.path.join(art_dir, "_checklist.html"), "w", encoding="utf-8") as f:
    f.write("\n".join(html))
print(f"New story art: {len(replaced)} picture(s) replaced. Black-and-white pictures: {done} of {len(rows)} done "
      f"(see sources/story-art/_checklist.html)")
