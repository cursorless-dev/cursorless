import {
  PartialTargetDescriptor} from "@cursorless/common";
import { RecursiveArray } from "lodash";
import { NoSpokenFormError } from "./NoSpokenFormError";
import { connectives } from "./defaultSpokenForms/connectives";
import { primitiveTargetToSpokenForm } from "./primitiveTargetToSpokenForm";
import { getRangeConnective } from "./getRangeConnective";


export function targetToSpokenForm(
  target: PartialTargetDescriptor): RecursiveArray<string> {
  switch (target.type) {
    case "list":
      if (target.elements.length < 2) {
        throw new NoSpokenFormError("List target with < 2 elements");
      }

      return target.elements.map((element, i) => i === 0
        ? targetToSpokenForm(element)
        : [connectives.listConnective, targetToSpokenForm(element)]
      );

    case "range": {
      const anchor = targetToSpokenForm(target.anchor);
      const active = targetToSpokenForm(target.active);
      const connective = getRangeConnective(
        target.excludeAnchor,
        target.excludeActive,
        target.rangeType
      );
      return [anchor, connective, active];
    }

    case "primitive":
      return primitiveTargetToSpokenForm(target);

    case "implicit":
      return [];
  }
}


