import type { PositionPlainObject } from "@cursorless/common";
import { generateHtml } from "./generateHtml";

async function safeGenerateHtml(
  ...args: [stateName: string, ...rest: Parameters<typeof generateHtml>]
) {
  const [stateName, state, languageId] = args;
  try {
    return await generateHtml(state, languageId);
  } catch (e) {
    console.log("error in state", stateName, e);
    console.log(JSON.stringify(state, null, 2));
    throw e;
  }
}

export async function loadFixture(data: any) {
  // console.log("loadFixture", data)
  try {
    const during = data.flashes
      ? await safeGenerateHtml(
          "flashes",
          {
            ...data.initialState,
            flashes: data.flashes.map(
              ({
                name,
                type,
                start,
                end,
              }: {
                name: string;
                type: string;
                start: PositionPlainObject;
                end: PositionPlainObject;
              }) => ({
                name,
                type,
                anchor: start,
                active: end,
              }),
            ),
          },
          data.languageId,
        )
      : null;
    const before = await safeGenerateHtml(
      "initialState",
      data.initialState,
      data.languageId,
    );
    const after = await safeGenerateHtml(
      "finalState",
      data.finalState,
      data.languageId,
    );
    return {
      language: data.languageId,
      command: data.command.spokenForm,
      during,
      before,
      after,
      filename: data.filename,
    };
  } catch (e) {
    console.log("error", e);
    console.log(JSON.stringify(data, null, 2));
    throw e;
  }
}
