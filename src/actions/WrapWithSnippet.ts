import { SnippetString, workspace } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  ScopeType,
  TypedSelection,
} from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { ensureSingleEditor } from "../util/targetUtils";
import { callFunctionAndUpdateSelections } from "../util/updateSelections";
import { SnippetParser, Variable } from "../vendor/snippetParser";

interface SnippetScope {
  langIds?: string[];
  scopeType?: ScopeType;
}

type SnippetBody = string[];

interface SnippetDefinition {
  body: SnippetBody;
  scope?: SnippetScope;
}

interface Snippet {
  definitions: SnippetDefinition[];
  defaultScopeTypes: Record<string, ScopeType>;
  description?: string;
}

type UserSnippetMap = Record<string, Snippet>;

export default class WrapWithSnippet implements Action {
  snippetParser = new SnippetParser();

  getTargetPreferences(snippetLocation: string): ActionPreferences[] {
    const snippetMap = workspace
      .getConfiguration("cursorless.experimental")
      .get<UserSnippetMap>("snippets")!;

    const [snippetName, placeholderName] =
      parseSnippetLocation(snippetLocation);
    const snippet = snippetMap[snippetName];

    if (snippet == null) {
      throw new Error(`Couldn't find snippet ${snippetName}`);
    }

    const defaultScopeType = snippet.defaultScopeTypes[placeholderName];

    return [
      {
        insideOutsideType: "inside",
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
    snippetLocation: string
  ): Promise<ActionReturnValue> {
    const snippetMap = workspace
      .getConfiguration("cursorless.experimental")
      .get<UserSnippetMap>("snippets")!;

    const [snippetName, placeholderName] =
      parseSnippetLocation(snippetLocation);
    const snippet = snippetMap[snippetName];

    const editor = ensureSingleEditor(targets);

    const definition = findMatchingSnippetDefinition(targets[0], snippet);

    if (definition == null) {
      throw new Error("Couldn't find matching snippet definition");
    }

    const parsedSnippet = this.snippetParser.parse(definition.body.join("\n"));

    const placeholderIndex = parseInt(placeholderName);

    const placeholder = parsedSnippet.placeholders.find(
      (placeholder) => placeholder.index === placeholderIndex
    );

    if (placeholder == null) {
      throw new Error(`Couldn't find placeholder ${placeholderName}`);
    }

    parsedSnippet.replace(placeholder, [new Variable("TM_SELECTED_TEXT")]);

    const snippetString = new SnippetString(parsedSnippet.toTextmateString());

    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    const targetSelections = targets.map(
      (target) => target.selection.selection
    );

    const [updatedTargetSelections] = await callFunctionAndUpdateSelections(
      () => editor.insertSnippet(snippetString, targetSelections),
      editor,
      [targetSelections]
    );

    return {
      thatMark: updatedTargetSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }
}

function parseSnippetLocation(snippetLocation: string): [string, string] {
  const [snippetName, placeholderName] = snippetLocation.split("/");
  return [snippetName, placeholderName];
}

function findMatchingSnippetDefinition(
  typedSelection: TypedSelection,
  snippet: Snippet
) {
  return snippet.definitions.find(({ scope }) => {
    if (scope == null) {
      return true;
    }

    const { langIds, scopeType } = scope;

    if (
      langIds != null &&
      !langIds.includes(typedSelection.selection.editor.document.languageId)
    ) {
      return false;
    }

    if (scopeType != null) {
      // TODO: Implement scope types by refactoring code out of processScopeType
      throw new Error("Scope types not yet implemented");
    }

    return true;
  });
}
