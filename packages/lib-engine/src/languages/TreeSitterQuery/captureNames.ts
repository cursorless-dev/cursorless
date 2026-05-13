import { pseudoScopes, simpleScopeTypeTypes } from "@cursorless/lib-common";

const scopeCaptureNames = [
  ...simpleScopeTypeTypes.filter((s) => !pseudoScopes.has(s)),
  // Interior is a pseudo scope, but it's implemented with an actual internal scope
  "interior",
] as const;

export type ScopeCaptureName = (typeof scopeCaptureNames)[number];

const wildcard = "_";
const captureNames = [...scopeCaptureNames, wildcard];

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
const normalizedCaptureIndexMap = new Map<string, number>();
const captureNameIndex = Object.fromEntries(captureNames.map((n, i) => [n, i]));

for (const captureName of allowedCaptures) {
  const normalizedCaptureName = normalizeCaptureName(captureName);
  normalizedCaptureNamesMap.set(captureName, normalizedCaptureName);
  const scopeName = getScopeName(captureName);
  const index = captureNameIndex[scopeName];
  if (index == null) {
    throw new Error(`No scope index for capture name ${captureName}`);
  }
  normalizedCaptureIndexMap.set(captureName, index);
}

function normalizeCaptureName(name: string): string {
  return name.replace(/(\.(start|end))?(\.(startOf|endOf))?$/u, "");
}

// eg: for `statement.start.endOf`, returns `statement`
function getScopeName(captureName: string): string {
  return /^(private\.[^.]*|[^.]*)/u.exec(captureName)![0];
}

export function isCaptureAllowed(captureName: string): boolean {
  return allowedCaptures.has(captureName);
}

// Capture names missing normalized name can be things like '@_dummy'
export function getNormalizedCaptureName(captureName: string): string {
  return normalizedCaptureNamesMap.get(captureName) ?? captureName;
}

// Capture names missing normalized index can be things like '@_dummy'
export function getNormalizedCaptureIndex(captureName: string): number {
  return normalizedCaptureIndexMap.get(captureName) ?? -1;
}
