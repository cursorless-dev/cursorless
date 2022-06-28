import { Offsets } from "./types";

export function weaklyContains(offsets1: Offsets, offsets2: Offsets) {
  return offsets1.start <= offsets2.start && offsets1.end >= offsets2.end;
}
