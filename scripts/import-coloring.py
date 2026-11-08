"""
Import coloring pages into Little Lights.

Usage (from the littlelights_app folder):
    python scripts/import-coloring.py ../sources/coloring

Each page is a folder in sources/coloring/ with:
    page.png (or page.jpg)   black line art on white: 1600 x 1200 landscape or 1200 x 1600 portrait
                             (other sizes are scaled so the longer side is 1600)
    page.json                {"title": "..."}

For each page the script:
  1. finds every enclosed white area (the areas kids can color),
  2. traces each area's outline into an SVG shape (drawn under the lines),
  3. makes a see-through copy of the lines to draw on top,
  4. makes a small lookup grid so a tap knows which area it landed on.

Creates:
    assets/coloring/<page>/lines.png     the lines on a see-through background
    assets/coloring/<page>/thumb.jpg     small picture for the page list
    src/content/coloring/<page>.json     area shapes + tap grid (generated)
    src/content/coloringPages.ts         page list (generated)

Needs Python 3 with Pillow (pip install pillow). Safe to re-run.
Takes a few seconds per page.
"""
import json
import os
import sys
from collections import deque

from PIL import Image

PAGE_ORDER = ["noahs-ark", "jesus-loves", "jonah-whale", "peace-hope"]  # shown in this order; others follow A-Z
LONG_SIDE = 1600  # pages are scaled so their longer side is this many pixels
W, H = 1600, 1200  # size of the page being worked on (set per page)
THRESHOLD = 160  # gray darker than this counts as line
MIN_AREA = 250  # areas smaller than this (in pixels) stay white - too small to tap
GRID_CELL = 5  # tap grid: one cell per 5 x 5 pixels
SIMPLIFY = 1.0  # outline smoothing in pixels (hidden under the lines)

src_root = sys.argv[1] if len(sys.argv) > 1 else "../sources/coloring"
app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
asset_root = os.path.join(app_dir, "assets", "coloring")
data_root = os.path.join(app_dir, "src", "content", "coloring")
os.makedirs(asset_root, exist_ok=True)
os.makedirs(data_root, exist_ok=True)


def find_page_file(folder):
    for name in ("page.png", "page.jpg", "page.jpeg"):
        if os.path.exists(os.path.join(folder, name)):
            return os.path.join(folder, name)
    return None


def label_areas(white):
    """Number every connected white area (4-neighbor). Returns label list (0 = line) and area sizes."""
    labels = [0] * (W * H)
    sizes = [0]
    n = 0
    for start in range(W * H):
        if not white[start] or labels[start]:
            continue
        n += 1
        labels[start] = n
        q = deque([start])
        count = 0
        while q:
            i = q.popleft()
            count += 1
            x = i % W
            for j in (i - 1 if x > 0 else -1, i + 1 if x < W - 1 else -1, i - W, i + W):
                if 0 <= j < W * H and white[j] and not labels[j]:
                    labels[j] = n
                    q.append(j)
        sizes.append(count)
    return labels, sizes


def outline_loops(labels, keep):
    """Trace pixel-edge outlines for each kept area. Returns {area: [loop, ...]}, loops = point lists."""
    edges = {a: {} for a in keep}  # area -> start point -> [end points]

    def add(a, p, q):
        edges[a].setdefault(p, []).append(q)

    for y in range(H):
        row = y * W
        for x in range(W):
            a = labels[row + x]
            if a not in keep:
                continue
            if y == 0 or labels[row + x - W] != a:
                add(a, (x, y), (x + 1, y))
            if x == W - 1 or labels[row + x + 1] != a:
                add(a, (x + 1, y), (x + 1, y + 1))
            if y == H - 1 or labels[row + x + W] != a:
                add(a, (x + 1, y + 1), (x, y + 1))
            if x == 0 or labels[row + x - 1] != a:
                add(a, (x, y + 1), (x, y))

    result = {}
    for a, graph in edges.items():
        loops = []
        while graph:
            start = next(iter(graph))
            loop = [start]
            p = start
            while True:
                nexts = graph[p]
                q = nexts.pop()
                if not nexts:
                    del graph[p]
                if q == start:
                    break
                loop.append(q)
                p = q
            loops.append(loop)
        result[a] = loops
    return result


def drop_straight(loop):
    """Remove points in the middle of straight runs."""
    out = []
    n = len(loop)
    for i in range(n):
        a, b, c = loop[i - 1], loop[i], loop[(i + 1) % n]
        if (b[0] - a[0]) * (c[1] - b[1]) != (b[1] - a[1]) * (c[0] - b[0]):
            out.append(b)
    return out or loop


def simplify(points, eps):
    """Douglas-Peucker on an open polyline."""
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = (dx * dx + dy * dy) ** 0.5 or 1
    far, idx = -1, 0
    for i in range(1, len(points) - 1):
        px, py = points[i]
        d = abs(dy * (px - x1) - dx * (py - y1)) / norm if (dx or dy) else ((px - x1) ** 2 + (py - y1) ** 2) ** 0.5
        if d > far:
            far, idx = d, i
    if far <= eps:
        return [points[0], points[-1]]
    return simplify(points[: idx + 1], eps)[:-1] + simplify(points[idx:], eps)


