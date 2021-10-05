export function postProcessValue(value: number) {
  value = Math.round(value * 10000) / 10000;
  return value === 0 ? undefined : value;
}
