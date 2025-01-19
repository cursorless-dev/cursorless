import type {
  LineNumberMark,
  Modifier,
  PartialMark,
  PartialPrimitiveTargetDescriptor,
  RelativeScopeModifier,
  ScopeType,
} from "@cursorless/common";
import { NoSpokenFormError } from "./NoSpokenFormError";
import { connectives } from "./defaultSpokenForms/connectives";
import {
  hatColorToSpokenForm,
  hatShapeToSpokenForm,
  lineDirections,
  marks,
} from "./defaultSpokenForms/marks";

import { getRangeConnective } from "./getRangeConnective";
import {
  numberToSpokenForm,
  ordinalToSpokenForm,
} from "./defaultSpokenForms/numbers";
import type { SpokenFormComponentMap } from "./getSpokenFormComponentMap";
import type { SpokenFormComponent } from "./SpokenFormComponent";

export class PrimitiveTargetSpokenFormGenerator {
  constructor(private spokenFormMap: SpokenFormComponentMap) {
    this.handleModifier = this.handleModifier.bind(this);
  }

  handlePrimitiveTarget(
    target: PartialPrimitiveTargetDescriptor,
  ): SpokenFormComponent {
    const components: SpokenFormComponent[] = [];
    if (target.modifiers != null) {
      components.push(target.modifiers.map(this.handleModifier));
    }
    if (target.mark != null) {
      components.push(this.handleMark(target.mark));
    }
    return components;
  }

  private handleModifier(modifier: Modifier): SpokenFormComponent {
    switch (modifier.type) {
      case "cascading":
      case "modifyIfUntyped":
      case "preferredScope":
        throw new NoSpokenFormError(`Modifier '${modifier.type}'`);

      case "containingScope":
        if (modifier.ancestorIndex == null || modifier.ancestorIndex === 0) {
          return this.handleScopeType(modifier.scopeType);
        }
        if (modifier.ancestorIndex === 1) {
          return [
            this.spokenFormMap.modifierExtra.ancestor,
            this.handleScopeType(modifier.scopeType),
          ];
        }
        throw new NoSpokenFormError(
          `Modifier '${modifier.type}' with ancestor index ${modifier.ancestorIndex}`,
        );

      case "everyScope":
        return [
          this.spokenFormMap.simpleModifier.everyScope,
          this.handleScopeType(modifier.scopeType),
        ];

      case "extendThroughStartOf":
      case "extendThroughEndOf": {
        const type = this.spokenFormMap.simpleModifier[modifier.type];
        return modifier.modifiers != null
          ? [type, modifier.modifiers.map(this.handleModifier)]
          : [type];
      }

      case "relativeScope":
        return modifier.offset === 0
          ? this.handleRelativeScopeInclusive(modifier)
          : this.handleRelativeScopeExclusive(modifier);

      case "ordinalScope": {
        const scope = this.handleScopeType(modifier.scopeType);
        const isEvery = modifier.isEvery
          ? this.spokenFormMap.simpleModifier.everyScope
          : [];

        if (modifier.length === 1) {
          if (modifier.start === -1) {
            return [isEvery, this.spokenFormMap.modifierExtra.last, scope];
          }
          if (modifier.start === 0) {
            return [isEvery, this.spokenFormMap.modifierExtra.first, scope];
          }
          if (modifier.start < 0) {
            return [
              isEvery,
              ordinalToSpokenForm(Math.abs(modifier.start)),
              this.spokenFormMap.modifierExtra.last,
              scope,
            ];
          }
          return [isEvery, ordinalToSpokenForm(modifier.start + 1), scope];
        }

        const number = numberToSpokenForm(modifier.length);

        if (modifier.start === 0) {
          return [
            isEvery,
            this.spokenFormMap.modifierExtra.first,
            number,
            pluralize(scope),
          ];
        }
        if (modifier.start === -modifier.length) {
          return [
            isEvery,
            this.spokenFormMap.modifierExtra.last,
            number,
            pluralize(scope),
          ];
        }

        throw new NoSpokenFormError(
          `'${modifier.type}' with count > 1 and offset away from start / end`,
        );
      }

      case "range": {
        if (
          modifier.anchor.type === "ordinalScope" &&
          modifier.active.type === "ordinalScope" &&
          modifier.anchor.length === 1 &&
          modifier.active.length === 1 &&
          modifier.anchor.scopeType.type === modifier.active.scopeType.type
        ) {
          const anchor =
            modifier.anchor.start === -1
              ? this.spokenFormMap.modifierExtra.last
              : ordinalToSpokenForm(modifier.anchor.start + 1);
          const active = this.handleModifier(modifier.active);
          const connective = getRangeConnective(
            modifier.excludeAnchor,
            modifier.excludeActive,
          );
          return [anchor, connective, active];
        }

        // Throw actual Error here because we're not sure we ever want to support
        // a spoken form for these; we may deprecate this construct entirely
        throw Error(`Modifier '${modifier.type}' is not fully implemented`);
      }

      default:
        return [this.spokenFormMap.simpleModifier[modifier.type]];
    }
  }

  private handleRelativeScopeInclusive(
    modifier: RelativeScopeModifier,
  ): SpokenFormComponent {
    const scope = this.handleScopeType(modifier.scopeType);
    const isEvery = modifier.isEvery
      ? this.spokenFormMap.simpleModifier.everyScope
      : [];

    if (modifier.length === 1) {
      const direction =
        modifier.direction === "forward"
          ? connectives.forward
          : connectives.backward;

      // token forward/backward
      return [isEvery, scope, direction];
    }

    const length = numberToSpokenForm(modifier.length);
    const scopePlural = pluralize(scope);

    // two tokens
    // This could also have been "two tokens forward"; there is no way to disambiguate.
    if (modifier.direction === "forward") {
      return [isEvery, length, scopePlural];
    }

    // two tokens backward
    return [isEvery, length, scopePlural, connectives.backward];
  }

