import type { PositionPlainObject } from "@cursorless/common";
import type { TestCaseFixture, TestCaseSnapshot } from "@cursorless/common";
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

interface loadFixtureProps extends TestCaseFixture {
  filename: string;
}

export async function loadFixture(data: loadFixtureProps) {
  try {
    const during = await getDuring(data);
    const before = await getBefore({
      stateName: "initialState",
      state: data.initialState,
      languageId: data.languageId,
    });
    const after = await getAfter({
      stateName: "finalState",
      state: data.finalState,
      languageId: data.languageId,
    });

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

async function getBefore({
  stateName,
  state,
  languageId,
}: {
  stateName: string;
  state: TestCaseSnapshot;
  languageId: string;
}) {
  return await safeGenerateHtml(stateName, state, languageId);
}

async function getAfter({
  stateName,
  state,
  languageId,
}: {
  stateName: string;
  state: TestCaseSnapshot;
  languageId: string;
}) {
  // todo, handle clipboard
  return await safeGenerateHtml(stateName, state, languageId);
}

async function getDuring(data: TestCaseFixture) {
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