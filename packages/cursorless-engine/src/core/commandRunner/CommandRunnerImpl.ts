import {
  CommandComplete,
  DestinationDescriptor,
  ActionDescriptor,
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
  private inferenceContext: InferenceContext;
  private finalStages: ModifierStage[] = [];

  constructor(
    private debug: Debug,
    private storedTargets: StoredTargetMap,
    private pipelineRunner: TargetPipelineRunner,
    private actions: ActionRecord,
  ) {
    this.inferenceContext = new InferenceContext(this.debug);
  }

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
    actionDescriptor: ActionDescriptor,
  ): Promise<ActionReturnValue> {
    this.inferenceContext.reset();
    this.finalStages = [];

    switch (actionDescriptor.name) {
      case "replaceWithTarget":
        return this.actions.replaceWithTarget.run(
          this.getTargets(actionDescriptor.source),
          this.getDestinations(actionDescriptor.destination),
        );

      case "moveToTarget":
        return this.actions.moveToTarget.run(
          this.getTargets(actionDescriptor.source),
          this.getDestinations(actionDescriptor.destination),
        );

      case "swapTargets":
        return this.actions.swapTargets.run(
          this.getTargets(actionDescriptor.target1),
          this.getTargets(actionDescriptor.target2),
        );

      case "callAsFunction":
        return this.actions.callAsFunction.run(
          this.getTargets(actionDescriptor.callee),
          this.getTargets(actionDescriptor.argument),
        );

      case "wrapWithPairedDelimiter":
        return this.actions.wrapWithPairedDelimiter.run(
          this.getTargets(actionDescriptor.target),
          actionDescriptor.left,
          actionDescriptor.right,
        );

      case "rewrapWithPairedDelimiter":
        this.finalStages =
          this.actions.rewrapWithPairedDelimiter.getFinalStages();
        return this.actions.rewrapWithPairedDelimiter.run(
          this.getTargets(actionDescriptor.target),
          actionDescriptor.left,
          actionDescriptor.right,
        );

      case "pasteFromClipboard":
        return this.actions.pasteFromClipboard.run(
          this.getDestinations(actionDescriptor.destination),
        );

      case "executeCommand":
        return this.actions.executeCommand.run(
          this.getTargets(actionDescriptor.target),
          actionDescriptor.commandId,
          actionDescriptor.options,
        );

      case "replace":
        return this.actions.replace.run(
          this.getDestinations(actionDescriptor.destination),
          actionDescriptor.replaceWith,
        );

      case "highlight":
        return this.actions.highlight.run(
          this.getTargets(actionDescriptor.target),
          actionDescriptor.highlightId,
        );

      case "generateSnippet":
        return this.actions.generateSnippet.run(
          this.getTargets(actionDescriptor.target),
          actionDescriptor.snippetName,
        );

      case "insertSnippet":
        this.finalStages = this.actions.insertSnippet.getFinalStages(
          actionDescriptor.snippetDescription,
        );
        return this.actions.insertSnippet.run(
          this.getDestinations(actionDescriptor.destination),
          actionDescriptor.snippetDescription,
        );

      case "wrapWithSnippet":
        this.finalStages = this.actions.wrapWithSnippet.getFinalStages(
          actionDescriptor.snippetDescription,
        );
        return this.actions.wrapWithSnippet.run(
          this.getTargets(actionDescriptor.target),
          actionDescriptor.snippetDescription,
        );

      case "editNew":
        return this.actions.editNew.run(
          this.getDestinations(actionDescriptor.destination),
        );

      default: {
        const action = this.actions[actionDescriptor.name];
        this.finalStages = action.getFinalStages?.() ?? [];
        return action.run(this.getTargets(actionDescriptor.target));
      }
    }
  }

  private getTargets(
    partialTargetsDescriptor: PartialTargetDescriptor,
  ): Target[] {
    const targetDescriptor = this.inferenceContext.run(
      partialTargetsDescriptor,
    );

    return this.pipelineRunner.run(targetDescriptor, this.finalStages);
  }

  private getDestinations(
    destinationDescriptor: DestinationDescriptor,
  ): Destination[] {
    switch (destinationDescriptor.type) {
      case "list":
        return destinationDescriptor.destinations.flatMap((destination) =>
          this.getDestinations(destination),
        );
      case "primitive":
        return this.getTargets(destinationDescriptor.target).map((target) =>
          target.toDestination(destinationDescriptor.insertionMode),
        );
      case "implicit":
        return this.getTargets({ type: "implicit" }).map((target) =>
          target.toDestination("to"),
        );
    }
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

  reset() {
    this.previousTargets = [];
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
