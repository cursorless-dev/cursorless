import {
  RangeExpansionBehavior,
  ScopeType,
  Snippet,
  SnippetDefinition,
  textFormatters,
} from "@cursorless/common";
import { Snippets } from "../core/Snippets";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import {
  callFunctionAndUpdateSelectionInfos,
  getSelectionInfo,
} from "../core/updateSelections/updateSelections";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ModifyIfUntypedExplicitStage } from "../processTargets/modifiers/ConditionalModifierStages";
import { ide } from "../singletons/ide.singleton";
import {
  findMatchingSnippetDefinitionStrict,
  transformSnippetVariables,
} from "../snippets/snippet";
import { SnippetParser } from "../snippets/vendor/vscodeSnippet/snippetParser";
import { Target } from "../typings/target.types";
import { ensureSingleEditor } from "../util/targetUtils";
import { Actions } from "./Actions";
import { Action, ActionReturnValue } from "./actions.types";

interface NamedSnippetArg {
  type: "named";
  name: string;
  substitutions?: Record<string, string>;
}
interface CustomSnippetArg {
  type: "custom";
  body: string;
  scopeType?: ScopeType;
  substitutions?: Record<string, string>;
}
type InsertSnippetArg = NamedSnippetArg | CustomSnippetArg;

export default class InsertSnippet implements Action {
  private snippetParser = new SnippetParser();

  constructor(
    private rangeUpdater: RangeUpdater,
    private snippets: Snippets,
    private actions: Actions,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  getPrePositionStages(snippetDescription: InsertSnippetArg) {
    const defaultScopeTypes = this.getScopeTypes(snippetDescription);

    return defaultScopeTypes.length === 0
      ? []
      : [
          new ModifyIfUntypedExplicitStage(this.modifierStageFactory, {
            type: "cascading",
            modifiers: defaultScopeTypes.map((scopeType) => ({
              type: "containingScope",
              scopeType,
            })),
          }),
        ];
  }

  private getScopeTypes(snippetDescription: InsertSnippetArg): ScopeType[] {
    if (snippetDescription.type === "named") {
      const { name } = snippetDescription;

      const snippet = this.snippets.getSnippetStrict(name);

      const scopeTypeTypes = snippet.insertionScopeTypes;
      return scopeTypeTypes == null
        ? []
        : scopeTypeTypes.map((scopeTypeType) => ({
            type: scopeTypeType,
          }));
    } else {
      return snippetDescription.scopeType == null
        ? []
        : [snippetDescription.scopeType];
    }
  }

  private getSnippetInfo(
    snippetDescription: InsertSnippetArg,
    targets: Target[],
  ) {
    if (snippetDescription.type === "named") {
      const { name } = snippetDescription;

      const snippet = this.snippets.getSnippetStrict(name);

      const definition = findMatchingSnippetDefinitionStrict(
        targets,
        snippet.definitions,
      );

      return {
        body: definition.body.join("\n"),

        formatSubstitutions(substitutions: Record<string, string> | undefined) {
          return substitutions == null
            ? undefined
            : formatSubstitutions(snippet, definition, substitutions);
        },
      };
    } else {
      return {
        body: snippetDescription.body,

        formatSubstitutions(substitutions: Record<string, string> | undefined) {
          return substitutions;
        },
      };
    }
  }

  async run(
    [targets]: [Target[]],
    snippetDescription: InsertSnippetArg,
  ): Promise<ActionReturnValue> {
    const editor = ide().getEditableTextEditor(ensureSingleEditor(targets));

    const { body, formatSubstitutions } = this.getSnippetInfo(
      snippetDescription,
      targets,
    );

    const parsedSnippet = this.snippetParser.parse(body);

    transformSnippetVariables(
      parsedSnippet,
      null,
      formatSubstitutions(snippetDescription.substitutions),
    );

    const snippetString = parsedSnippet.toTextmateString();

    await this.actions.editNew.run([targets]);

    const targetSelectionInfos = editor.selections.map((selection) =>
      getSelectionInfo(
        editor.document,
        selection,
        RangeExpansionBehavior.openOpen,
      ),
    );

    // NB: We used the command "editor.action.insertSnippet" instead of calling editor.insertSnippet
    // because the latter doesn't support special variables like CLIPBOARD
    const [updatedTargetSelections] = await callFunctionAndUpdateSelectionInfos(
      this.rangeUpdater,
      () => editor.insertSnippet(snippetString),
      editor.document,
      [targetSelectionInfos],
    );

    return {
      thatSelections: updatedTargetSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }
}

/**
 * Applies the appropriate formatters to the given variable substitution values
 * in {@link substitutions} based on the formatter specified for the given
 * variables as defined in {@link snippet} and {@link definition}.
 * @param snippet The full snippet info
 * @param definition The specific definition chosen for the given target context
 * @param substitutions The original unformatted substitution strings
 * @returns A new map of substitution strings with the values formatted
 */
function formatSubstitutions(
  snippet: Snippet,
  definition: SnippetDefinition,
  substitutions: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(substitutions).map(([variableName, value]) => {
      // We prefer the variable formatters from the contextually relevant
      // snippet definition if they exist, otherwise we fall back to the
      // global definitions for the given snippet.
      const formatterName =
        (definition.variables ?? {})[variableName]?.formatter ??
        (snippet.variables ?? {})[variableName]?.formatter;

      if (formatterName == null) {
        return [variableName, value];
      }

      const formatter = textFormatters[formatterName];

      if (formatter == null) {
        throw new Error(
          `Couldn't find formatter ${formatterName} for variable ${variableName}`,
        );
      }

      return [variableName, formatter(value.split(" "))];
    }),
  );
}
