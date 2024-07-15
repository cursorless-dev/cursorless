const nanosecondsPerSecond = 1000000000;

export function hrtimeBigintToSeconds(
  nanoseconds: bigint,
  precision: number = 1000000,
) {
  return (
    Number((Number(nanoseconds) * precision) / nanosecondsPerSecond) /
    Number(precision)
  );
}
