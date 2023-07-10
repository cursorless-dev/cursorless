import { CommandComplete } from "@cursorless/common";
import { CommandRunner } from "../../CommandRunner";
import { ActionRecord } from "../../actions/actions.types";
import { StoredTargetMap } from "../../index";
import { TargetPipelineRunner } from "../../processTargets";
import { SelectionWithEditor } from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { Debug } from "../Debug";
import { checkForOldInference } from "../commandVersionUpgrades/canonicalizeAndValidateCommand";
import inferFullTargetDescriptors from "../inferFullTargets";
import { selectionToStoredTarget } from "./selectionToStoredTarget";

export class CommandRunnerImpl implements CommandRunner {
  constructor(
    private debug: Debug,
    private storedTargets: StoredTargetMap,
    private pipelineRunner: TargetPipelineRunner,
    private actions: ActionRecord,
  ) {}

  /**
   * Runs a Cursorless command. We proceed as follows:
   *
   * 1. Perform inference on targets to fill in details left out using things
   *    like previous targets. For example we would automatically infer that
   *    `"take funk air and bat"` is equivalent to `"take funk air and funk
   *    bat"`. See {@link inferFullTargetDescriptors} for details of how this is done.
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
  async run({
    action: { name: actionName, args: actionArgs },
    targets: partialTargetDescriptors,
  }: CommandComplete): Promise<unknown> {
    checkForOldInference(partialTargetDescriptors);

    const targetDescriptors = inferFullTargetDescriptors(
      partialTargetDescriptors,
    );

    if (this.debug.active) {
      this.debug.log("Full targets:");
      this.debug.log(JSON.stringify(targetDescriptors, null, 2));
    }

    const action = this.actions[actionName];

    const prePositionStages =
      action.getPrePositionStages?.(...actionArgs) ?? [];
    const finalStages = action.getFinalStages?.(...actionArgs) ?? [];

    const targets = targetDescriptors.map((targetDescriptor) =>
      this.pipelineRunner.run(targetDescriptor, prePositionStages, finalStages),
    );

    const {
      returnValue,
      thatSelections: newThatSelections,
      thatTargets: newThatTargets,
      sourceSelections: newSourceSelections,
      sourceTargets: newSourceTargets,
      instanceReferenceTargets: newInstanceReferenceTargets,
    } = await action.run(targets, ...actionArgs);

    this.storedTargets.set(
      "that",
      constructStoredTarget(newThatTargets, newThatSelections),
    );
    this.storedTargets.set(
      "source",
      constructStoredTarget(newSourceTargets, newSourceSelections),
    );
    this.storedTargets.set("instanceReference", newInstanceReferenceTargets);

    return returnValue;
  }
}

function constructStoredTarget(
  targets: Target[] | undefined,
  selections: SelectionWithEditor[] | undefined,
) {
  if (targets != null && selections != null) {
    throw Error(
      "Actions may only return full targets or selections for that mark",
    );
  }

  if (selections != null) {
    return selections.map(selectionToStoredTarget);
  } else {
    return targets;
  }
}
