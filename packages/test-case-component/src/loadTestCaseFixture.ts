import { generateHtml } from "./generateHtml";
import type { LoadFixtureProps } from "./types";

export async function loadTestCaseFixture(data: LoadFixtureProps) {
  const { before, during, after } = await generateHtml(data)

  const { command, filename, languageId: language } = data

  const returnObj = {
    before, during, after, command, filename, language
  }
  try {

    return returnObj

  } catch (e) {
    console.error("error", e);
    throw e;
  }
}

