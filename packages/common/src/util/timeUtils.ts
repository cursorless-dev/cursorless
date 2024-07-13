const nanosecondsPerSecond = 1000000000;

export function hrtimeBigintToSeconds(
  nanoseconds: number,
  precision: number = 1000000,
) {
  return (
    Number((nanoseconds * precision) / nanosecondsPerSecond) / Number(precision)
  );
}