  private handleRelativeScopeExclusive(
    modifier: RelativeScopeModifier,
  ): SpokenFormComponent {
    const scope = this.handleScopeType(modifier.scopeType);
    const direction =
      modifier.direction === "forward"
        ? connectives.next
        : connectives.previous;
    const isEvery = modifier.isEvery
      ? this.spokenFormMap.simpleModifier.everyScope
      : [];

    if (modifier.offset === 1) {
      const number = numberToSpokenForm(modifier.length);

      if (modifier.length === 1) {
        // next/previous token
        return [isEvery, direction, scope];
      }

      const scopePlural = pluralize(scope);

      // next/previous two tokens
      return [isEvery, direction, number, scopePlural];
    }

    if (modifier.length === 1) {
      const ordinal = ordinalToSpokenForm(modifier.offset);
      // second next/previous token
      return [isEvery, ordinal, direction, scope];
    }

    throw new NoSpokenFormError(
      `${modifier.type} modifier with offset > 1 and length > 1`,
    );
  }

  handleScopeType(scopeType: ScopeType): SpokenFormComponent {
    switch (scopeType.type) {
      case "oneOf":
      case "surroundingPairInterior":
        throw new NoSpokenFormError(`Scope type '${scopeType.type}'`);

      case "glyph":
        return [
          this.spokenFormMap.complexScopeTypeType.glyph,
          getSpokenFormStrict(
            this.spokenFormMap.grapheme,
            "grapheme",
            scopeType.character,
          ),
        ];

      case "surroundingPair":
        return this.spokenFormMap.pairedDelimiter[scopeType.delimiter];

      case "customRegex":
        return (
          this.spokenFormMap.customRegex[scopeType.regex] ?? {
            type: "customizable",
            spokenForms: {
              spokenForms: [],
              isCustom: true,
              defaultSpokenForms: [],
              requiresTalonUpdate: false,
              isPrivate: false,
            },
            spokenFormType: "customRegex",
            id: scopeType.regex,
          }
        );

      default:
        return this.spokenFormMap.simpleScopeTypeType[scopeType.type];
    }
  }

  private handleMark(mark: PartialMark): SpokenFormComponent {
    switch (mark.type) {
      case "decoratedSymbol": {
        const [color, shape] = mark.symbolColor.split("-");
        const components: SpokenFormComponent[] = [];
        if (color !== "default") {
          components.push(hatColorToSpokenForm(color));
        }
        if (shape != null) {
          components.push(hatShapeToSpokenForm(shape));
        }
        components.push(
          getSpokenFormStrict(
            this.spokenFormMap.grapheme,
            "grapheme",
            mark.character,
          ),
        );
        return components;
      }

      case "lineNumber": {
        return this.handleLineNumberMark(mark);
      }

      case "range": {
        if (
          mark.anchor.type === "lineNumber" &&
          mark.active.type === "lineNumber"
        ) {
          const [typeAnchor, numberAnchor] = this.handleLineNumberMark(
            mark.anchor,
          );
          const [typeActive, numberActive] = this.handleLineNumberMark(
            mark.active,
          );
          if (typeAnchor === typeActive) {
            const connective = getRangeConnective(
              mark.excludeAnchor,
              mark.excludeActive,
            );
            // Row five past seven
            return [typeAnchor, numberAnchor, connective, numberActive];
          }
        }
        // Throw actual Error here because we're not sure we ever want to support
        // a spoken form for these; we may deprecate this construct entirely
        throw Error(`Mark '${mark.type}' is not fully implemented`);
      }
      case "explicit":
      case "keyboard":
      case "target":
        throw new NoSpokenFormError(`Mark '${mark.type}'`);

      default:
        return [marks[mark.type]];
    }
  }

  private handleLineNumberMark(mark: LineNumberMark): [string, string] {
    switch (mark.lineNumberType) {
      case "absolute":
        throw new NoSpokenFormError("Absolute line numbers");
      case "modulo100": {
        // row/ five
        return [
          lineDirections.modulo100,
          numberToSpokenForm(mark.lineNumber + 1),
        ];
      }
      case "relative": {
        // up/down five
        return [
          mark.lineNumber < 0
            ? lineDirections.relativeUp
            : lineDirections.relativeDown,
          numberToSpokenForm(Math.abs(mark.lineNumber)),
        ];
      }
    }
  }
}

function pluralize(name: SpokenFormComponent): SpokenFormComponent {
  if (typeof name === "string") {
    return pluralizeString(name);
  }

  if (Array.isArray(name)) {
    if (name.length === 0) {
      return name;
    }

    const last = name[name.length - 1];

    return [...name.slice(0, -1), pluralize(last)];
  }

  return {
    ...name,
    spokenForms: {
      ...name.spokenForms,
      spokenForms: name.spokenForms.spokenForms.map(pluralizeString),
    },
  };
}

// FIXME: Properly pluralize
function pluralizeString(name: string): string {
  return `${name}s`;
}

function getSpokenFormStrict(
  map: Readonly<Record<string, SpokenFormComponent>>,
  typeName: string,
  key: string,
): SpokenFormComponent {
  const spokenForm = map[key];

  if (spokenForm == null) {
    throw new NoSpokenFormError(`${typeName} '${key}'`);
  }

  return spokenForm;
}
