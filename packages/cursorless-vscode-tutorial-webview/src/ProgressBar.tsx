import { type FunctionComponent } from "react";

interface ProgressBarProps {
  currentStep: number;
  stepCount: number;
}

/**
 * A progress bar that shows the current step in a tutorial.
 *
 * From https://flowbite.com/docs/components/progress/
 */
export const ProgressBar: FunctionComponent<ProgressBarProps> = ({
  currentStep,
  stepCount,
}) => {
  const progress = ((currentStep + 1) / stepCount) * 100;
  return (
    <div className="h-2.5 w-full rounded-full bg-(--vscode-welcomePage-progress\.background)">
      <div
        className="h-2.5 rounded-full bg-(--vscode-welcomePage-progress\.foreground)"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};
