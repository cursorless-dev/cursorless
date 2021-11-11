import { commands, DecorationRangeBehavior } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { ensureSingleEditor } from "../util/targetUtils";
import { SnippetParser } from "../vendor/snippet/snippetParser";
import {
  findMatchingSnippetDefinition,
  transformSnippetVariables,
} from "../util/snippet";
import textFormatters from "../core/textFormatters";
import { SnippetDefinition, Snippet } from "../typings/snippet";
import {
  callFunctionAndUpdateSelectionInfos,
  callFunctionAndUpdateSelections,
  getSelectionInfo,
} from "../core/updateSelections/updateSelections";

export default class InsertSnippet implements Action {
  private snippetParser = new SnippetParser();

  getTargetPreferences(snippetName: string): ActionPreferences[] {
    const snippet = this.graph.snippets.getSnippet(snippetName);

    if (snippet == null) {
      throw new Error(`Couldn't find snippet ${snippetName}`);
    }

    const defaultScopeType = snippet.insertionScopeType;

    return [
      {
        insideOutsideType: "outside",
        modifier:
          defaultScopeType == null
            ? undefined
            : {
                type: "containingScope",
                scopeType: defaultScopeType,
                includeSiblings: false,
              },
      },
    ];
  }

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    snippetName: string,
    substitutions: Record<string, string>
  ): Promise<ActionReturnValue> {
    const snippet = this.graph.snippets.getSnippet(snippetName)!;

    const editor = ensureSingleEditor(targets);

    // Find snippet definition matching context.
    // NB: We only look at the first target to create our context. This means
    // that if there are two snippets that match two different contexts, and
    // the two targets match those two different contexts, we will just use the
    // snippet that matches the first context for both targets
    const definition = findMatchingSnippetDefinition(
      targets[0],
      snippet.definitions
    );

    if (definition == null) {
      throw new Error("Couldn't find matching snippet definition");
    }

    const parsedSnippet = this.snippetParser.parse(definition.body.join("\n"));

    const formattedSubstitutions =
      substitutions == null
        ? undefined
        : formatSubstitutions(snippet, definition, substitutions);

    transformSnippetVariables(parsedSnippet, null, formattedSubstitutions);

    const snippetString = parsedSnippet.toTextmateString();

    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    const targetSelections = targets.map(
      (target) => target.selection.selection
    );

    // TODO: Fix "insert before" once we have the new update selections code
    // TODO: Remove undo stop once we have the new update selections code
    await this.graph.actions.setSelection.run([targets]);

    // NB: We do this to auto insert the delimiter if necessary
    await this.graph.actions.replace.run([targets], [""]);

    const targetSelectionInfos = targetSelections.map((selection) =>
      getSelectionInfo(
        editor.document,
        selection,
        DecorationRangeBehavior.OpenOpen
      )
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
      [targetSelectionInfos]
    );

    return {
      thatMark: updatedTargetSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }
}
function formatSubstitutions(
  snippet: Snippet,
  definition: SnippetDefinition,
  substitutions: Record<string, string>
) {
  return Object.fromEntries(
    Object.entries(substitutions).map(([variableName, value]) => {
      const formatterName =
        (definition.variables ?? {})[variableName]?.formatter ??
        (snippet.variables ?? {})[variableName]?.formatter;

      if (formatterName == null) {
        return [variableName, value];
      }

      const formatter = textFormatters[formatterName];

      if (formatter == null) {
        throw new Error(
          `Couldn't find formatter ${formatterName} for variable ${variableName}`
        );
      }

      return [variableName, formatter(value.split(" "))];
    })
  );
}