def loop_path(loop):
    pts = drop_straight(loop)
    if len(pts) > 8:
        # split the closed loop at its first point and the point farthest from it, simplify both halves
        x0, y0 = pts[0]
        far = max(range(len(pts)), key=lambda i: (pts[i][0] - x0) ** 2 + (pts[i][1] - y0) ** 2)
        pts = simplify(pts[: far + 1], SIMPLIFY)[:-1] + simplify(pts[far:] + [pts[0]], SIMPLIFY)[:-1]
    return "M" + "L".join(f"{x} {y}" for x, y in pts) + "Z"


folders = [f for f in os.listdir(src_root) if os.path.isfile(os.path.join(src_root, f, "page.json"))]
folders.sort(key=lambda f: (PAGE_ORDER.index(f) if f in PAGE_ORDER else len(PAGE_ORDER), f))

pages = []
for pid in folders:
    folder = os.path.join(src_root, pid)
    page_file = find_page_file(folder)
    if not page_file:
        print(f"  ({pid}: no page.png or page.jpg - skipped)")
        continue
    meta = json.load(open(os.path.join(folder, "page.json"), encoding="utf-8"))
    gray = Image.open(page_file).convert("L")
    # Keep the page's shape (landscape or portrait); scale so the longer side is LONG_SIDE
    factor = LONG_SIDE / max(gray.size)
    W, H = round(gray.size[0] * factor), round(gray.size[1] * factor)
    if gray.size != (W, H):
        print(f"  ({pid}: resizing {gray.size[0]} x {gray.size[1]} to {W} x {H})")
        gray = gray.resize((W, H), Image.LANCZOS)

    white = bytearray(1 if v >= THRESHOLD else 0 for v in gray.tobytes())
    labels, sizes = label_areas(white)
    keep_old = [a for a in range(1, len(sizes)) if sizes[a] >= MIN_AREA]
    keep = set(keep_old)
    loops = outline_loops(labels, keep)

    # Number kept areas 1..n in the output
    new_id = {a: i + 1 for i, a in enumerate(keep_old)}
    regions = [{"id": new_id[a], "d": "".join(loop_path(l) for l in loops[a])} for a in keep_old]

    # Tap grid: area under the center of each cell (0 = line or tiny area), run-length encoded
    gc, gr = W // GRID_CELL, H // GRID_CELL
    cells = []
    for cy in range(gr):
        y = cy * GRID_CELL + GRID_CELL // 2
        for cx in range(gc):
            a = labels[y * W + cx * GRID_CELL + GRID_CELL // 2]
            cells.append(new_id.get(a, 0))
    rle = []
    prev, run = cells[0], 0
    for c in cells:
        if c == prev:
            run += 1
        else:
            rle += [prev, run]
            prev, run = c, 1
    rle += [prev, run]

    # Lines on a see-through background. Keeps the soft line edges, but drops the faint
    # gray speckle JPEGs leave in white areas (it bloats the file and dulls the colors).
    out_dir = os.path.join(asset_root, pid)
    os.makedirs(out_dir, exist_ok=True)
    lines = Image.new("RGBA", (W, H), (20, 20, 20, 0))
    lines.putalpha(gray.point(lambda v: 0 if v > 215 else (255 if v < 50 else round((215 - v) * 255 / 165))))
    lines.save(os.path.join(out_dir, "lines.png"), optimize=True)
    thumb = gray.convert("RGB")
    thumb.thumbnail((480, 480), Image.LANCZOS)
    thumb.save(os.path.join(out_dir, "thumb.jpg"), quality=85)

    data = {"width": W, "height": H, "regions": regions, "grid": {"cols": gc, "rows": gr, "cell": GRID_CELL, "rle": rle}}
    with open(os.path.join(data_root, pid + ".json"), "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))
    kb = os.path.getsize(os.path.join(data_root, pid + ".json")) // 1024
    pages.append({"id": pid, "title": meta["title"]})
    print(f"{pid}: {meta['title']} ({W} x {H}) - {len(regions)} areas to color ({len(sizes) - 1 - len(regions)} tiny ones skipped), {kb} KB")

L = [
    "// GENERATED by scripts/import-coloring.py - do not edit by hand.",
    "// Add pages in sources/coloring/<page>/ (page.png + page.json), then re-run the script.",
    'import type { ImageSource } from "expo-image";',
    "",
    "export type ColoringData = {",
    "  width: number;",
    "  height: number;",
    "  regions: { id: number; d: string }[]; // SVG outline of each area",
    "  grid: { cols: number; rows: number; cell: number; rle: number[] }; // tap lookup",
    "};",
    "",
    "export type ColoringPage = {",
    "  id: string;",
    "  title: string;",
    "  lines: ImageSource;",
    "  thumb: ImageSource;",
    "  data: ColoringData;",
    "};",
    "",
    "export const coloringPages: ColoringPage[] = [",
]
for p in pages:
    L += [
        "  {",
        f'    id: {json.dumps(p["id"])},',
        f'    title: {json.dumps(p["title"])},',
        f'    lines: require("../../assets/coloring/{p["id"]}/lines.png"),',
        f'    thumb: require("../../assets/coloring/{p["id"]}/thumb.jpg"),',
        f'    data: require("./coloring/{p["id"]}.json"),',
        "  },",
    ]
L += ["];", "", "export function getColoringPage(id: string): ColoringPage | undefined {", "  return coloringPages.find((p) => p.id === id);", "}"]
with open(os.path.join(app_dir, "src", "content", "coloringPages.ts"), "w", encoding="utf-8") as f:
    f.write("\n".join(L) + "\n")
print(f"Pages: {len(pages)}")
