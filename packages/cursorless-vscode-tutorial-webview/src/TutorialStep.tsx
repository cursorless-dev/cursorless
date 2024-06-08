import { ActiveTutorialNoErrorsState } from "@cursorless/common";
import { type FunctionComponent } from "react";
import { Command } from "./Command";

interface TutorialStepProps {
  state: ActiveTutorialNoErrorsState;
}

export const TutorialStep: FunctionComponent<TutorialStepProps> = ({
  state,
}) => {
  return (
    <div>
      <div className="mb-1 mt-2 flex items-center gap-2">
        <progress
          className="[&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-[var(--vscode-welcomePage-progress\.background)] [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-[var(--vscode-welcomePage-progress\.foreground)]"
          value={state.stepNumber + 1}
          max={state.stepCount}
        />
        <i className="codicon codicon-clock"></i>
        <span className="text-xs">❌</span>
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
