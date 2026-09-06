export function isString(arg: unknown): arg is string {
  // oxlint-disable-next-line unicorn/no-instanceof-builtins
  return typeof arg === "string" || arg instanceof String;
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
