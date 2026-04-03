export function postProcessValue(value: number) {
  value = Math.round(value * 10_000) / 10_000;
  return value === 0 ? undefined : value;
}
