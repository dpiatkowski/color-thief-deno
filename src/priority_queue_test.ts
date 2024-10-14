import { assertEquals } from "@std/assert";
import { naturalOrder, PriorityQueue } from "./priority_queue.ts";

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

Deno.test("Mapping over priority queue", () => {
  const queue = new PriorityQueue<number>(naturalOrder);

  queue.push(1);
  queue.push(2);
  queue.push(3);

  const result = queue.map((x) => x * 2);

  assertEquals(result, [2, 4, 6]);
});

Deno.test("Natural order of numbers", () => {
  const lowerThen = naturalOrder(1, 2);
  assertEquals(lowerThen, -1);

  const equal = naturalOrder(1, 1);
  assertEquals(equal, 0);

  const greaterThen = naturalOrder(2, 1);
  assertEquals(greaterThen, 1);
});
