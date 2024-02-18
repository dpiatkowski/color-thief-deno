import { createServer } from "./src/server.ts";

if (import.meta.main) {
  const server = createServer();
  Deno.serve(server.fetch);
}
