import type { ActiveTutorialNoErrorsState } from "@cursorless/common";
import { type FunctionComponent } from "react";
import type { WebviewApi } from "vscode-webview";
import { ArrowLeftIcon } from "./ArrowLeftIcon";
import { ArrowRightIcon } from "./ArrowRightIcon";
import { CloseIcon } from "./CloseIcon";
import { Command } from "./Command";
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
      <div className="mt-2 mb-2 flex items-center gap-[0.2em]">
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
        <>
          {state.stepContent.map((paragraph, i) => (
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
          ))}
          <div className="mt-2 flex w-full flex-row justify-between">
            <button
              onClick={() =>
                vscode.postMessage({
                  type: "previous",
                })
              }
            >
              <span>
                <ArrowLeftIcon size={12} />
              </span>
            </button>
            <span className="text-2xs">
              {state.stepNumber + 1} / {state.stepCount}{" "}
            </span>
            <button
              onClick={() =>
                vscode.postMessage({
                  type: "next",
                })
              }
            >
              <span>
                <ArrowRightIcon size={12} />
              </span>
            </button>
          </div>
        </>
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
