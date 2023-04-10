const nanosecondsPerSecond = BigInt(1000000000);

export function hrtimeBigintToSeconds(
  nanoseconds: bigint,
  precision: bigint = BigInt(1000000),
) {
  return Number((nanoseconds * precision) / nanosecondsPerSecond) / Number(precision);
}
