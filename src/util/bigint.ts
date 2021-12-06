// From https://stackoverflow.com/a/64953280
export function abs(x: bigint) {
  return x < BigInt(0) ? -x : x;
}
