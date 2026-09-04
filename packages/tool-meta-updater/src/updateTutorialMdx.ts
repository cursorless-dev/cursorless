import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type {
  RawTutorialContent,
  TestCaseFixtureLegacy,
  TutorialContentProvider,
  TutorialId,
} from "@cursorless/lib-common";
import { graphemeDefaultSpokenForms } from "@cursorless/lib-common";
import { recordedTestVisualizerImport } from "./renderRecordedTestVisualizer";
import { isAppWebDocs } from "./util/isManifest";

const componentRegex = /\{(\w+):([^}]+)\}/gu;

const specialCommands: Record<string, string> = {
  help: "cursorless help",
  next: "tutorial next",
  visualizeNothing: "visualize nothing",
};

interface RenderedStep {
  content: string;
  fixtureNames: string[];
}

interface TutorialRecordedTest {
  path: string;
  name: string;
  fixture: TestCaseFixtureLegacy;
}

export function updateTutorialReadmeMdx(
  tutorials: RawTutorialContent[],
  _actual: string | null,
  options: FormatPluginFnOptions,
): string | null {
  if (!isAppWebDocs(options)) {
    return null;
  }

  const enrichedTutorials = tutorials.map((tutorial) => ({
    ...tutorial,
    ...parseTutorialId(tutorial.id),
  }));

  return [
    "# Tutorial",
    "",
    "Learn the fundamentals of Cursorless in your browser, using the same lessons and examples as the interactive tutorial in VS Code.",
    "",
    'To follow along interactively, focus VS Code and say `"cursorless tutorial"`.',
    "",
    ...enrichedTutorials
      .toSorted((a, b) => a.position - b.position)
      .flatMap((tutorial) => [
        `## ${tutorial.position}. ${tutorial.title}`,
        "",
        `[Start ${tutorial.title}](./${tutorial.shortId}.mdx)`,
        "",
      ]),
    "## Use the interactive tutorial",
    "",
    "The VS Code sidebar includes an interactive version of these tutorials. Each step shows a command to say and usually advances automatically when you complete it. It uses your custom spoken forms and saves your progress so that you can continue where you left off.",
    "",
    "### Start a tutorial",
    "",
    'With VS Code focused, say `"cursorless tutorial"` to start or continue the Introduction tutorial.',
    "",
    'To choose a tutorial, say `"tutorial list"`, then click its name or say `"tutorial <number>"`. For example, say `"tutorial two"` to start or continue Basic coding.',
    "",
    'You can also say `"bar cursorless"` and choose a tutorial from the Tutorial section of the sidebar.',
    "",
    "### Navigate the tutorial",
    "",
    "You can use the arrow buttons in the sidebar or these commands:",
    "",
    '- `"tutorial next"` - Move to the next step.',
    '- `"tutorial previous"` or `"tutorial last"` - Move to the previous step.',
    '- `"tutorial restart"` - Return to the first step of the current tutorial.',
    '- `"tutorial list"` or `"tutorial close"` - Return to the tutorial list.',
    "",
    'The tutorial opens a practice document and expects it to match the current exercise. If you edit the document or move away from it, say `"tutorial resume"` to restore the current step and continue.',
    "",
  ].join("\n");
}

export async function updateTutorialMdx(
  tutorial: RawTutorialContent,
  contentProvider: TutorialContentProvider,
  _actual: string | null,
  options: FormatPluginFnOptions,
): Promise<string | null> {
  if (!isAppWebDocs(options)) {
    return null;
  }

  const { position, shortId } = parseTutorialId(tutorial.id);
  const lines = [
    recordedTestVisualizerImport,
    `import recordedTests from "./fixtures/${shortId}.json";`,
    "",
    `# ${position}. ${tutorial.title}`,
    "",
    "<RecordedTestVisualizerProvider recordedTests={recordedTests}>",
    "",
    "<RecordedTestVisualizerOptions />",
    "",
  ];

  for (const [index, rawStep] of tutorial.steps.entries()) {
    const step = await renderStep(contentProvider, tutorial.id, rawStep);
    lines.push(`## Step ${index + 1}`, "", step.content, "");

    for (const fixtureName of step.fixtureNames) {
      lines.push(`<RecordedTestVisualizer fixtureName="${fixtureName}" />`, "");
    }
  }

  lines.push("</RecordedTestVisualizerProvider>", "");
  return lines.join("\n");
}

