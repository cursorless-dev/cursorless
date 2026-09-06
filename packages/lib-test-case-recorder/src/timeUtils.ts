const nanosecondsPerSecond = 1_000_000_000n;

export function hrtimeBigintToSeconds(
  nanoseconds: bigint,
  precision: bigint = 1_000_000n,
) {
  return (
    Number((nanoseconds * precision) / nanosecondsPerSecond) / Number(precision)
  );
}
