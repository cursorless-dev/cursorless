/**
 * A queue that ensures that each item is only yielded once even if it is pushed
 * multiple times.
 */
export class UniqueWorkQueue<T> {
  private items = new Set<T>();
  private queue: T[] = [];

  constructor(...initialItems: T[]) {
    this.push(...initialItems);
  }

  push(...items: T[]) {
    for (const item of items) {
      if (!this.items.has(item)) {
        this.items.add(item);
        this.queue.push(item);
      }
    }
  }

  *[Symbol.iterator]() {
    while (this.queue.length > 0) {
      yield this.queue.shift()!;
    }
  }
}
