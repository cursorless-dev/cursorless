import type { PositionPlainObject } from "@cursorless/common";
import type { TestCaseFixture } from "@cursorless/common";
import { generateHtml } from "./generateHtml";

async function safeGenerateHtml(
  ...args: [stateName: string, ...rest: Parameters<typeof generateHtml>]
) {
  const [stateName, state, languageId] = args;
  try {
    return await generateHtml(state, languageId);
  } catch (e) {
    console.error("error in state", stateName, e);
    console.error(JSON.stringify(state, null, 2));
    throw e;
  }
}

export async function loadFixture(data: TestCaseFixture) {
  try {
    const during = await getDuring(data);
    const before = await getBefore(data);
    const after = await getAfter(data);

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

async function getBefore(data: { initialState: any; languageId: any }) {
  return await safeGenerateHtml(
    "initialState",
    data.initialState,
    data.languageId,
  );
}

async function getAfter(data: { finalState: any; languageId: any }) {
  return await safeGenerateHtml("finalState", data.finalState, data.languageId);
}

async function getDuring(data: any) {
  if (!!data.ide && data.ide.flashes) {
    return await safeGenerateHtml(
      "flashes",
      {
        ...data.initialState,
        flashes: data.ide.flashes.map(
          (props: {
            name: string;
            type: string;
            start: PositionPlainObject;
            end: PositionPlainObject;
          }) => {
            const { name, type, start, end } = props;
            console.log("🦄", props);
            return {
              name,
              type,
              anchor: start,
              active: end,
            };
          },
        ),
      },
      data.languageId,
    );
  }
  return null;
}