export const storedTargetKeys = [
  "that",
  "source",
  "instanceReference",
] as const;
export type StoredTargetKey = (typeof storedTargetKeys)[number];