export async function updateTutorialFixtureData(
  tutorial: RawTutorialContent,
  contentProvider: TutorialContentProvider,
  _actual: unknown,
  options: FormatPluginFnOptions,
): Promise<TutorialRecordedTest[] | null> {
  if (!isAppWebDocs(options)) {
    return null;
  }

  const fixtureArguments = new Set<string>();
  for (const rawStep of tutorial.steps) {
    componentRegex.lastIndex = 0;
    for (const match of rawStep.matchAll(componentRegex)) {
      const [, type, argument] = match;
      if (type === "command") {
        fixtureArguments.add(argument);
      }
    }
  }

  const recordedTests = await Promise.all(
    [...fixtureArguments].map(async (argument) => ({
      path: `tutorial/${tutorial.id}/${argument}`,
      name: getTutorialFixtureName(tutorial.id, argument),
      fixture: await contentProvider.loadFixture(tutorial.id, argument),
    })),
  );

  return recordedTests;
}

async function renderStep(
  contentProvider: TutorialContentProvider,
  tutorialId: RawTutorialContent["id"],
  rawStep: string,
): Promise<RenderedStep> {
  const fixtureNames: string[] = [];
  const paragraphs: string[] = [];

  for (const paragraph of rawStep.split("\n")) {
    const fragments: string[] = [];
    let currentIndex = 0;
    componentRegex.lastIndex = 0;

    for (const match of paragraph.matchAll(componentRegex)) {
      const [component, type, argument] = match;
      const index = match.index;
      fragments.push(paragraph.slice(currentIndex, index));
      currentIndex = index + component.length;

      if (type === "command") {
        const fixture = await contentProvider.loadFixture(tutorialId, argument);
        const spokenForm = fixture.command.spokenForm;
        if (spokenForm == null) {
          throw new Error(
            `Tutorial fixture ${tutorialId}/${argument} has no spoken form`,
          );
        }
        fragments.push(formatSpokenForm(spokenForm));
        fixtureNames.push(getTutorialFixtureName(tutorialId, argument));
      } else {
        fragments.push(formatComponent(type, argument));
      }
    }

    fragments.push(paragraph.slice(currentIndex));
    paragraphs.push(fragments.join(""));
  }

  return {
    content: paragraphs.join("\n\n"),
    fixtureNames,
  };
}

function getTutorialFixtureName(
  tutorialId: RawTutorialContent["id"],
  argument: string,
): string {
  return `tutorial/${tutorialId}/${argument.replace(/\.ya?ml$/u, "")}`;
}

function formatComponent(type: string, argument: string): string {
  switch (type) {
    case "action":
    case "scopeType":
    case "term":
      return formatTerm(argument);
    case "grapheme":
      return formatTerm(graphemeDefaultSpokenForms[argument] ?? argument);
    case "special":
      return formatSpokenForm(specialCommands[argument] ?? argument);
    case "visualize":
      return formatSpokenForm(`visualize ${argument}`);
    default:
      throw new Error(`Unknown tutorial component type: ${type}`);
  }
}

function formatSpokenForm(spokenForm: string): string {
  return `\`"${spokenForm}"\``;
}

function formatTerm(term: string): string {
  return `"${term}"`;
}

export function parseTutorialId(id: TutorialId) {
  const match = id.match(/^tutorial-(?<identifier>(?<number>\d+)-.+)$/u);
  const position = match?.groups?.number;
  const shortId = match?.groups?.identifier;

  if (position == null || shortId == null) {
    throw new Error(`Invalid tutorial fixture id: ${id}`);
  }

  return {
    position: Number(position),
    shortId,
  };
}
