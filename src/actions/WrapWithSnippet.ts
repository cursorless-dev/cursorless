import { commands, SnippetString, workspace } from "vscode";
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
import {
  Placeholder,
  SnippetParser,
  Variable,
} from "../vendor/snippet/snippetParser";
import { KnownSnippetVariableNames } from "../vendor/snippet/snippetVariables";

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

    var placeholderIndex = 1;
    parsedSnippet.walk((candidate) => {
      if (candidate instanceof Placeholder) {
        placeholderIndex = Math.max(placeholderIndex, candidate.index + 1);
      }
      return true;
    });

    parsedSnippet.walk((candidate) => {
      if (candidate instanceof Variable) {
        if (candidate.name === placeholderName) {
          candidate.name = "TM_SELECTED_TEXT";
        } else if (!KnownSnippetVariableNames[candidate.name]) {
          const placeholder = new Placeholder(placeholderIndex++);
          candidate.children.forEach((child) => placeholder.appendChild(child));
          candidate.parent.replace(candidate, [placeholder]);
        }
      }
      return true;
    });

    const snippetString = parsedSnippet.toTextmateString();
    console.log(`snippetString: ${parsedSnippet.toTextmateString()}`);

    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    const targetSelections = targets.map(
      (target) => target.selection.selection
    );

    await this.graph.actions.setSelection.run([targets]);

    const [updatedTargetSelections] = await callFunctionAndUpdateSelections(
      () =>
        commands.executeCommand("editor.action.insertSnippet", {
          snippet: snippetString,
        }),
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
