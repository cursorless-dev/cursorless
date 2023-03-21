import { FlashStyle } from "@cursorless/common";
import { callFunctionAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ModifyIfUntypedStage } from "../processTargets/modifiers/ConditionalModifierStages";
import { ide } from "../singletons/ide.singleton";
import {
  findMatchingSnippetDefinitionStrict,
  transformSnippetVariables,
} from "../snippets/snippet";
import { SnippetParser } from "../snippets/vendor/vscodeSnippet/snippetParser";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Graph";
import { ensureSingleEditor, flashTargets } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class WrapWithSnippet implements Action {
  private snippetParser = new SnippetParser();

  getFinalStages(snippetLocation: string) {
    const [snippetName, placeholderName] =
      parseSnippetLocation(snippetLocation);

    const snippet = this.graph.snippets.getSnippetStrict(snippetName);

    const variables = snippet.variables ?? {};
    const defaultScopeType = variables[placeholderName]?.wrapperScopeType;

    if (defaultScopeType == null) {
      return [];
    }

    return [
      new ModifyIfUntypedStage({
        type: "modifyIfUntyped",
        modifier: {
          type: "containingScope",
          scopeType: {
            type: defaultScopeType,
          },
        },
      }),
    ];
  }

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    snippetLocation: string,
  ): Promise<ActionReturnValue> {
    const [snippetName, placeholderName] =
      parseSnippetLocation(snippetLocation);

    const snippet = this.graph.snippets.getSnippetStrict(snippetName);

    const editor = ide().getEditableTextEditor(ensureSingleEditor(targets));

    const definition = findMatchingSnippetDefinitionStrict(
      targets,
      snippet.definitions,
    );

    const parsedSnippet = this.snippetParser.parse(definition.body.join("\n"));

    transformSnippetVariables(parsedSnippet, placeholderName);

    const snippetString = parsedSnippet.toTextmateString();

    await flashTargets(ide(), targets, FlashStyle.pendingModification0);

    const targetSelections = targets.map((target) => target.contentSelection);

    // NB: We used the command "editor.action.insertSnippet" instead of calling editor.insertSnippet
    // because the latter doesn't support special variables like CLIPBOARD
    const [updatedTargetSelections] = await callFunctionAndUpdateSelections(
      this.graph.rangeUpdater,
      () => editor.insertSnippet(snippetString, targetSelections),
      editor.document,
      [targetSelections],
    );

    return {
      thatSelections: updatedTargetSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }
}

function parseSnippetLocation(snippetLocation: string): [string, string] {
  const [snippetName, placeholderName] = snippetLocation.split(".");
  if (snippetName == null || placeholderName == null) {
    throw new Error("Snippet location missing '.'");
  }
  return [snippetName, placeholderName];
}
