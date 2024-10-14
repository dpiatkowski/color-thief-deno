import { type Context, Hono } from "@hono/hono";
import { memoize } from "@std/cache";
import { z } from "zod";
import { getPalette } from "./color_thief.ts";
import { pixelsToRgb } from "./colors.ts";

const paletteQuery = z.object({
  url: z.string().url(),
  quality: z.string().optional().default("10").transform((val) =>
    parseInt(val, 10)
  ),
  colorCount: z.string().optional().default("5").transform((val) =>
    parseInt(val, 10)
  ),
});

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
    const parsedQuery = paletteQuery.safeParse({
      url: c.req.query("url"),
      quality: c.req.query("quality"),
      colorCount: c.req.query("colorCount"),
    });

    if (parsedQuery.success) {
      const { url, quality, colorCount } = parsedQuery.data;

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
