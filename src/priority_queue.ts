class PriorityQueue<T> {
  readonly #contents: T[] = [];
  #isSorted = false;

  constructor(private readonly compareFunction: (a: T, b: T) => number) {}

  push(item: T) {
    this.#contents.push(item);
    this.#isSorted = false;
  }

  peek(index: number) {
    if (!this.#isSorted) {
      this.#sort();
    }

    if (index < 0 || index >= this.#contents.length) {
      return this.#contents.at(-1);
    }

    return this.#contents.at(index);
  }

  pop() {
    if (!this.#isSorted) {
      this.#sort();
    }

    return this.#contents.pop();
  }

  size() {
    return this.#contents.length;
  }

  map<U>(mapFunction: (item: T) => U) {
    return this.#contents.map(mapFunction);
  }

  #sort() {
    this.#contents.sort(this.compareFunction);
    this.#isSorted = true;
  }

  *[Symbol.iterator]() {
    if (!this.#isSorted) {
      this.#sort();
    }

    for (const item of this.#contents) {
      yield item;
    }
  }
}

type NaturalOrder = -1 | 0 | 1;

function naturalOrder(a: number, b: number): NaturalOrder {
  return a < b ? -1 : a > b ? 1 : 0;
}

export { naturalOrder, PriorityQueue };
