import type { TutorialMessage } from "@cursorless/common";
import { useEffect, useState, type FunctionComponent } from "react";
import { WebviewApi } from "vscode-webview";
import type { State } from "./types";

interface Props {
  initialState: State;
  vscode: WebviewApi<State>;
}

export const App: FunctionComponent<Props> = ({ initialState, vscode }) => {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    vscode.setState(state);
  }, [state]);

  useEffect(() => {
    // Handle messages sent from the extension to the webview
    window.addEventListener("message", (event: { data: TutorialMessage }) => {
      const message: TutorialMessage = event.data; // The json data that the extension sent
      switch (message.type) {
        case "startTutorial":
          setState({
            type: "doingTutorial",
            tutorialId: message.tutorialId,
            stepNumber: 0,
          });
          break;
      }
    });
  }, []);

  return state.type === "pickingTutorial" ? (
    <span>Say "cursorless tutorial"</span>
  ) : (
    <span>{state.tutorialId}</span>
  );
};
