import {
  RangeExpansionBehavior,
  Snippet,
  SnippetDefinition,
  textFormatters,
} from "@cursorless/common";
import {
  callFunctionAndUpdateSelectionInfos,
  getSelectionInfo,
} from "../core/updateSelections/updateSelections";
import { ModifyIfUntypedExplicitStage } from "../processTargets/modifiers/ConditionalModifierStages";
import { ide } from "../singletons/ide.singleton";
import {
  findMatchingSnippetDefinitionStrict,
  transformSnippetVariables,
} from "../snippets/snippet";
import { SnippetParser } from "../snippets/vendor/vscodeSnippet/snippetParser";
import { Graph } from "../typings/Graph";
import { Target } from "../typings/target.types";
import { ensureSingleEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class InsertSnippet implements Action {
  private snippetParser = new SnippetParser();

  getPrePositionStages(snippetName: string) {
    const snippet = this.graph.snippets.getSnippetStrict(snippetName);

    const defaultScopeTypes = snippet.insertionScopeTypes;

    if (defaultScopeTypes == null) {
      return [];
    }

    return [
      new ModifyIfUntypedExplicitStage({
        type: "cascading",
        modifiers: defaultScopeTypes.map((scopeType) => ({
          type: "containingScope",
          scopeType: {
            type: scopeType,
          },
        })),
      }),
    ];
  }

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    snippetName: string,
    substitutions: Record<string, string>,
  ): Promise<ActionReturnValue> {
    const snippet = this.graph.snippets.getSnippetStrict(snippetName);

    const editor = ide().getEditableTextEditor(ensureSingleEditor(targets));

    const definition = findMatchingSnippetDefinitionStrict(
      targets,
      snippet.definitions,
    );

    const parsedSnippet = this.snippetParser.parse(definition.body.join("\n"));

    const formattedSubstitutions =
      substitutions == null
        ? undefined
        : formatSubstitutions(snippet, definition, substitutions);

    transformSnippetVariables(parsedSnippet, null, formattedSubstitutions);

    const snippetString = parsedSnippet.toTextmateString();

    await this.graph.actions.editNew.run([targets]);

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
      this.graph.rangeUpdater,
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
