import type { ColoringPage } from "@/content/coloringPages";

// Web: draw the finished picture (white page, colors, then the lines) on a canvas
// at full size and download it as a JPG. No permission needed.
// (The third argument is only used on phones.)
export async function savePicture(page: ColoringPage, fills: Record<number, string>, _exportView?: unknown): Promise<"saved" | "denied" | "failed"> {
  try {
    const { width, height, regions } = page.data;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "failed";

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    const shapes = new Map(regions.map((r) => [r.id, r.d]));
    for (const [id, color] of Object.entries(fills)) {
      const d = shapes.get(Number(id));
      if (!d) continue;
      ctx.fillStyle = color;
      ctx.fill(new Path2D(d), "evenodd");
    }

    // On the web, a bundled image is a URL (as a string or { uri })
    const src = typeof page.lines === "string" ? page.lines : (page.lines as { uri: string }).uri;
    const lines = new Image();
    lines.src = src;
    await lines.decode();
    ctx.drawImage(lines, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) return "failed";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `little-lights-${page.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return "saved";
  } catch {
    return "failed";
  }
}

export const saveMessage = "Your picture was downloaded!";
export const needsExportView = false;
