import type {
  LineNumberMark,
  Modifier,
  PartialMark,
  PartialPrimitiveTargetDescriptor,
  RelativeScopeModifier,
  ScopeType,
} from "@cursorless/lib-common";
import {
  numberToSpokenForm,
  ordinalToSpokenForm,
} from "./defaultSpokenForms/numbers";
import { getRangeConnective } from "./getRangeConnective";
import type { SpokenFormComponentMap } from "./getSpokenFormComponentMap";
import { NoSpokenFormError } from "./NoSpokenFormError";
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
      case "fallback":
      case "modifyIfUntyped":
      case "preferredScope":
        throw new NoSpokenFormError(`Modifier '${modifier.type}'`);

      case "containingScope":
        if (modifier.ancestorIndex == null || modifier.ancestorIndex === 0) {
          return this.handleScopeType(modifier.scopeType);
        }
        return [
          Array.from(
            { length: modifier.ancestorIndex },
            () => this.spokenFormMap.modifierExtra.ancestor,
          ),
          this.handleScopeType(modifier.scopeType),
        ];

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
            this.spokenFormMap,
            modifier.excludeAnchor,
            modifier.excludeActive,
          );
          return [anchor, connective, active];
        }

        // Throw actual Error here because we're not sure we ever want to support
        // a spoken form for these; we may deprecate this construct entirely
        throw new Error(`Modifier '${modifier.type}' is not fully implemented`);
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
          ? this.spokenFormMap.modifierExtra.forward
          : this.spokenFormMap.modifierExtra.backward;

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
    return [
      isEvery,
      length,
      scopePlural,
      this.spokenFormMap.modifierExtra.backward,
    ];
  }

  private handleRelativeScopeExclusive(
    modifier: RelativeScopeModifier,
  ): SpokenFormComponent {
    const scope = this.handleScopeType(modifier.scopeType);
    const direction =
      modifier.direction === "forward"
        ? this.spokenFormMap.modifierExtra.next
        : this.spokenFormMap.modifierExtra.previous;
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
      case "surroundingPair": {
        return this.spokenFormMap.pairedDelimiter[scopeType.delimiter];
      }

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

      case "interior":
        return this.spokenFormMap.simpleModifier.interiorOnly;

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
          const result = this.spokenFormMap.hatColor[color];
          if (result == null) {
            throw new Error(`Unknown hat color '${color}'`);
          }
          components.push(result);
        }
        if (shape != null) {
          const result = this.spokenFormMap.hatShape[shape];
          if (result == null) {
            throw new Error(`Unknown hat shape '${shape}'`);
          }
          components.push(result);
        }
        if (mark.character === "\uFFFD") {
          components.push(this.spokenFormMap.specialMark.unknownSymbol);
        } else {
          components.push(
            getSpokenFormStrict(
              this.spokenFormMap.grapheme,
              "grapheme",
              mark.character,
            ),
          );
        }
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
              this.spokenFormMap,
              mark.excludeAnchor,
              mark.excludeActive,
            );
            // Row five past seven
            return [typeAnchor, numberAnchor, connective, numberActive];
          }
        }
        // Throw actual Error here because we're not sure we ever want to support
        // a spoken form for these; we may deprecate this construct entirely
        throw new Error(`Mark '${mark.type}' is not fully implemented`);
      }

      case "cursor":
        return this.spokenFormMap.specialMark.currentSelection;
      case "that":
        return this.spokenFormMap.specialMark.previousTarget;
      case "source":
        return this.spokenFormMap.specialMark.previousSource;
      case "nothing":
        return this.spokenFormMap.specialMark.nothing;

      case "explicit":
      case "keyboard":
      case "target":
        throw new NoSpokenFormError(`Mark '${mark.type}'`);

      // No default
    }
  }

  private handleLineNumberMark(
    mark: LineNumberMark,
  ): [SpokenFormComponent, string] {
    switch (mark.lineNumberType) {
      case "absolute":
        throw new NoSpokenFormError("Absolute line numbers");
      case "modulo100": {
        // row/ five
        return [
          this.spokenFormMap.specialMark.lineNumberModulo100,
          numberToSpokenForm(mark.lineNumber + 1),
        ];
      }
      case "relative": {
        // up/down five
        return [
          mark.lineNumber < 0
            ? this.spokenFormMap.specialMark.lineNumberRelativeUp
            : this.spokenFormMap.specialMark.lineNumberRelativeDown,
          numberToSpokenForm(Math.abs(mark.lineNumber)),
        ];
      }
      // No default
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
