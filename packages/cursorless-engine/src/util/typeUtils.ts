/**
 * Determines whether two objects have the same constructor.
 *
 * @param a The first object
 * @param b The second object
 * @returns True if `a` and `b` have the same constructor
 */
export function isSameType<T>(a: T, b: unknown): b is T {
  return (
    Object.getPrototypeOf(a).constructor ===
    Object.getPrototypeOf(b).constructor
  );
}

// From https://stackoverflow.com/a/69160270/2605678
type IfEquals<T, U, Y = true, N = false> =
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2 ? Y : N;

export type ExtractMutable<T> = {
  [Prop in keyof T]: IfEquals<
    Pick<T, Prop>,
    Record<Prop, T[Prop]>
  > extends false
    ? never
    : Prop;
}[keyof T];
