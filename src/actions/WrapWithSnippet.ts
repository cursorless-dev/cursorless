import { commands } from "vscode";
import { callFunctionAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { SnippetDefinition } from "../typings/snippet";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { ensureSingleEditor } from "../util/targetUtils";
import {
  Placeholder,
  SnippetParser,
  TextmateSnippet,
  Variable,
} from "../vendor/snippet/snippetParser";
import { KnownSnippetVariableNames } from "../vendor/snippet/snippetVariables";

export default class WrapWithSnippet implements Action {
  private snippetParser = new SnippetParser();

  getTargetPreferences(snippetLocation: string): ActionPreferences[] {
    const [snippetName, placeholderName] =
      parseSnippetLocation(snippetLocation);

    const snippet = this.graph.snippets.getSnippet(snippetName);

    if (snippet == null) {
      throw new Error(`Couldn't find snippet ${snippetName}`);
    }

    const variables = snippet.variables ?? {};
    const defaultScopeType = variables[placeholderName]?.wrapperScopeType;

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
    const [snippetName, placeholderName] =
      parseSnippetLocation(snippetLocation);

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

    transformSnippetVariables(parsedSnippet, placeholderName);

    const snippetString = parsedSnippet.toTextmateString();

    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.pendingModification0
    );

    const targetSelections = targets.map(
      (target) => target.selection.selection
    );

    await this.graph.actions.setSelection.run([targets]);

    // NB: We used the command "editor.action.insertSnippet" instead of calling editor.insertSnippet
    // because the latter doesn't support special variables like CLIPBOARD
    const [updatedTargetSelections] = await callFunctionAndUpdateSelections(
      this.graph.rangeUpdater,
      () =>
        commands.executeCommand("editor.action.insertSnippet", {
          snippet: snippetString,
        }),
      editor.document,
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

/**
 * Replaces the snippet variable with name `placeholderName` with TM_SELECTED_TEXT
 *
 * Also replaces any unknown variables with placeholders. We do this so it's
 * easier to leave one of the placeholders blank. We may make it so that you
 * can disable this with a setting in the future
 * @param parsedSnippet The parsed textmate snippet to operate on
 * @param placeholderName The variable name to replace with TM_SELECTED_TEXT
 */
function transformSnippetVariables(
  parsedSnippet: TextmateSnippet,
  placeholderName: string
) {
  var placeholderIndex = getMaxPlaceholderIndex(parsedSnippet) + 1;

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
}

function getMaxPlaceholderIndex(parsedSnippet: TextmateSnippet) {
  var placeholderIndex = 0;
  parsedSnippet.walk((candidate) => {
    if (candidate instanceof Placeholder) {
      placeholderIndex = Math.max(placeholderIndex, candidate.index);
    }
    return true;
  });
  return placeholderIndex;
}

function parseSnippetLocation(snippetLocation: string): [string, string] {
  const [snippetName, placeholderName] = snippetLocation.split(".");
  if (snippetName == null || placeholderName == null) {
    throw new Error("Snippet location missing '.'");
  }
  return [snippetName, placeholderName];
}

function findMatchingSnippetDefinition(
  typedSelection: TypedSelection,
  definitions: SnippetDefinition[]
) {
  const languageId = typedSelection.selection.editor.document.languageId;

  return definitions.find(({ scope }) => {
    if (scope == null) {
      return true;
    }

    const { langIds, scopeType } = scope;

    if (langIds != null && !langIds.includes(languageId)) {
      return false;
    }

    if (scopeType != null) {
      // TODO: Implement scope types by refactoring code out of processScopeType
      throw new Error("Scope types not yet implemented");
    }

    return true;
  });
}
