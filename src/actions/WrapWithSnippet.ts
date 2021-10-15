import { SnippetString } from "vscode";
import { snippets } from "../languages";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  SnippetName,
  TypedSelection,
} from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { ensureSingleEditor } from "../util/targetUtils";

export default class WrapWithSnippet implements Action {
  targetPreferences: ActionPreferences[] = [
    {
      insideOutsideType: "inside",
      modifier: {
        type: "containingScope",
        scopeType: "statement",
        includeSiblings: false,
      },
    },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    snippetName: SnippetName
  ): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const languageId = editor.document.languageId;
    const languageSnippets = snippets[languageId];
    if (languageSnippets == null) {
      throw new Error(`Snippets not supported for language ${languageId}`);
    }

    const snippetString = languageSnippets[snippetName];
    if (snippetString == null) {
      throw new Error(
        `Snippet ${snippetName} not supported for language ${languageId}`
      );
    }

    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    await editor.insertSnippet(
      snippetString,
      targets.map((target) => target.selection.selection)
    );

    return {};
  }
}
