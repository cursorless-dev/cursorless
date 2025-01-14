export const storedTargetKeys = [
  "that",
  "source",
  "instanceReference",
  "keyboard",
] as const;
export type StoredTargetKey = (typeof storedTargetKeys)[number];
