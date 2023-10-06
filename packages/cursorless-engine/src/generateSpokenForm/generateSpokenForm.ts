import {
  ActionDescriptor,
  CommandComplete,
  DestinationDescriptor,
  InsertionMode,
  PartialTargetDescriptor,
  ScopeType,
  camelCaseToAllDown,
} from "@cursorless/common";
import { NoSpokenFormError } from "./NoSpokenFormError";
import { actions } from "./defaultSpokenForms/actions";
import { connectives } from "./defaultSpokenForms/connectives";
import { surroundingPairDelimitersToSpokenForm } from "./defaultSpokenForms/modifiers";
import {
  insertionSnippetToSpokenForm,
  wrapperSnippetToSpokenForm,
} from "./defaultSpokenForms/snippets";
import { getRangeConnective } from "./getRangeConnective";
import { SpokenFormMap } from "../SpokenFormMap";
import { PrimitiveTargetSpokenFormGenerator } from "./primitiveTargetToSpokenForm";
import {
  GeneratorSpokenFormMap,
  SpokenFormComponent,
  getGeneratorSpokenForms,
} from "./GeneratorSpokenFormMap";

export interface SpokenFormSuccess {
  type: "success";
  preferred: string;
  alternatives: string[];
}

export interface SpokenFormError {
  type: "error";
  reason: string;
  requiresTalonUpdate: boolean;
  isSecret: boolean;
}

export type SpokenForm = SpokenFormSuccess | SpokenFormError;

export class SpokenFormGenerator {
  private primitiveGenerator: PrimitiveTargetSpokenFormGenerator;
  private spokenFormMap: GeneratorSpokenFormMap;

  constructor(spokenFormMap: SpokenFormMap) {
    this.spokenFormMap = getGeneratorSpokenForms(spokenFormMap);

    this.primitiveGenerator = new PrimitiveTargetSpokenFormGenerator(
      this.spokenFormMap,
    );
  }

  /**
   * Given a command, generates its spoken form.
   * @param command The command to generate a spoken form for
   * @returns The spoken form of the command, or null if the command has no spoken
   * form
   */
  command(command: CommandComplete): SpokenForm {
    return this.componentsToSpokenForm(() => this.handleAction(command.action));
  }

  /**
   * Given a command, generates its spoken form.
   * @param command The command to generate a spoken form for
   * @returns The spoken form of the command, or null if the command has no spoken
   * form
   */
  scopeType(scopeType: ScopeType): SpokenForm {
    return this.componentsToSpokenForm(() => [
      this.primitiveGenerator.handleScopeType(scopeType),
    ]);
  }

  private componentsToSpokenForm(
    getComponents: () => SpokenFormComponent,
  ): SpokenForm {
    try {
      const components = getComponents();
      const [preferred, ...alternatives] = constructSpokenForms(components);
      return { type: "success", preferred, alternatives };
    } catch (e) {
      if (e instanceof NoSpokenFormError) {
        return {
          type: "error",
          reason: e.reason,
          requiresTalonUpdate: e.requiresTalonUpdate,
          isSecret: e.isSecret,
        };
      }

      throw e;
    }
  }

