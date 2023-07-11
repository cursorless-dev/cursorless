import {
  CommandComplete,
  PartialActionDescriptor,
  PartialDestinationDescriptor,
  PartialPrimitiveDestinationDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";
import { CommandRunner } from "../../CommandRunner";
import { ActionRecord, ActionReturnValue } from "../../actions/actions.types";
import { StoredTargetMap } from "../../index";
import { TargetPipelineRunner } from "../../processTargets";
import { ModifierStage } from "../../processTargets/PipelineStages.types";
import { SelectionWithEditor } from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { Debug } from "../Debug";
import { inferFullTargetDescriptor } from "../inferFullTargets";
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
    const inferenceContext = new InferenceContext();

    switch (partialActionDescriptor.name) {
      case "replaceWithTarget":
      case "moveToTarget": {
        const sources = this.getTargets(
          inferenceContext,
          partialActionDescriptor.source,
        );
        const destinations = this.getDestinations(
          inferenceContext,
          partialActionDescriptor.destination,
        );
        return partialActionDescriptor.name === "replaceWithTarget"
          ? this.actions.replaceWithTarget.run(sources, destinations)
          : this.actions.moveToTarget.run(sources, destinations);
      }
      case "swapTargets": {
        const targets1 = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target1,
        );
        const targets2 = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target2,
        );
        return this.actions.swapTargets.run(targets1, targets2);
      }
      case "callAsFunction": {
        const callees = this.getTargets(
          inferenceContext,
          partialActionDescriptor.callees,
        );
        const args = this.getTargets(
          inferenceContext,
          partialActionDescriptor.args,
        );
        return this.actions.callAsFunction.run(callees, args);
      }
      case "wrapWithPairedDelimiter": {
        const targets = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target,
        );
        return this.actions.wrapWithPairedDelimiter.run(
          targets,
          partialActionDescriptor.left,
          partialActionDescriptor.right,
        );
      }
      case "rewrapWithPairedDelimiter": {
        const targets = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target,
          undefined,
          this.actions.rewrapWithPairedDelimiter.getFinalStages(),
        );
        return this.actions.rewrapWithPairedDelimiter.run(
          targets,
          partialActionDescriptor.left,
          partialActionDescriptor.right,
        );
      }
      case "pasteFromClipboard": {
        const destinations = this.getDestinations(
          inferenceContext,
          partialActionDescriptor.destination,
        );
        return this.actions.pasteFromClipboard.run(destinations);
      }
      case "executeCommand": {
        const targets = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target,
        );
        return this.actions.executeCommand.run(
          targets,
          partialActionDescriptor.commandId,
          partialActionDescriptor.options,
        );
      }
      case "replace": {
        const targets = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target,
        );
        return this.actions.replace.run(
          targets,
          partialActionDescriptor.replaceWith,
        );
      }
      case "highlight": {
        const targets = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target,
        );
        return this.actions.highlight.run(
          targets,
          partialActionDescriptor.highlightId,
        );
      }
      case "generateSnippet": {
        const targets = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target,
        );
        return this.actions.generateSnippet.run(
          targets,
          partialActionDescriptor.snippetName,
        );
      }
      case "insertSnippet": {
        const destinations = this.getDestinations(
          inferenceContext,
          partialActionDescriptor.destination,
          this.actions.insertSnippet.getPrePositionStages(
            partialActionDescriptor.snippetDescription,
          ),
        );
        return this.actions.insertSnippet.run(
          destinations,
          partialActionDescriptor.snippetDescription,
        );
      }
      case "wrapWithSnippet": {
        const targets = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target,
          undefined,
          this.actions.wrapWithSnippet.getFinalStages(
            partialActionDescriptor.snippetDescription,
          ),
        );
        return this.actions.wrapWithSnippet.run(
          targets,
          partialActionDescriptor.snippetDescription,
        );
      }
      default: {
        const action = this.actions[partialActionDescriptor.name];
        const targets = this.getTargets(
          inferenceContext,
          partialActionDescriptor.target,
          undefined,
          action.getFinalStages?.(),
        );
        return action.run(targets);
      }
    }
  }

  private getTargets(
    inferenceContext: InferenceContext,
    partialTargetsDescriptor: PartialTargetDescriptor,
    actionPrePositionStages?: ModifierStage[],
    actionFinalStages?: ModifierStage[],
  ) {
    const targetDescriptor = inferenceContext.run(partialTargetsDescriptor);
    return this.pipelineRunner.run(
      targetDescriptor,
      actionPrePositionStages,
      actionFinalStages,
    );
  }

  private getDestinations(
    inferenceContext: InferenceContext,
    partialDestinationDescriptor: PartialDestinationDescriptor,
    actionPrePositionStages?: ModifierStage[],
    actionFinalStages?: ModifierStage[],
  ) {
    if (partialDestinationDescriptor.type === "destination") {
      return this.getDestinationTargetsFromPrimitive(
        inferenceContext,
        partialDestinationDescriptor,
        actionPrePositionStages,
        actionFinalStages,
      );
    } else {
      return partialDestinationDescriptor.destinations.flatMap((destination) =>
        this.getDestinationTargetsFromPrimitive(
          inferenceContext,
          destination,
          actionPrePositionStages,
          actionFinalStages,
        ),
      );
    }
  }

  private getDestinationTargetsFromPrimitive(
    inferenceContext: InferenceContext,
    partialDestinationDescriptor: PartialPrimitiveDestinationDescriptor,
    actionPrePositionStages?: ModifierStage[],
    actionFinalStages?: ModifierStage[],
  ) {
    const destinationTargetDescriptor = inferenceContext.run(
      partialDestinationDescriptor.target,
    );

    return this.pipelineRunner
      .run(
        destinationTargetDescriptor,
        actionPrePositionStages,
        actionFinalStages,
      )
      .map((target) =>
        target.toDestination(partialDestinationDescriptor.insertionMode),
      );
  }

  private debugTargets(targets: Target[]) {
    if (this.debug.active) {
      this.debug.log("Full targets:");
      this.debug.log(JSON.stringify(targets, null, 2));
    }
  }
}

class InferenceContext {
  private previousTargets: PartialTargetDescriptor[] = [];

  run(target: PartialTargetDescriptor) {
    const ret = inferFullTargetDescriptor(target, this.previousTargets);
    this.previousTargets.push(target);
    return ret;
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
