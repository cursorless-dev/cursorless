import { generateHtml, SelectionAnchor } from "./generateHtml";

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

export async function loadFixture(
  data: any
) {
  // console.log("loadFixture", data)
  try {
    const during = data.decorations
      ? await safeGenerateHtml(
          "decorations",
          {
            ...data.initialState,
            decorations: data.decorations.map(
              ({
                name,
                type,
                start,
                end,
              }: {
                name: string;
                type: string;
                start: SelectionAnchor;
                end: SelectionAnchor;
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
    };
  } catch (e) {
    console.log("error", e);
    console.log(JSON.stringify(data, null, 2));
    throw e;
  }
}
