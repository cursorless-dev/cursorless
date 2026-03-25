import type { TutorialState } from "@cursorless/lib-common";
import { useEffect, useState } from "preact/hooks";
import type { WebviewApi } from "vscode-webview";
import { Command } from "./Command";
import { TutorialStep } from "./TutorialStep";

interface Props {
  vscode: WebviewApi<undefined>;
}

export function App({ vscode }: Props) {
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
  }, [vscode]);

  if (state == null) {
    // Just show nothing while we're waiting for initial state
    return null;
  }

  switch (state.type) {
    case "pickingTutorial":
      return (
        <div>
          <p>
            To start a tutorial, say <Command spokenForm="tutorial <number>" />,
            or click one of the following tutorials:
          </p>
          <ol className="mt-2">
            {state.tutorials.map((tutorial) => (
              <li key={tutorial.id} className="mb-1">
                <button
                  className="btn btn-link p-0 text-decoration-none"
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
      if (state.hasErrors) {
        return (
          <div>
            <h1 className="has-error">Error</h1>
            {state.requiresTalonUpdate && (
              <p>
                Please{" "}
                <a
                  href="https://www.cursorless.org/docs/user/updating/#updating-the-talon-side"
                  className="link-primary"
                >
                  update cursorless-talon
                </a>
              </p>
            )}
          </div>
        );
      }
      return <TutorialStep state={state} vscode={vscode} />;
  }
}

function TutorialProgressIndicator({
  currentStep,
  stepCount,
}: {
  currentStep: number;
  stepCount: number;
}) {
  if (currentStep === 0) {
    return null;
  }
  if (currentStep === stepCount - 1) {
    return <span className="me-1">✅</span>;
  }
  return <span className="me-1">🕗</span>;
}
