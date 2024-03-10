import React, { useEffect, useState } from "react";
import type { State } from "./types";
import { TutorialMessage } from "@cursorless/common";

interface Props {
  initialState: State;
  vscode: WebviewApi;
}

export const App: React.FunctionComponent<Props> = ({
  initialState,
  vscode,
}) => {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    vscode.setState(state);
  }, [state]);

  useEffect(() => {
    // Handle messages sent from the extension to the webview
    window.addEventListener("message", (event) => {
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
