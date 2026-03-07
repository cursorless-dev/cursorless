import type { TutorialState } from "@cursorless/common";
import { useEffect, useState, type FunctionComponent } from "react";
import type { WebviewApi } from "vscode-webview";
import { TutorialStep } from "./TutorialStep";
import { Command } from "./Command";

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

  switch (state.type) {
    case "pickingTutorial":
      return (
        <div>
          <p>
            To start a tutorial, say <Command spokenForm="tutorial <number>" />,
            or click one of the following tutorials:
          </p>
          <ol className="mt-2 list-decimal">
            {state.tutorials.map((tutorial) => (
              <li key={tutorial.id} className="mb-1">
                <button
                  onClick={() =>
                    vscode.postMessage({
                      type: "start",
                      tutorialId: tutorial.id,
                    })
                  }
                >
                  <TutorialProgressIndicator
                    currentStep={tutorial.currentStep}
                    stepCount={tutorial.stepCount}
                  />
                  {tutorial.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      );

    case "doingTutorial":
      return state.hasErrors ? (
        <div>
          <h1 className="text-(--vscode-walkthrough-stepTitle\.foreground)">
            Error
          </h1>
          <p>
            {state.requiresTalonUpdate ? (
              <>
                Please{" "}
                <a
                  href="https://www.cursorless.org/docs/user/updating/#updating-the-talon-side"
                  className="text-blue-400"
                >
                  update cursorless-talon
                </a>
              </>
            ) : (
              ""
            )}
          </p>
        </div>
      ) : (
        <TutorialStep state={state} vscode={vscode} />
      );
  }
};

const TutorialProgressIndicator: FunctionComponent<{
  currentStep: number;
  stepCount: number;
}> = ({ currentStep, stepCount }) => {
  if (currentStep === 0) {
    return null;
  }
  if (currentStep === stepCount - 1) {
    return <span className="mr-1">✅</span>;
  }
  return <span className="mr-1">🕗</span>;
};
