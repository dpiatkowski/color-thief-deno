import { Hono } from "https://deno.land/x/hono@v4.0.4/mod.ts";
import { getPalette } from "./color_thief.ts";

function createServer() {
  const app = new Hono();

  app.get("/", (c) => c.text("Labor omnia vincit."));

  app.get("/pallete", async (c) => {
    const url = c.req.query("url") as string;
    const palette = await getPalette(url, 5, 5);

    return c.json({
      palette: palette.map((pixel) => ({
        red: pixel.at(0),
        green: pixel.at(1),
        blue: pixel.at(2),
      })),
    });
  });

  return app;
}

export { createServer };
