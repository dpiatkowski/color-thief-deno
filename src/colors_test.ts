import { assertEquals } from "@std/assert";
import { pixelsToRgb } from "./colors.ts";

Deno.test("Mapping array to RGB object", () => {
  const [red, green, blue] = [255, 64, 10];

  const rgb = pixelsToRgb([red, green, blue]);

  assertEquals(rgb, { red: red, green: green, blue: blue });
});
