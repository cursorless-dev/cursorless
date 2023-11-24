/**
 * A queue that ensures that each item is only yielded once
 */
export class WorkQueue<T> {
  private items = new Map<T, boolean>();

  constructor(...initialItems: T[]) {
    this.push(...initialItems);
  }

  push(...items: T[]) {
    for (const item of items) {
      if (!this.items.has(item)) {
        this.items.set(item, false);
      }
    }
  }

  *[Symbol.iterator]() {
    // while there are still items that haven't been yielded
    while ([...this.items.values()].some((value) => !value)) {
      // find any item that hasn't been yielded yet
      const currentItem = [...this.items.entries()].find(
        ([_, visited]) => !visited,
      )![0];
      this.items.set(currentItem, true);
      yield currentItem;
    }
  }
}