  private handleAction(action: ActionDescriptor): SpokenFormComponent {
    switch (action.name) {
      case "editNew":
      case "getText":
      case "replace":
      case "executeCommand":
      case "private.getTargets":
        throw new NoSpokenFormError(`Action '${action.name}'`);

      case "replaceWithTarget":
      case "moveToTarget":
        return [
          actions[action.name],
          this.handleTarget(action.source),
          this.handleDestination(action.destination),
        ];

      case "swapTargets":
        return [
          actions[action.name],
          this.handleTarget(action.target1),
          connectives.swapConnective,
          this.handleTarget(action.target2),
        ];

      case "callAsFunction":
        if (action.argument.type === "implicit") {
          return [actions[action.name], this.handleTarget(action.callee)];
        }
        return [
          actions[action.name],
          this.handleTarget(action.callee),
          "on",
          this.handleTarget(action.argument),
        ];

      case "wrapWithPairedDelimiter":
      case "rewrapWithPairedDelimiter":
        return [
          surroundingPairDelimitersToSpokenForm(
            this.spokenFormMap,
            action.left,
            action.right,
          ),
          actions[action.name],
          this.handleTarget(action.target),
        ];

      case "pasteFromClipboard":
        return [
          actions[action.name],
          this.handleDestination(action.destination),
        ];

      case "insertSnippet":
        return [
          actions[action.name],
          insertionSnippetToSpokenForm(action.snippetDescription),
          this.handleDestination(action.destination),
        ];

      case "generateSnippet":
        if (action.snippetName != null) {
          throw new NoSpokenFormError(`${action.name}.snippetName`);
        }
        return [actions[action.name], this.handleTarget(action.target)];

      case "wrapWithSnippet":
        return [
          wrapperSnippetToSpokenForm(action.snippetDescription),
          actions[action.name],
          this.handleTarget(action.target),
        ];

      case "highlight": {
        if (action.highlightId != null) {
          throw new NoSpokenFormError(`${action.name}.highlightId`);
        }
        return [actions[action.name], this.handleTarget(action.target)];
      }

      default: {
        return [actions[action.name], this.handleTarget(action.target)];
      }
    }
  }

  private handleTarget(target: PartialTargetDescriptor): SpokenFormComponent {
    switch (target.type) {
      case "list":
        if (target.elements.length < 2) {
          throw new NoSpokenFormError("List target with < 2 elements");
        }

        return target.elements.map((element, i) =>
          i === 0
            ? this.handleTarget(element)
            : [connectives.listConnective, this.handleTarget(element)],
        );

      case "range": {
        const anchor = this.handleTarget(target.anchor);
        const active = this.handleTarget(target.active);
        const connective = getRangeConnective(
          target.excludeAnchor,
          target.excludeActive,
          target.rangeType,
        );
        return [anchor, connective, active];
      }

      case "primitive":
        return this.primitiveGenerator.handlePrimitiveTarget(target);

      case "implicit":
        return [];
    }
  }

  private handleDestination(
    destination: DestinationDescriptor,
  ): SpokenFormComponent {
    switch (destination.type) {
      case "list":
        if (destination.destinations.length < 2) {
          throw new NoSpokenFormError("List destination with < 2 elements");
        }

        return destination.destinations.map((destination, i) =>
          i === 0
            ? this.handleDestination(destination)
            : [connectives.listConnective, this.handleDestination(destination)],
        );

      case "primitive":
        return [
          this.handleInsertionMode(destination.insertionMode),
          this.handleTarget(destination.target),
        ];

      case "implicit":
        return [];
    }
  }

  private handleInsertionMode(insertionMode: InsertionMode): string {
    switch (insertionMode) {
      case "to":
        return connectives.sourceDestinationConnective;
      case "before":
        return connectives.before;
      case "after":
        return connectives.after;
    }
  }
}

function constructSpokenForms(component: SpokenFormComponent): string[] {
  if (typeof component === "string") {
    return [component];
  }

  if (Array.isArray(component)) {
    if (component.length === 0) {
      return [""];
    }

    return cartesianProduct(component.map(constructSpokenForms)).map((words) =>
      words.filter((word) => word.length !== 0).join(" "),
    );
  }

  if (component.spokenForms.spokenForms.length === 0) {
    throw new NoSpokenFormError(
      `${camelCaseToAllDown(component.spokenFormType)} with id ${
        component.id
      }; please see https://www.cursorless.org/docs/user/customization/ for more information`,
      component.spokenForms.requiresTalonUpdate,
      component.spokenForms.isSecret,
    );
  }

  return component.spokenForms.spokenForms;
}

/**
 * Given an array of arrays, constructs all possible combinations of the
 * elements of the arrays. For example, given [[1, 2], [3, 4]], returns [[1, 3],
 * [1, 4], [2, 3], [2, 4]]. If any of the arrays are empty, returns an empty
 * array.
 * @param arrays The arrays to take the cartesian product of
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) {
    return [];
  }

  if (arrays.length === 1) {
    return arrays[0].map((element) => [element]);
  }

  const [first, ...rest] = arrays;
  const restCartesianProduct = cartesianProduct(rest);
  return first.flatMap((element) =>
    restCartesianProduct.map((restElement) => [element, ...restElement]),
  );
}
