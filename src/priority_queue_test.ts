import { assertEquals } from "https://deno.land/std@0.216.0/assert/mod.ts";
import { PriorityQueue } from "./priority_queue.ts";

function naturalOrder(a: number, b: number): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

Deno.test("Empty queue", () => {
  const queue = new PriorityQueue<number>(naturalOrder);

  assertEquals(queue.size(), 0);

  assertEquals(queue.pop(), undefined);

  assertEquals(queue.peek(0), undefined);
  assertEquals(queue.peek(-1), undefined);
  assertEquals(queue.peek(10), undefined);
});

Deno.test("Creating queue in order", () => {
  const queue = new PriorityQueue<number>(naturalOrder);

  queue.push(1);
  queue.push(2);
  queue.push(3);

  assertEquals(queue.size(), 3);
  assertEquals(queue.peek(0), 1);

  assertEquals(queue.peek(-1), 3);
  assertEquals(queue.peek(2), 3);
  assertEquals(queue.peek(10), 3);

  queue.pop();

  assertEquals(queue.size(), 2);
  assertEquals(queue.peek(-1), 2);
});

Deno.test("Creating queue from random order", () => {
  const queue = new PriorityQueue<number>(naturalOrder);

  queue.push(3);
  queue.push(1);
  queue.push(2);

  assertEquals(queue.size(), 3);
  assertEquals(queue.peek(0), 1);

  assertEquals(queue.peek(-1), 3);
  assertEquals(queue.peek(2), 3);
  assertEquals(queue.peek(10), 3);

  queue.pop();

  assertEquals(queue.size(), 2);
  assertEquals(queue.peek(-1), 2);
});
