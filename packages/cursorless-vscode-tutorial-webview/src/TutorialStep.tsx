import { ActiveTutorialNoErrorsState } from "@cursorless/common";
import { type FunctionComponent } from "react";
import { Command } from "./Command";
import { WebviewApi } from "vscode-webview";
import { CloseIcon } from "./CloseIcon";
import { ProgressBar } from "./ProgressBar";

interface TutorialStepProps {
  state: ActiveTutorialNoErrorsState;
  vscode: WebviewApi<undefined>;
}

export const TutorialStep: FunctionComponent<TutorialStepProps> = ({
  state,
  vscode,
}) => {
  return (
    <div>
      <div className="mb-2 mt-2 flex items-center gap-[0.2em]">
        <ProgressBar
          currentStep={state.stepNumber}
          stepCount={state.stepCount}
        />
        <button
          onClick={() =>
            vscode.postMessage({
              type: "list",
            })
          }
        >
          <span>
            <CloseIcon />
          </span>
        </button>
      </div>
      {state.preConditionsMet ? (
        state.stepContent.map((paragraph, i) => (
          <div key={i} className="mt-1">
            {paragraph.map((fragment, j) => {
              switch (fragment.type) {
                case "string":
                  return <span key={j}>{fragment.value}</span>;
                case "command":
                  return <Command spokenForm={fragment.value} />;
                case "term":
                  return <span>"{fragment.value}"</span>;
                default: {
                  // Ensure we handle all cases
                  const _unused: never = fragment;
                }
              }
            })}
          </div>
        ))
      ) : (
        <>
          <div>Whoops! Looks like you've stepped off the beaten path.</div>
          <div className="mt-1">
            Feel free to keep playing, then say{" "}
            <Command spokenForm="tutorial resume" /> to resume the tutorial.
          </div>
        </>
      )}
    </div>
  );
};
