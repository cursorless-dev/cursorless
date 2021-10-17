import { commands, SnippetString, workspace } from "vscode";
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

interface UserLanguageSnippet {
  snippet?: string;
  name?: string;
  langId?: string;
  defaultScopeType?: string;
}

type UserLanguageSnippetMap = Record<string, UserLanguageSnippet>;

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

    await this.graph.actions.setSelection.run([targets]);

    const languageId = editor.document.languageId;
    const snippet = this.getSnippet(languageId, snippetName);

    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    if (snippet.snippet != null) {
      await editor.insertSnippet(snippet.snippet);
    } else {
      await commands.executeCommand("editor.action.codeAction", {
        kind: "refactor.extract.constant",
        preferred: true,
      });
    }

    return {};
  }

  private getSnippet(languageId: string, snippetName: string) {
    const languageSnippets = snippets[languageId];

    const userLanguageSnippets = workspace
      .getConfiguration("cursorless")
      .get<UserLanguageSnippetMap>(`wrapperSnippets`);
    const snippetString = languageSnippets[snippetName];
    if (snippetString == null) {
      throw new Error(
        `Snippet ${snippetName} not supported for language ${languageId}`
      );
    }
    return snippetString;
  }
}
