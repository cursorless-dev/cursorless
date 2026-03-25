import type { WebviewApi } from "vscode-webview";
import type { ActiveTutorialNoErrorsState } from "@cursorless/lib-common";
import { ArrowLeftIcon } from "./ArrowLeftIcon";
import { ArrowRightIcon } from "./ArrowRightIcon";
import { CloseIcon } from "./CloseIcon";
import { Command } from "./Command";
import { ProgressBar } from "./ProgressBar";

interface Props {
  state: ActiveTutorialNoErrorsState;
  vscode: WebviewApi<undefined>;
}

export function TutorialStep({ state, vscode }: Props) {
  const renderProgress = () => {
    return (
      <div className="mt-2 mb-2 d-flex align-items-center gap-1">
        <ProgressBar
          currentStep={state.stepNumber}
          stepCount={state.stepCount}
        />
        <button
          className="btn btn-link p-0 d-inline-flex"
          onClick={() =>
            vscode.postMessage({
              type: "list",
            })
          }
        >
          <CloseIcon />
        </button>
      </div>
    );
  };

  const renderStepContent = () => {
    if (!state.preConditionsMet) {
      return (
        <>
          <div>Whoops! Looks like you've stepped off the beaten path.</div>
          <div className="mt-1">
            Feel free to keep playing, then say{" "}
            <Command spokenForm="tutorial resume" /> to resume the tutorial.
          </div>
        </>
      );
    }

    return (
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

        <div className="mt-2 d-flex w-100 align-items-center justify-content-between">
          <button
            className="btn btn-link p-0 d-inline-flex"
            onClick={() =>
              vscode.postMessage({
                type: "previous",
              })
            }
          >
            <ArrowLeftIcon size={12} />
          </button>
          <span className="tutorial-step-counter">
            {state.stepNumber + 1} / {state.stepCount}{" "}
          </span>
          <button
            className="btn btn-link p-0 d-inline-flex"
            onClick={() =>
              vscode.postMessage({
                type: "next",
              })
            }
          >
            <ArrowRightIcon size={12} />
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {renderProgress()}
      {renderStepContent()}
    </>
  );
}
