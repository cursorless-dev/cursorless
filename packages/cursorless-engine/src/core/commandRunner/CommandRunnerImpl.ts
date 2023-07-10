import {
  CommandComplete,
  PartialActionDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";
import { CommandRunner } from "../../CommandRunner";
import { ActionRecord, ActionReturnValue } from "../../actions/actions.types";
import { StoredTargetMap } from "../../index";
import { TargetPipelineRunner } from "../../processTargets";
import { TargetDescriptor } from "../../typings/TargetDescriptor";
import { SelectionWithEditor } from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { getPartialTargetDescriptorFromDestination } from "../../util/getPartialTargetDescriptors.1";
import { Debug } from "../Debug";
import { default as inferFullTargetDescriptors } from "../inferFullTargets";
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
  async run({ action }: CommandComplete): Promise<unknown> {
    // const targetDescriptors = inferFullTargetDescriptors(
    //   partialTargetDescriptors,
    // );

    // if (this.debug.active) {
    //   this.debug.log("Full targets:");
    //   this.debug.log(JSON.stringify(targetDescriptors, null, 2));
    // }

    // const action = this.actions[actionName];

    // const prePositionStages =
    //   action.getPrePositionStages?.(...actionArgs) ?? [];
    // const finalStages = action.getFinalStages?.(...actionArgs) ?? [];

    // const targets = targetDescriptors.map((targetDescriptor) =>
    //   this.pipelineRunner.run(targetDescriptor, prePositionStages, finalStages),
    // );

    const {
      returnValue,
      thatSelections: newThatSelections,
      thatTargets: newThatTargets,
      sourceSelections: newSourceSelections,
      sourceTargets: newSourceTargets,
      instanceReferenceTargets: newInstanceReferenceTargets,
    } = await this.runAction(action);

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

  private runAction(
    partialActionDescriptor: PartialActionDescriptor,
  ): Promise<ActionReturnValue> {
    const action = this.actions[partialActionDescriptor.name];

    switch (partialActionDescriptor.name) {
      case "replaceWithTarget":
      case "moveToTarget":
        {
          const [sourceDescriptor, destinationTargetDescriptor] =
            this.inferFullTargetDescriptors([
              partialActionDescriptor.source,
              getPartialTargetDescriptorFromDestination(
                partialActionDescriptor.destination,
              ),
            ]);

          // Note: we don't need to worry about final stages here because bring and move don't use them!
          const source = this.pipelineRunner.run(sourceDescriptor);
          const destination = this.pipelineRunner.run(
            destinationTargetDescriptor,
          );
          // map((target, index) => target.toDestination)
          // .getDestination(partialActionDescriptor.destination.insertionMode);
          throw Error("stuff");

          // return action.run(source, destination);
        }
        break;
      default:
        throw Error("stuff");
      // case "wrapWithPairedDelimiter":
      //   // Some duplication with default case, but not tooo bad
      //   const [targetDescriptor] = inferFullTargets([
      //     partialActionDescriptor.target,
      //   ]);
      //   const target = pipelineRunner.run(targetDescriptor);

      //   return action.run(
      //     target,
      //     partialActionDescriptor.left,
      //     partialActionDescriptor.right,
      //   );
      // default:
      //   // TODO: Could prob expose `inferFullTarget` (singular) that takes single descriptor with no previousTargets
      //   // eg const targetDescriptor = inferFullTarget(partialActionDescriptor.target)
      //   const [targetDescriptor] = inferFullTargets([
      //     partialActionDescriptor.target,
      //   ]);

      //   // TODO: Do we want to handle final stages in the generic case?  Most
      //   // actions don't have them anyway so we might want special cases for them
      //   const target = pipelineRunner.run(targetDescriptor);

      //   return action.run(target);
    }
  }

  private inferFullTargetDescriptors(
    targets: PartialTargetDescriptor[],
  ): TargetDescriptor[] {
    const targetDescriptors = inferFullTargetDescriptors(targets);

    if (this.debug.active) {
      this.debug.log("Full targets:");
      this.debug.log(JSON.stringify(targetDescriptors, null, 2));
    }

    return targetDescriptors;
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
