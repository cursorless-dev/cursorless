/**
 * Asserts that the given types are equal.  To test type equality between types
 * `Foo` and `Bar`, use this function as follows:
 *
 * ```ts
 * assertTypesEqual<Foo, Bar, Foo>;
 * ```
 *
 * Note that the third type parameter is the same as the first. There are
 * probably other ways to do this, but this approach is simple, and shows
 * helpful error messages.
 * @see https://stackoverflow.com/a/69413184
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertTypesEqual<A, B extends A, C extends B>() {
  // empty
}
