const DEFAULT_HAT_CLASS = "hat default";
export const classesMap = {
    default: DEFAULT_HAT_CLASS,
    pendingDelete: "decoration pendingDelete",
    referenced: "decoration referenced",
    selection: "selection",
    pendingModification0: "decoration pendingModification0",
    pendingModification1: "decoration pendingModification1",
    justAdded: "decoration justAdded",
    highlight0: "decoration highlight0",
    highlight1: "decoration highlight1",
    sourceMark: "sourceMark",
    thatMark: "thatMark"
};

export function getDecorationClass(key: keyof typeof classesMap): string {
    return classesMap[key];
}

