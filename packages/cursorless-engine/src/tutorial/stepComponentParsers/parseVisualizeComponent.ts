import { parseScopeType } from "../../customCommandGrammar/parseCommand";
import { CustomSpokenFormGeneratorImpl } from "../../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { StepComponent } from "../types/StepComponent";
import { getScopeTypeSpokenFormStrict } from "../getScopeTypeSpokenFormStrict";
import { specialTerms } from "../specialTerms";

/**
 * Parses components of the form `{visualize:funk}`. Displays the command for
 * visualizing a scope type and causes the step to automatically advance when
 * the user visualizes the scope type.
 */
export async function parseVisualizeComponent(
  customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  arg: string,
): Promise<StepComponent> {
  const scopeType = parseScopeType(arg);

  return {
    content: {
      type: "command",
      value: `${specialTerms.visualize} ${getScopeTypeSpokenFormStrict(customSpokenFormGenerator, scopeType)}`,
    },
    trigger: {
      type: "visualize",
      scopeType,
    },
  };
}
