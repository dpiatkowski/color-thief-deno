import { assertEquals } from "@std/assert";
import { ColorSpaceBox } from "./color_space_box.ts";
import { getHistogram, type Pixels, rshift } from "./colors.ts";

Deno.test("ColorSpaceBox.create preserves channel maxima for a single pixel", () => {
  const pixels: Pixels[] = [[255, 128, 64]];
  const histogram = getHistogram(pixels);

  const box = ColorSpaceBox.create(pixels, histogram);

  assertEquals(box.r1, pixels[0][0] >> rshift);
  assertEquals(box.r2, pixels[0][0] >> rshift);
  assertEquals(box.g1, pixels[0][1] >> rshift);
  assertEquals(box.g2, pixels[0][1] >> rshift);
  assertEquals(box.b1, pixels[0][2] >> rshift);
  assertEquals(box.b2, pixels[0][2] >> rshift);
});
