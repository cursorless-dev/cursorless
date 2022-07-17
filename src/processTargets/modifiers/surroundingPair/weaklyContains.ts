import type { Offsets } from "./types";

/**
 * Determines whether {@link offsets1} weakly contains {@link offsets2}, which
 * defined as the boundaries of {@link offsets1} being inside or equal to the
 * boundaries of {@link offsets2}.
 * @param offsets1 The first set of offsets
 * @param offsets2 The second set of offsets
 * @returns `true` if {@link offsets1} weakly contains {@link offsets2}
 */
export function weaklyContains(offsets1: Offsets, offsets2: Offsets) {
  return offsets1.start <= offsets2.start && offsets1.end >= offsets2.end;
}
