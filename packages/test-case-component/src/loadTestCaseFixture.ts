import { generateHtml } from "./generateHtml";
import type { DataFixture } from "./types";
import type { BundledLanguage } from "shiki";
import type { TestCaseSnapshot } from "@cursorless/common";
import type { CommandLatest } from "@cursorless/common";

export interface LoadFixtureProps extends DataFixture {
  filename: string;
  languageId: BundledLanguage;
  initialState: TestCaseSnapshot;
  finalState: TestCaseSnapshot;
}

export interface PortableTestCaseFixture {
  before: string;
  during: string;
  after: string;
  command: object; // Use plain object for portability
  filename: string;
  language: string;
}

function extractHtml(step: string | { html: string; data: any[] }): string {
  return typeof step === "string" ? step : step.html;
}

export async function loadTestCaseFixture(
  data: LoadFixtureProps
): Promise<PortableTestCaseFixture> {
  const { before, during, after } = await generateHtml(data);
  const { command, filename, languageId: language } = data;
  return {
    before: extractHtml(before),
    during: extractHtml(during),
    after: extractHtml(after),
    command: JSON.parse(JSON.stringify(command)), // ensure plain object
    filename,
    language,
  };
}

