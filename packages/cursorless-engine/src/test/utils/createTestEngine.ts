import { createCursorlessEngine } from "../..";
import { FakeIDE } from "@cursorless/common";

export async function createTestEngine() {
  const ide = new FakeIDE();

  const { scopeProvider } = await createCursorlessEngine({
    ide,
  });

  return { scopeProvider };
}
