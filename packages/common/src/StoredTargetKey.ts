export const storedTargetKeys = [
  "that",
  "source",
  "instanceReference",
  "implicit",
] as const;
export type StoredTargetKey = (typeof storedTargetKeys)[number];
