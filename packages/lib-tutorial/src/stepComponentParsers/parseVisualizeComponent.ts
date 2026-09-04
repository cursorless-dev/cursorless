import type { CustomSpokenFormGenerator } from "@cursorless/lib-engine";
import { parseScopeType } from "@cursorless/lib-engine";
import { getScopeTypeSpokenFormStrict } from "../getScopeTypeSpokenFormStrict";
import { getSpokenFormStrict } from "../getSpokenFormStrict";
import type { StepComponent } from "../types/StepComponent";

/**
 * Parses components of the form `{visualize:funk}`. Displays the command for
 * visualizing a scope type and causes the step to automatically advance when
 * the user visualizes the scope type.
 */
export function parseVisualizeComponent(
  customSpokenFormGenerator: CustomSpokenFormGenerator,
  arg: string,
): StepComponent {
  const scopeType = parseScopeType(arg);
  const visualizeSpokenForm = getSpokenFormStrict(
    customSpokenFormGenerator.scopeVisualizerIdToSpokenForm(
      "showScopeVisualizer",
    ),
  );

  return {
    content: {
      type: "command",
      value: `${visualizeSpokenForm} ${getScopeTypeSpokenFormStrict(customSpokenFormGenerator, scopeType)}`,
    },
    trigger: {
      type: "visualize",
      scopeType,
    },
  };
}
