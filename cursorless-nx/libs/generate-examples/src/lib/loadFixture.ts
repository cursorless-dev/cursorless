import path from 'path';
import fs from 'fs-extra';
import * as yaml from 'yaml';

import { buildSpokenForm } from './buildSpokenForm';
import { generateHtml, SelectionAnchor } from './generateHtml';

const cursorlessRoot = path.resolve('../../../src');

const fixturesDir = path.join(
  cursorlessRoot,
  'test',
  'suite',
  'fixtures',
  'recorded'
);

export async function loadFixture(folder: string, name: string) {
  const filepath = path.join(fixturesDir, folder, `${name}.yml`);
  const data = yaml.parse(await fs.readFile(filepath, 'utf-8'));
  if (data.command.version !== 2) return;
  return {
    language: data.languageId,
    command: buildSpokenForm(data.command),
    originalCommand: data.command.spokenForm,
    during: data.decorations
      ? generateHtml(
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
              })
            ),
          },
          data.languageId
        )
      : undefined,
    before: generateHtml(data.initialState, data.languageId),
    after: generateHtml(data.finalState, data.languageId),
  };
}
