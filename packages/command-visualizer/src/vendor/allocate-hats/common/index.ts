export * from "./types";
// DefaultMap / CompositeKeyMap are re-exported straight from
// @cursorless/lib-common (byte-identical to the copies this tree used to
// vendor). Importing them from source removes two clones; every consumer in
// this tree keeps its unchanged `from "../common"` import.
export { CompositeKeyMap, DefaultMap } from "@cursorless/lib-common";
