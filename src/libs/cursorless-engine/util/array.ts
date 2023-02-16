import { range } from "lodash";

/**
 * Creates a new array repeating the given array n times
 * @param array The array to repeat
 * @param n The number of times to repeat the array
 * @returns The new array
 */
export function repeat<T>(array: T[], n: number) {
  return range(n).flatMap(() => array);
}
