import {
  CommandComplete,
  DestinationDescriptor,
  InsertionMode,
  PartialActionDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";
import { CommandRunner } from "../../CommandRunner";
import { ActionRecord, ActionReturnValue } from "../../actions/actions.types";
import { StoredTargetMap } from "../../index";
import { TargetPipelineRunner } from "../../processTargets";
import { ModifierStage } from "../../processTargets/PipelineStages.types";
import { SelectionWithEditor } from "../../typings/Types";
import { Destination, Target } from "../../typings/target.types";
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
    const inferenceContext = new InferenceContext(this.debug);

    switch (partialActionDescriptor.name) {
      case "replaceWithTarget":
        return this.actions.replaceWithTarget.run(
          this.getTargets(inferenceContext, partialActionDescriptor.source),
          this.getDestinations(
            inferenceContext,
            partialActionDescriptor.destination,
          ),
        );
      case "moveToTarget":
        return this.actions.moveToTarget.run(
          this.getTargets(inferenceContext, partialActionDescriptor.source),
          this.getDestinations(
            inferenceContext,
            partialActionDescriptor.destination,
          ),
        );
      case "swapTargets":
        return this.actions.swapTargets.run(
          this.getTargets(inferenceContext, partialActionDescriptor.target1),
          this.getTargets(inferenceContext, partialActionDescriptor.target2),
        );
      case "callAsFunction":
        return this.actions.callAsFunction.run(
          this.getTargets(inferenceContext, partialActionDescriptor.callee),
          this.getTargets(inferenceContext, partialActionDescriptor.argument),
        );
      case "wrapWithPairedDelimiter":
        return this.actions.wrapWithPairedDelimiter.run(
          this.getTargets(inferenceContext, partialActionDescriptor.target),
          partialActionDescriptor.left,
          partialActionDescriptor.right,
        );
      case "rewrapWithPairedDelimiter":
        return this.actions.rewrapWithPairedDelimiter.run(
          this.getTargets(
            inferenceContext,
            partialActionDescriptor.target,
            this.actions.rewrapWithPairedDelimiter.getFinalStages(),
          ),
          partialActionDescriptor.left,
          partialActionDescriptor.right,
        );
      case "pasteFromClipboard":
        return this.actions.pasteFromClipboard.run(
          this.getDestinations(
            inferenceContext,
            partialActionDescriptor.destination,
          ),
        );
      case "executeCommand":
        return this.actions.executeCommand.run(
          this.getTargets(inferenceContext, partialActionDescriptor.target),
          partialActionDescriptor.commandId,
          partialActionDescriptor.options,
        );
      case "replace":
        return this.actions.replace.run(
          this.getDestinations(
            inferenceContext,
            partialActionDescriptor.destination,
          ),
          partialActionDescriptor.replaceWith,
        );
      case "highlight":
        return this.actions.highlight.run(
          this.getTargets(inferenceContext, partialActionDescriptor.target),
          partialActionDescriptor.highlightId,
        );
      case "generateSnippet":
        return this.actions.generateSnippet.run(
          this.getTargets(inferenceContext, partialActionDescriptor.target),
          partialActionDescriptor.snippetName,
        );
      case "insertSnippet":
        return this.actions.insertSnippet.run(
          this.getDestinations(
            inferenceContext,
            partialActionDescriptor.destination,
            this.actions.insertSnippet.getFinalStages(
              partialActionDescriptor.snippetDescription,
            ),
          ),
          partialActionDescriptor.snippetDescription,
        );
      case "wrapWithSnippet":
        return this.actions.wrapWithSnippet.run(
          this.getTargets(
            inferenceContext,
            partialActionDescriptor.target,
            this.actions.wrapWithSnippet.getFinalStages(
              partialActionDescriptor.snippetDescription,
            ),
          ),
          partialActionDescriptor.snippetDescription,
        );
      default: {
        const action = this.actions[partialActionDescriptor.name];

        return action.run(
          this.getTargets(
            inferenceContext,
            partialActionDescriptor.target,
            action.getFinalStages?.(),
          ),
        );
      }
    }
  }

  private getTargets(
    inferenceContext: InferenceContext,
    partialTargetsDescriptor: PartialTargetDescriptor,
    actionFinalStages?: ModifierStage[],
  ): Target[] {
    const targetDescriptor = inferenceContext.run(partialTargetsDescriptor);
    return this.pipelineRunner.run(targetDescriptor, actionFinalStages);
  }

  private getDestinations(
    inferenceContext: InferenceContext,
    destinationDescriptor: DestinationDescriptor,
    actionFinalStages: ModifierStage[] = [],
  ): Destination[] {
    switch (destinationDescriptor.type) {
      case "list":
        return destinationDescriptor.destinations.flatMap((destination) =>
          this.getDestinations(
            inferenceContext,
            destination,
            actionFinalStages,
          ),
        );
      case "primitive":
        return this.getDestinationsFromTarget(
          inferenceContext,
          destinationDescriptor.target,
          destinationDescriptor.insertionMode,
          actionFinalStages,
        );
      case "implicit":
        return this.getDestinationsFromTarget(
          inferenceContext,
          destinationDescriptor,
          "to",
          actionFinalStages,
        );
    }
  }

  private getDestinationsFromTarget(
    inferenceContext: InferenceContext,
    partialTargetDescriptor: PartialTargetDescriptor,
    insertionMode: InsertionMode,
    actionFinalStages: ModifierStage[],
  ) {
    const targetDescriptor = inferenceContext.run(partialTargetDescriptor);
    return this.pipelineRunner
      .run(targetDescriptor, actionFinalStages)
      .map((target) => target.toDestination(insertionMode));
  }
}

class InferenceContext {
  private previousTargets: PartialTargetDescriptor[] = [];

  constructor(private debug: Debug) {}

  run(target: PartialTargetDescriptor) {
    const ret = inferFullTargetDescriptor(target, this.previousTargets);

    if (this.debug.active) {
      this.debug.log("Full target:");
      this.debug.log(JSON.stringify(ret, null, 2));
    }

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
