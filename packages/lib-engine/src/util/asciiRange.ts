export const asciiRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) =>
    String.fromCodePoint(start + i),
  );
