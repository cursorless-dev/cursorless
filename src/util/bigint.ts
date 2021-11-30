export function abs(x: bigint) {
  return x < BigInt(0) ? -x : x;
}
