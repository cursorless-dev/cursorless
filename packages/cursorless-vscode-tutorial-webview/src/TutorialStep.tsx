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
          <span className="text-red-600">
            <CloseIcon />
          </span>
        </button>
      </div>
      {state.preConditionsMet ? (
        state.stepContent.map((fragment, i) => (
          <span key={i}>
            {fragment.type === "string" ? (
              <span>{fragment.value}</span>
            ) : fragment.type === "command" ? (
              <Command spokenForm={fragment.value} />
            ) : (
              <span>"{fragment.value}"</span>
            )}
          </span>
        ))
      ) : (
        <>
          Please say <Command spokenForm="tutorial resume" /> to resume.
        </>
      )}
    </div>
  );
};
