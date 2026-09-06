export function postProcessValue(value: number) {
  const roundedValue = Math.round(value * 10_000) / 10_000;
  return roundedValue === 0 ? undefined : roundedValue;
}
