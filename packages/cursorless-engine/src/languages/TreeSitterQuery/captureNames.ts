import { pseudoScopes, simpleScopeTypeTypes } from "@cursorless/common";

const wildcard = "_";
const captureNames = [
  ...simpleScopeTypeTypes.filter((s) => !pseudoScopes.has(s)),
  wildcard,
  "interior",
];

const positionRelationships = ["prefix", "leading", "trailing"];
const positionSuffixes = [
  "startOf",
  "endOf",
  "start.startOf",
  "start.endOf",
  "end.startOf",
  "end.endOf",
];

const rangeRelationships = [
  "domain",
  "removal",
  "iteration",
  "iteration.domain",
];
const rangeSuffixes = [
  "start",
  "end",
  "start.startOf",
  "start.endOf",
  "end.startOf",
  "end.endOf",
];

const allowedCaptures = new Set<string>();

for (const captureName of captureNames) {
  // Wildcard is not allowed by itself without a relationship
  if (captureName !== wildcard) {
    // eg: statement
    allowedCaptures.add(captureName);

    // eg: statement.start | statement.start.endOf
    for (const suffix of rangeSuffixes) {
      allowedCaptures.add(`${captureName}.${suffix}`);
    }
  }

  for (const relationship of positionRelationships) {
    // eg: statement.leading
    allowedCaptures.add(`${captureName}.${relationship}`);

    for (const suffix of positionSuffixes) {
      // eg: statement.leading.endOf
      allowedCaptures.add(`${captureName}.${relationship}.${suffix}`);
    }
  }

  for (const relationship of rangeRelationships) {
    // eg: statement.domain
    allowedCaptures.add(`${captureName}.${relationship}`);

    for (const suffix of rangeSuffixes) {
      // eg: statement.domain.start | statement.domain.start.endOf
      allowedCaptures.add(`${captureName}.${relationship}.${suffix}`);
    }
  }
}

const normalizedCaptureNamesMap = new Map<string, string>();

for (const captureName of allowedCaptures) {
  normalizedCaptureNamesMap.set(captureName, normalizeCaptureName(captureName));
}

function normalizeCaptureName(name: string): string {
  return name.replace(/(\.(start|end))?(\.(startOf|endOf))?$/, "");
}

export function isCaptureAllowed(captureName: string): boolean {
  return allowedCaptures.has(captureName);
}

export function getNormalizedCaptureName(captureName: string): string {
  return normalizedCaptureNamesMap.get(captureName) ?? captureName;
}
