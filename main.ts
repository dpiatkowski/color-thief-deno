import { getColor } from "./src/color_thief.ts";
import { createServer } from "./src/server.ts";

if (import.meta.main) {
  // const color = await getColor(
  //   "https://img.shmbk.pl/rimgspc/products/images/d503f74d43f6b7f487ecf2e4751af2e2_max_500_500_",
  //   1,
  // );

  // console.log(color);

  const server = createServer();
  Deno.serve(server.fetch);
}
