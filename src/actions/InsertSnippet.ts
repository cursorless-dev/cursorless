import { commands, DecorationRangeBehavior } from "vscode";
import textFormatters from "../core/textFormatters";
import {
  callFunctionAndUpdateSelectionInfos,
  getSelectionInfo,
} from "../core/updateSelections/updateSelections";
import ModifyIfUntypedStage from "../processTargets/modifiers/ModifyIfUntypedStage";
import { Snippet, SnippetDefinition } from "../typings/snippet";
import { EditableTarget } from "../typings/target.types";
import { Graph } from "../typings/Types";
import {
  findMatchingSnippetDefinitionStrict,
  transformSnippetVariables,
} from "../util/snippet";
import { ensureSingleEditor } from "../util/targetUtils";
import { SnippetParser } from "../vendor/snippet/snippetParser";
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
      new ModifyIfUntypedStage({
        type: "modifyIfUntyped",
        modifier: {
          type: "cascading",
          modifiers: defaultScopeTypes.map((scopeType) => ({
            type: "containingScope",
            scopeType: {
              type: scopeType,
            },
          })),
        },
      }),
    ];
  }

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [EditableTarget[]],
    snippetName: string,
    substitutions: Record<string, string>,
  ): Promise<ActionReturnValue> {
    const snippet = this.graph.snippets.getSnippetStrict(snippetName);

    const editor = ensureSingleEditor(targets);

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
        DecorationRangeBehavior.OpenOpen,
      ),
    );

    // NB: We used the command "editor.action.insertSnippet" instead of calling editor.insertSnippet
    // because the latter doesn't support special variables like CLIPBOARD
    const [updatedTargetSelections] = await callFunctionAndUpdateSelectionInfos(
      this.graph.rangeUpdater,
      () =>
        commands.executeCommand("editor.action.insertSnippet", {
          snippet: snippetString,
        }),
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
