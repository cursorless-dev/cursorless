
import { createCursorlessEngine } from "@cursorless/cursorless-engine";

export function entry() {
  createCursorlessEngine();
  console.log("foo")
}
