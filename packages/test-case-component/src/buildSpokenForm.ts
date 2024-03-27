import path from "path";
import fs from "fs-extra";
const cursorlessRoot = path.resolve("../../../src");

const commandDictionaryJson = fs.readJSONSync(
  path.join(
    cursorlessRoot,
    "../cursorless-nx/libs/cheatsheet/src/lib/data/sampleSpokenFormInfos/defaults.json",
  ),
) as typeof import("../../../cheatsheet/src/lib/data/sampleSpokenFormInfos/defaults.json");

const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const defaultAlphabet =
  "air bat cap drum each fine gust harp sit jury crunch look made near odd pit quench red sun trap urge vest whale plex yank zip"
    .split(" ")
    .map((word, index) => [letters[index], word] as const);

const defaultDigits = "zero one two three four five six seven eight nine"
  .split(" ")
  .map((word, index) => [`${index}`, word] as const);

const letterDictionary = defaultAlphabet
  .concat(defaultDigits)
  .reduce((r, [key, value]) => ({ ...r, [key]: value }), {});

const commandDictionary = commandDictionaryJson.sections.reduce(
  (topResult, section) => {
    return {
      ...topResult,
      [section.id]: section.items.reduce(
        (r, { id, variations }) => ({
          ...r,
          [id]: variations[0].spokenForm,
        }),
        {},
      ),
    };
  },
  {} as Record<
    (typeof commandDictionaryJson)["sections"][number]["id"],
    Record<
      (typeof commandDictionaryJson)["sections"][number]["items"][number]["id"],
      (typeof commandDictionaryJson)["sections"][number]["items"][number]["variations"][0]["spokenForm"]
    >
  >,
);

type CommandDictionary = typeof commandDictionary;

interface Modifier {
  type: "position" | "containingScope";
  position: keyof CommandDictionary["positions"];
  scopeType: {
    type: keyof CommandDictionary["scopes"];
  };
}
type PrimitiveTarget = {
  type: "primitive";
  modifiers?: Modifier[];
  position?: keyof CommandDictionary["positions"];
  mark?: {
    type: "decoratedSymbol";
    character: keyof typeof letterDictionary;
  };
};

type RangeTarget = {
  type: "range";
  excludeAnchor?: boolean;
  excludeActive?: boolean;
  anchor: Target;
  active: Target;
};

type ListTarget = {
  type: "list";
  elements: Target[];
};

type Target = PrimitiveTarget | RangeTarget | ListTarget;
type Command = { action: { name: string }; targets: Target[] };

function interpolate(
  template: string,
  handleAction: (counter: number) => string,
) {
  let counter = -1;
  return template.replace(/<[a-z0-9]+>/gi, () => handleAction(++counter));
}

class SpokenForm {
  private command: Command;

  constructor(command: Command) {
    this.command = command;
  }

  public build() {
    return interpolate(this.getTemplate(), (counter) =>
      this.parseTarget(this.command.targets[counter]),
    );
  }

  private getTemplate() {
    return commandDictionary["actions"][this.command.action.name];
  }

  private parseTarget(target: Target): string {
    if (!target) {
      throw new Error(`Excess mark`);
    }
    switch (target.type) {
      case "primitive":
        return this.parsePrimitiveTarget(target);
      case "range":
        return this.parseRangeTarget(target);
      case "list":
        return this.parseListTarget(target);
      default: {
        // @ts-expect-error - if this is hit we need to add new cases and types
        throw new Error(`Unknown target type ${target.type}`);
      }
    }
  }
  parsePrimitiveTarget(target: PrimitiveTarget) {
    let prefix =
      target.modifiers
        ?.filter((v): v is Modifier => !!v)
        ?.map((mod) => {
          switch (mod.type) {
            case "position":
              return commandDictionary["positions"][mod.position];
            case "containingScope":
              return commandDictionary["scopes"][mod.scopeType.type];
          }
          throw new Error(`Unknown modifier type ${mod.type}`);
        })
        .join(" ") || "";
    if (target.position) {
      prefix = `${commandDictionary["positions"][target.position]} ${prefix}`;
    }
    if (target.mark) {
      if (target.mark.type !== "decoratedSymbol") {
        throw new Error(`Unknown target type ${target.mark.type}`);
      }
      return (
        (prefix ? prefix + " " : "") + letterDictionary[target.mark.character]
      );
    }
    if (!prefix) {
      throw new Error(`Unknown mark`);
    }
    return prefix;
  }

  parseRangeTarget(target: RangeTarget) {
    let compoundTargetKey;
    if (target.excludeAnchor && target.excludeActive) {
      compoundTargetKey = "rangeExclusive";
    } else if (!target.excludeAnchor && !target.excludeActive) {
      compoundTargetKey = "rangeInclusive";
    } else if (!target.excludeAnchor && target.excludeActive) {
      compoundTargetKey = "rangeExcludingEnd";
    } else {
      throw new Error(`Bad inclusion range`);
    }
    return interpolate(
      commandDictionary["compoundTargets"][compoundTargetKey],
      (index) => {
        if (index === 0) {
          return this.parseTarget(target.anchor);
        }
        if (index === 1) {
          return this.parseTarget(target.active);
        }
        return "";
      },
    );
  }
  parseListTarget(target: ListTarget) {
    return target.elements.reduce((result, element) => {
      if (!result) {
        return this.parseTarget(element);
      }
      return interpolate(
        commandDictionary["compoundTargets"]["listConnective"],
        (index) => {
          if (index === 0) {
            return result;
          }
          if (index === 1) {
            return this.parseTarget(element);
          }
          throw Error(`Invalid List`);
        },
      );
    }, "");
  }
}

export function buildSpokenForm(command: {
  action: { name: string };
  targets: Target[];
}) {
  return new SpokenForm(command).build();
}
