import { TutorialState } from "@cursorless/common";
import { useEffect, useState, type FunctionComponent } from "react";
import { WebviewApi } from "vscode-webview";
import { TutorialStep } from "./TutorialStep";

interface Props {
  vscode: WebviewApi<undefined>;
}

export const App: FunctionComponent<Props> = ({ vscode }) => {
  const [state, setState] = useState<TutorialState>();

  useEffect(() => {
    // Handle messages sent from the extension to the webview
    window.addEventListener(
      "message",
      ({ data: newState }: { data: TutorialState }) => {
        setState(newState);
      },
    );

    vscode.postMessage({ type: "getInitialState" });
  }, []);

  if (state == null) {
    // Just show nothing while we're waiting for initial state
    return <></>;
  }

  return state.type === "pickingTutorial" ? (
    <span>Say "cursorless tutorial"</span>
  ) : (
    <TutorialStep state={state} />
  );
};
