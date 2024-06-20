function indexArrayStrict<T>(arr: T[], idx: number, name: string): T {
  if (idx >= arr.length) {
    throw Error(
      `Expected at least ${idx + 1} ${name} but received only ${arr.length}`
    );
  }

  return arr[idx];
}
