export default function minByAll<T>(arr: T[], fn: (item: T) => number): T[] {
  const min = Math.min(...arr.map(fn));
  return arr.filter((item) => fn(item) === min);
}
