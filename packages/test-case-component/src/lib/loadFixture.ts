import path from 'path';
import fs from 'fs-extra';
import * as yaml from 'yaml';

import { buildSpokenForm } from './buildSpokenForm';
import { generateHtml, SelectionAnchor } from './generateHtml';

const fixturesDir = path.join(
  '../',
  'cursorless-vscode-e2e',
  'src',
  'suite',
  'fixtures',
  'recorded'
);

async function safeGenerateHtml(
  ...args: [stateName: string, ...rest: Parameters<typeof generateHtml>]
) {
  const [stateName, state, languageId] = args;
  try {
    return await generateHtml(state, languageId);
  } catch (e) {
    console.log('error in state', stateName, e);
    console.log(JSON.stringify(state, null, 2));
    throw e;
  }
}

export async function loadFixture(folder: string, name: string) {
  const filepath = path.join(fixturesDir, folder, `${name}.yml`);
  const data = yaml.parse(await fs.readFile(filepath, 'utf-8'));
  if (data.command.version !== 2) return;
  try {
    const during = data.decorations
      ? await safeGenerateHtml(
          'decorations',
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
      : undefined;
    const before = await safeGenerateHtml(
      'initialState',
      data.initialState,
      data.languageId
    );
    const after = await safeGenerateHtml(
      'finalState',
      data.finalState,
      data.languageId
    );
    return {
      language: data.languageId,
      command: buildSpokenForm(data.command),
      originalCommand: data.command.spokenForm,
      during,
      before,
      after,
    };
  } catch (e) {
    console.log('error', filepath, e);
    console.log(JSON.stringify(data, null, 2));
    throw e;
  }
}
