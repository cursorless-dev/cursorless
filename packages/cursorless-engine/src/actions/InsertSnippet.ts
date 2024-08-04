import type {
  InsertSnippetArg,
  ScopeType,
  Snippet,
  SnippetDefinition,
} from "@cursorless/common";
import { RangeExpansionBehavior, textFormatters } from "@cursorless/common";
import type { Snippets } from "../core/Snippets";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ModifyIfUntypedExplicitStage } from "../processTargets/modifiers/ConditionalModifierStages";
import { UntypedTarget } from "../processTargets/targets";
import { ide } from "../singletons/ide.singleton";
import {
  findMatchingSnippetDefinitionStrict,
  transformSnippetVariables,
} from "../snippets/snippet";
import { SnippetParser } from "../snippets/vendor/vscodeSnippet/snippetParser";
import type { Destination, Target } from "../typings/target.types";
import { ensureSingleEditor } from "../util/targetUtils";
import type { Actions } from "./Actions";
import type { ActionReturnValue } from "./actions.types";

export default class InsertSnippet {
  private snippetParser = new SnippetParser();

  constructor(
    private rangeUpdater: RangeUpdater,
    private snippets: Snippets,
    private actions: Actions,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  getFinalStages(snippetDescription: InsertSnippetArg) {
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
      return snippetDescription.scopeTypes ?? [];
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
        this.modifierStageFactory,
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
    destinations: Destination[],
    snippetDescription: InsertSnippetArg,
  ): Promise<ActionReturnValue> {
    const editor = ide().getEditableTextEditor(
      ensureSingleEditor(destinations),
    );

    await this.actions.editNew.run(destinations);

    const { body, formatSubstitutions } = this.getSnippetInfo(
      snippetDescription,
      // Use new selection locations instead of original targets because
      // that's where we'll be doing the snippet insertion
      editor.selections.map(
        (selection) =>
          new UntypedTarget({
            editor,
            contentRange: selection,
            isReversed: false,
            hasExplicitRange: true,
          }),
      ),
    );

    const parsedSnippet = this.snippetParser.parse(body);

    transformSnippetVariables(
      parsedSnippet,
      null,
      formatSubstitutions(snippetDescription.substitutions),
    );

    const snippetString = parsedSnippet.toTextmateString();

    const { editorSelections: updatedThatSelections } =
      await performEditsAndUpdateSelections({
        rangeUpdater: this.rangeUpdater,
        editor,
        callback: () => editor.insertSnippet(snippetString),
        preserveCursorSelections: true,
        selections: {
          editorSelections: {
            selections: editor.selections,
            behavior: RangeExpansionBehavior.openOpen,
          },
        },
      });

    return {
      thatSelections: updatedThatSelections.map((selection) => ({
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
