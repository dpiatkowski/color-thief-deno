import { type Context, Hono } from "@hono/hono";
import { memoize } from "@std/cache";
import { getPalette } from "./color_thief.ts";
import { pixelsToRgb } from "./colors.ts";

function parseQuery(
  raw: { url?: string; quality?: string; colorCount?: string },
) {
  const url = raw.url;
  if (!url) return null;
  try {
    new URL(url);
  } catch {
    return null;
  }
  return {
    url,
    quality: parseInt(raw.quality ?? "10", 10),
    colorCount: parseInt(raw.colorCount ?? "5", 10),
  };
}

const getPaletteMemo = memoize(
  (url: string, quality: number, colorCount: number) => {
    return getPalette(url, quality, colorCount);
  },
  {
    getKey: (url, quality, colorCount) =>
      `u:${url}-q:${quality}-c:${colorCount}`,
  },
);

function createServer() {
  const app = new Hono();

  app.get("/", (c: Context) => c.text("Labor omnia vincit."));

  app.get("/palette", async (c: Context) => {
    const query = parseQuery({
      url: c.req.query("url"),
      quality: c.req.query("quality"),
      colorCount: c.req.query("colorCount"),
    });

    if (query) {
      const { url, quality, colorCount } = query;

      const palette = await getPaletteMemo(url, quality, colorCount);

      return c.json({
        palette: palette.map(pixelsToRgb),
      });
    } else {
      return c.text("Invalid request", 400);
    }
  });

  return app;
}

export { createServer };
