import {
  TutorialContentProvider,
  TutorialId,
  TutorialStepFragment,
} from "@cursorless/common";
import { TutorialStep } from "./types/tutorial.types";
import { parseScopeType } from "../customCommandGrammar/parseCommand";
import { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { StepComponent } from "./types/StepComponent";
import { getScopeTypeSpokenFormStrict } from "./getScopeTypeSpokenFormStrict";
import { specialTerms } from "./specialTerms";
import { ActionComponentParser } from "./stepComponentParsers/ActionComponentParser";
import { CursorlessCommandComponentParser } from "./stepComponentParsers/CursorlessCommandComponentParser";
import { GraphemeComponentParser } from "./stepComponentParsers/GraphemeComponentParser";
import { parseSpecialComponent } from "./stepComponentParsers/parseSpecialComponent";
import { parseVisualizeComponent } from "./stepComponentParsers/parseVisualizeComponent";

/**
 * This is trying to catch occurrences of things like `{command:cloneStateInk.yml}`
 * or `{action:chuck}` in the tutorial script.
 */
const componentRegex = /{(\w+):([^}]+)}/g;

/**
 * Parses a tutorial step from a raw string. Looks for components in the form
 * `{action:chuck}`, `{command:cloneStateInk.yml}`, etc and parses them into
 * {@link StepComponent}s, as well as fragments of plain text in between.
 */
export class TutorialStepParser {
  /**
   * A map of component type to a function that parses the component.
   */
  private componentParsers: Record<
    string,
    (arg: string) => Promise<StepComponent>
  >;

  constructor(
    contentProvider: TutorialContentProvider,
    tutorialId: TutorialId,
    customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  ) {
    this.parseTutorialStep = this.parseTutorialStep.bind(this);

    const cursorlessCommandParser = new CursorlessCommandComponentParser(
      contentProvider,
      tutorialId,
      customSpokenFormGenerator,
    );

    const actionParser = new ActionComponentParser(customSpokenFormGenerator);

    const graphemeParser = new GraphemeComponentParser(
      customSpokenFormGenerator,
    );

    this.componentParsers = {
      command: (arg) => cursorlessCommandParser.parse(arg),
      special: parseSpecialComponent,
      action: (arg) => actionParser.parse(arg),
      grapheme: (arg) => graphemeParser.parse(arg),

      term: async (arg) => ({
        content: {
          type: "term",
          value: specialTerms[arg as keyof typeof specialTerms],
        },
      }),

      scopeType: async (arg) => ({
        content: {
          type: "term",
          value: getScopeTypeSpokenFormStrict(
            customSpokenFormGenerator,
            parseScopeType(arg),
          ),
        },
      }),

      visualize: (arg) =>
        parseVisualizeComponent(customSpokenFormGenerator, arg),
    };
  }

  /**
   * Given the raw content of a tutorial step, parses it into a
   * {@link TutorialStep} object.
   *
   * For example, given `Say {command:takeCap.yml}`, this would return:
   *
   * ```json
   * {
   *   "content": [
   *     [
   *       {
   *         "type": "string",
   *         "value": "Say "
   *       },
   *       {
   *         "type": "command",
   *         "value": "take cap"
   *       }
   *     ]
   *   ],
   *   "initialState": {
   *     "documentContents": "...",
   *     "selections": [ ... ],
   *     "marks": { ... }
   *   },
   *   "languageId": "plaintext",
   *   "trigger": {
   *     "type": "command",
   *     "command": { ... }
   *   }
   * }
   * ```
   *
   * Note that the `initialState`, `languageId`, and `trigger` fiels are optional,
   * and in this case come from the `takeCap.yml` fixture.
   *
   * @param rawContent The raw content of the tutorial step to parse
   * @returns A {@link TutorialStep} object representing the parsed step
   */
  async parseTutorialStep(rawContent: string): Promise<TutorialStep> {
    const ret: TutorialStep = {
      content: [],
    };

    for (const line of rawContent.split("\n")) {
      const lineContent: TutorialStepFragment[] = [];
      let currentIndex = 0;
      componentRegex.lastIndex = 0;

      for (const {
        0: { length },
        1: type,
        2: arg,
        index,
      } of line.matchAll(componentRegex)) {
        if (index > currentIndex) {
          lineContent.push({
            type: "string",
            value: line.slice(currentIndex, index),
          });
        }

        currentIndex = index + length;

        const result = await this.componentParsers[type](arg);

        if (result == null) {
          throw new Error(`Unknown component type: ${type}`);
        }

        const { content, ...rest } = result;

        lineContent.push(content);
        updateStrict<typeof rest>(ret, rest);
      }

      if (currentIndex < line.length) {
        lineContent.push({
          type: "string",
          value: line.slice(currentIndex),
        });
      }

      ret.content.push(lineContent);
    }

    return ret;
  }
}

/**
 * Update {@link target} with the non-null values from {@link source}, throwing
 * an error if a key from {@link source} already exists in {@link target} with a
 * non-null value.
 *
 * @param target The object to update
 * @param source The object to update from
 */
function updateStrict<T>(target: T, source: T) {
  for (const key in source) {
    if (source[key] == null) {
      continue;
    }

    if (target[key] != null) {
      throw new Error(`Duplicate key: ${key}`);
    }

    target[key] = source[key];
  }
}
