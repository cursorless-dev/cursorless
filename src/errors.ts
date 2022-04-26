import * as vscode from "vscode";

export class UnsupportedLanguageError extends Error {
  constructor(languageId: string) {
    super(
      `Language '${languageId}' is not implemented yet; See https://www.cursorless.org/docs/contributing/adding-a-new-language/`
    );
    this.name = "UnsupportedLanguageError";
  }
}

interface ErrorAction {
  /**
   * The name of the action to show to the user
   */
  name: string;

  /**
   * The function that is called if the user selects this action
   */
  action: () => void;
}

/**
 * Throw this error if you want the displayed error message to have a list of
 * actions that the user can take
 */
export class ActionableError extends Error {
  actionMap: Record<string, () => void>;

  /**
   *
   * @param message The message to show to the user
   * @param actions A list of actions to show to the user
   */
  constructor(message: string, actions: ErrorAction[]) {
    super(message);
    this.name = "ActionableError";
    this.actionMap = Object.fromEntries(
      actions.map(({ name, action }) => [name, action])
    );
  }

  showErrorMessage() {
    const actionMap = this.actionMap;
    vscode.window
      .showErrorMessage(this.message, ...Object.keys(this.actionMap))
      .then((item) => {
        if (item == null) {
          return;
        }

        actionMap[item]();
      });
  }
}
