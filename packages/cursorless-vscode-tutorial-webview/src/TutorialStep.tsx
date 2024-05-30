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
      <h1 className="text-[color:var(--vscode-walkthrough-stepTitle\.foreground)]">
        {state.title}
      </h1>
      <progress value={state.stepNumber + 1} max={state.stepCount} />
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
