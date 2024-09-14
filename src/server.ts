import { Hono } from "@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";
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
        palette: palette.map(pixelsToRgb),
      });
    } else {
      throw new HTTPException(400);
    }
  });

  return app;
}

export { createServer };
