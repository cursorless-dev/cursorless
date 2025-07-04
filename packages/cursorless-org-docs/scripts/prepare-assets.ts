import { getScopeTestPaths, type ScopeTestPath } from "@cursorless/node-common";
import * as fs from "node:fs";

interface Scope {
  content?: string;
  removal?: string;
  domain?: string;
  insertionDelimiter?: string;
}

interface Fixture {
  facet: string;
  languageId: string;
  code: string;
  scopes: Scope[];
}

for (const test of getScopeTestPaths()) {
  parseTest(test);
}

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
      case "Trailing delimiter":
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
    languageId: test.languageId,
    facet: test.facet,
    code,
    scopes,
  };

  console.log(result);
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
      scopeIndex: null,
      targetIndex: null,
      type: header,
    };
  })();

  const value = line.substring(line.indexOf("=") + 1).trim();

  return { scopeIndex, targetIndex, type, value };
}
