import { ActiveTutorialState } from "@cursorless/common";
import { type FunctionComponent } from "react";

interface TutorialStepProps {
  state: ActiveTutorialState;
}

export const TutorialStep: FunctionComponent<TutorialStepProps> = ({
  state,
}) => {
  return (
    <div>
      <h1 className="text-[color:var(--vscode-walkthrough-stepTitle\.foreground)]">{state.title}</h1>
      <progress value={state.stepNumber+1} max={state.stepCount} />
      {state.stepContent}
    </div>
  );
};
