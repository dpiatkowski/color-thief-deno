import { Hono, HTTPException } from "https://deno.land/x/hono@v4.0.4/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getPalette } from "./color_thief.ts";

const paletteQuery = z.object({
  url: z.string().url(),
  quality: z.string().optional().default("10").transform((val) =>
    parseInt(val, 10)
  ),
  colorCount: z.string().optional().default("5").transform((val) =>
    parseInt(val, 10)
  ),
});

function createServer() {
  const app = new Hono();

  app.get("/", (c) => c.text("Labor omnia vincit."));

  app.get("/palette", async (c) => {
    const parsedQuery = paletteQuery.safeParse({
      url: c.req.query("url"),
      quality: c.req.query("quality"),
      colorCount: c.req.query("colorCount"),
    });

    if (parsedQuery.success) {
      const { url, quality, colorCount } = parsedQuery.data;

      const palette = await getPalette(url, quality, colorCount);

      return c.json({
        palette: palette.map((pixel) => ({
          red: pixel.at(0),
          green: pixel.at(1),
          blue: pixel.at(2),
        })),
      });
    } else {
      throw new HTTPException(400);
    }
  });

  return app;
}

export { createServer };
