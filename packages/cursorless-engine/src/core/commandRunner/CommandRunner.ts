import { PartialTargetDescriptor } from "@cursorless/common";
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import { Actions } from "../../actions/Actions";
import { Action } from "../../actions/actions.types";
import { StoredTargetMap } from "../../index";
import { TargetPipelineRunner } from "../../processTargets";
import { Target } from "../../typings/target.types";
import { SelectionWithEditor } from "../../typings/Types";
import { checkForOldInference } from "../commandVersionUpgrades/canonicalizeAndValidateCommand";
import { Debug } from "../Debug";
import inferFullTargets from "../inferFullTargets";
import { selectionToThatTarget } from "./selectionToThatTarget";

export class CommandRunner {
  constructor(
    private debug: Debug,
    private storedTargets: StoredTargetMap,
    private pipelineRunner: TargetPipelineRunner,
  ) {}

  /**
   * Entry point for Cursorless commands. We proceed as follows:
   *
   * 1. Perform inference on targets to fill in details left out using things
   *    like previous targets. For example we would automatically infer that
   *    `"take funk air and bat"` is equivalent to `"take funk air and funk
   *    bat"`. See {@link inferFullTargets} for details of how this is done.
   * 2. Call {@link processTargets} to map each abstract {@link Target} object
   *    to a concrete list of {@link Target} objects.
   * 3. Run the requested action on the given selections. The mapping from
   *    action id (eg `remove`) to implementation is defined in {@link Actions}.
   *    To understand how actions work, see some examples, such as `"take"`
   *    {@link SetSelection} and `"chuck"` {@link Delete}. See
   * 4. Update `source` and `that` marks, if they have been returned from the
   *    action, and returns the desired return value indicated by the action, if
   *    it has one.
   */
  async run(
    action: Action,
    actionArgs: unknown[],
    partialTargetDescriptors: PartialTargetDescriptor[],
  ) {
    // NB: We do this once test recording has started so that we can capture
    // warning.
    checkForOldInference(partialTargetDescriptors);

    const targetDescriptors = inferFullTargets(partialTargetDescriptors);

    if (this.debug.active) {
      this.debug.log("Full targets:");
      this.debug.log(JSON.stringify(targetDescriptors, null, 3));
    }

    const actionPrePositionStages =
      action.getPrePositionStages != null
        ? action.getPrePositionStages(...actionArgs)
        : [];

    const actionFinalStages =
      action.getFinalStages != null ? action.getFinalStages(...actionArgs) : [];

    const targets = this.pipelineRunner.run(
      targetDescriptors,
      actionPrePositionStages,
      actionFinalStages,
    );

    const {
      returnValue,
      thatSelections: newThatSelections,
      thatTargets: newThatTargets,
      sourceSelections: newSourceSelections,
      sourceTargets: newSourceTargets,
    } = await action.run(targets, ...actionArgs);

    this.storedTargets.set(
      "that",
      constructThatTarget(newThatTargets, newThatSelections),
    );
    this.storedTargets.set(
      "source",
      constructThatTarget(newSourceTargets, newSourceSelections),
    );

    return returnValue;
  }
}

function constructThatTarget(
  targets: Target[] | undefined,
  selections: SelectionWithEditor[] | undefined,
) {
  if (targets != null && selections != null) {
    throw Error(
      "Actions may only return full targets or selections for that mark",
    );
  }

  if (selections != null) {
    return selections.map(selectionToThatTarget);
  } else {
    return targets;
  }
}
