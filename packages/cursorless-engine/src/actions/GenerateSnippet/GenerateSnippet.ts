import type { Snippets } from "../../core/Snippets";
import type { Target } from "../../typings/target.types";
import type { ActionReturnValue } from "../actions.types";
import GenerateSnippetCommunity from "./GenerateSnippetCommunity";
import GenerateSnippetLegacy from "./GenerateSnippetLegacy";

export default class GenerateSnippet {
  constructor(private snippets: Snippets) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    dirPath?: string,
    snippetName?: string,
  ): Promise<ActionReturnValue> {
    if (dirPath == null) {
      const action = new GenerateSnippetLegacy(this.snippets);
      return action.run(targets, snippetName);
    }

    const action = new GenerateSnippetCommunity(this.snippets);
    return action.run(targets, dirPath, snippetName);
  }
}
