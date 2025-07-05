import {
  getScopeTestPaths,
  type ScopeTestPath,
  getPackagePath,
} from "@cursorless/node-common";
import * as fs from "node:fs";
import * as path from "node:path";

interface Scope {
  content?: string;
  removal?: string;
  domain?: string;
  insertionDelimiter?: string;
}

interface Fixture {
  name: string;
  facet: string;
  languageId: string;
  code: string;
  scopes: Scope[];
}

const fixtures: Fixture[] = [];

for (const test of getScopeTestPaths()) {
  //   if (test.languageId !== "xml" || test.facet !== "tags") {
  //     continue;
  //   }
  const fixture = parseTest(test);
  if (fixture != null) {
    fixtures.push(fixture);
  }
}

saveFixtures(fixtures);

function parseTest(test: ScopeTestPath) {
  const fixture = fs
    .readFileSync(test.path, "utf8")
    .toString()
    .replaceAll("\r\n", "\n");

  const delimiterIndex = fixture.match(/^---$/m)?.index;

  if (delimiterIndex === undefined) {
    throw Error(`Can't find delimiter '---' in scope fixture ${test.path}`);
  }

  const code = fixture.slice(0, delimiterIndex - 1);
  const lines = fixture.substring(delimiterIndex + 4).split(/\n/);
  const scopes: Scope[] = [];
  const unprocessedTypes: string[] = [];
  const unprocessedTargets: Scope[] = [];
  let currentScopeIndex = "";
  let currentScope: Scope = {};

  function processLine(type: string, value: string) {
    switch (type) {
      case "Content":
      case "Range":
        currentScope.content = value;
        break;
      case "Removal":
        currentScope.removal = value;
        break;
      case "Domain":
        currentScope.domain = value;
        break;
      case "Insertion delimiter":
        currentScope.insertionDelimiter = value.substring(1, value.length - 1);
        break;
      case "Leading delimiter":
      case "Leading delimiter: Content":
      case "Leading delimiter: Removal":
      case "Trailing delimiter":
      case "Trailing delimiter: Content":
      case "Trailing delimiter: Removal":
      case "Interior":
      case "Interior: Content":
      case "Interior: Removal":
      case "Boundary L":
      case "Boundary L: Content":
      case "Boundary L: Removal":
      case "Boundary R":
      case "Boundary R: Content":
      case "Boundary R: Removal":
        // Do nothing
        break;
      default:
        throw Error(`Unknown type '${type}' in scope fixture ${test.path}`);
    }
  }

  for (const line of lines) {
    const parsedLine = parseLine(line);

    if (parsedLine == null) {
      continue;
    }

    const { scopeIndex, targetIndex, type, value } = parsedLine;

    if (targetIndex != null) {
      // TODO: handle target index fixtures
      return;
    }

    // console.log(scopeIndex, targetIndex, type, value);

    if (scopeIndex != null && scopeIndex !== currentScopeIndex) {
      if (currentScopeIndex !== "") {
        scopes.push(currentScope);
      }
      currentScopeIndex = scopeIndex;
      currentScope = {};
    }

    if (value == null) {
      unprocessedTypes.push(type);
      continue;
    }

    if (unprocessedTypes.length > 0) {
      for (const unprocessedType of unprocessedTypes) {
        processLine(unprocessedType, value);
      }
      unprocessedTypes.length = 0;
    }

    processLine(type, value);
  }

  if (currentScope != null) {
    scopes.push(currentScope);
  }

  const result: Fixture = {
    name: test.name,
    languageId: test.languageId,
    facet: test.facet,
    code,
    scopes,
  };

  return result;
}

function parseLine(line: string) {
  if (line[0] !== "[") {
    return null;
  }

  const header = line.substring(1, line.indexOf("]"));
  const { scopeIndex, targetIndex, type } = (() => {
    if (header[0] === "#") {
      const spaceIndex = header.indexOf(" ");
      const fullIndex = header.substring(1, spaceIndex);
      const [scopeIndex, targetIndex] = fullIndex.split(".");
      return {
        scopeIndex: scopeIndex,
        targetIndex: targetIndex,
        type: header.substring(spaceIndex + 1),
      };
    }
    return {
      scopeIndex: undefined,
      targetIndex: undefined,
      type: header,
    };
  })();

  const rawValue = line.substring(line.indexOf("=") + 1).trim();
  const value = rawValue.length > 0 ? rawValue : undefined;

  return { scopeIndex, targetIndex, type, value };
}

function saveFixtures(fixtures: Fixture[]) {
  const assetPath = path.join(
    getPackagePath("cursorless-org-docs"),
    "static",
    "scopeTests.json",
  );
  fs.writeFileSync(assetPath, JSON.stringify(fixtures, null, 2), "utf8");
}
