export const storedTargetKeys = [
  "that",
  "source",
  "instanceReference",
  "implicit",
  "keyboard",
] as const;
export type StoredTargetKey = (typeof storedTargetKeys)[number];
