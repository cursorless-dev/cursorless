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
import { SpokenFormMap } from "../spokenForms/SpokenFormMap";
import { PrimitiveTargetSpokenFormGenerator } from "./primitiveTargetToSpokenForm";
import {
  SpokenFormComponentMap,
  getSpokenFormComponentMap,
} from "./getSpokenFormComponentMap";
import { SpokenFormComponent } from "./SpokenFormComponent";
import { SpokenForm } from "@cursorless/common";

export class SpokenFormGenerator {
  private primitiveGenerator: PrimitiveTargetSpokenFormGenerator;
  private spokenFormMap: SpokenFormComponentMap;

  constructor(spokenFormMap: SpokenFormMap) {
    this.spokenFormMap = getSpokenFormComponentMap(spokenFormMap);

    this.primitiveGenerator = new PrimitiveTargetSpokenFormGenerator(
      this.spokenFormMap,
    );
  }

  /**
   * Given a command, generates its spoken form.
   * @param command The command to generate a spoken form for
   * @returns The spoken form of the command
   */
  processCommand(command: CommandComplete): SpokenForm {
    return this.componentsToSpokenForm(() => this.handleAction(command.action));
  }

  /**
   * Given a scope type, generates its spoken form.
   * @param scopeType The scope type to generate a spoken form for
   * @returns The spoken form of the scope type
   */
  processScopeType(scopeType: ScopeType): SpokenForm {
    return this.componentsToSpokenForm(() => [
      this.primitiveGenerator.handleScopeType(scopeType),
    ]);
  }

  /**
   * Given a function that returns a spoken form component, generates a spoken
   * form for that component by flattening the component and performing a
   * cartesian product over any elements that have multiple ways to be spoken.
   * Note that this spoken form object can correspond to multiple actual spoken
   * forms, consisting of a preferred spoken form and a list of alternative
   * spoken forms.
   *
   * Note that today, we arbitrarily choose the first spoken form as the
   * preferred spoken form, and the rest as alternative spoken forms.
   *
   * If the function throws a {@link NoSpokenFormError}, returns an error spoken
   * form object instead.
   *
   * @param getComponents A function that returns the components to generate a
   * spoken form for
   * @returns A spoken form for the given components
   */
  private componentsToSpokenForm(
    getComponents: () => SpokenFormComponent,
  ): SpokenForm {
    try {
      return {
        type: "success",
        spokenForms: constructSpokenForms(getComponents()),
      };
    } catch (e) {
      if (e instanceof NoSpokenFormError) {
        return {
          type: "error",
          reason: e.reason,
          requiresTalonUpdate: e.requiresTalonUpdate,
          isPrivate: e.isPrivate,
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
      case "private.setKeyboardTarget":
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
    const componentInfo = `${camelCaseToAllDown(
      component.spokenFormType,
    )} with id ${component.id}`;

    let helpInfo: string;

    if (component.spokenForms.isPrivate) {
      helpInfo =
        "this is a private spoken form currently only for internal experimentation";
    } else if (component.spokenForms.requiresTalonUpdate) {
      helpInfo =
        "please update talon to the latest version (see https://www.cursorless.org/docs/user/updating/)";
    } else {
      helpInfo =
        "please see https://www.cursorless.org/docs/user/customization/ for more information";
    }

    throw new NoSpokenFormError(
      `${componentInfo}; ${helpInfo}`,
      component.spokenForms.requiresTalonUpdate,
      component.spokenForms.isPrivate,
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
