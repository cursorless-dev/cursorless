/* eslint-disable @typescript-eslint/naming-convention */

import {
  ScopeSupportFacet,
  ScopeSupportFacetInfo,
} from "./scopeSupportFacets.types";

export const scopeSupportFacetInfos: Record<
  ScopeSupportFacet,
  ScopeSupportFacetInfo
> = {
  command: {
    description: "A command, for example Talon spoken command or bash",
    scopeType: "command",
  },

  element: {
    description: "An xml/html element. Also used for LaTeX environments",
    scopeType: "xmlElement",
  },
  startTag: {
    description: "The start tag of an xml element",
    scopeType: "xmlStartTag",
  },
  endTag: {
    description: "The end tag of an xml element",
    scopeType: "xmlEndTag",
  },
  tags: {
    description: "Both tags in an xml element",
    scopeType: "xmlBothTags",
  },
  attribute: {
    description: "A attribute, eg of an html element or a C++ attribute",
    scopeType: "attribute",
  },

  list: {
    description: "A list/array",
    scopeType: "list",
  },
  map: {
    description: "A map/dictionary",
    scopeType: "map",
  },
  ifStatement: {
    description: "An if statement",
    scopeType: "ifStatement",
  },
  regularExpression: {
    description: "A regular expression",
    scopeType: "regularExpression",
  },
  switchStatementSubject: {
    description: "The subject of a switch statement",
    scopeType: "private.switchStatementSubject",
  },
  fieldAccess: {
    description: "A field access",
    scopeType: "private.fieldAccess",
  },

  statement: {
    description: "A statement, eg assignment, for loop, etc",
    scopeType: "statement",
  },
  "statement.iteration.document": {
    description: "Iteration scope for statements. The entire document.",
    scopeType: "statement",
    isIteration: true,
  },
  "statement.iteration.block": {
    description:
      "Iteration scope for statements. Statement blocks(body of functions/if statements/for loops/etc).",
    scopeType: "statement",
    isIteration: true,
  },

  class: {
    description: "A class in an object-oriented language",
    scopeType: "class",
  },
  className: {
    description: "The name of a class",
    scopeType: "className",
  },

  namedFunction: {
    description: "A named function declaration",
    scopeType: "namedFunction",
  },
  "namedFunction.method": {
    description: "A named method declaration in a class",
    scopeType: "namedFunction",
  },
  anonymousFunction: {
    description:
      "An anonymous function, eg a lambda function, an arrow function, etc",
    scopeType: "anonymousFunction",
  },
  functionName: {
    description: "The name of a function",
    scopeType: "functionName",
  },

  functionCall: {
    description: "A function call",
    scopeType: "functionCall",
  },
  "functionCall.constructor": {
    description: "A constructor call",
    scopeType: "functionCall",
  },
  functionCallee: {
    description: "The function being called in a function call",
    scopeType: "functionCallee",
  },
  "functionCallee.constructor": {
    description:
      "The class being constructed in a class instantiation, including the `new` keyword",
    scopeType: "functionCallee",
  },

  "argument.actual": {
    description: "An argument/parameter in a function call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.iteration": {
    description:
      "Iteration scope of arguments in a function call, should be inside the parens of the argument list",
    scopeType: "argumentOrParameter",
    isIteration: true,
  },
  "argument.formal": {
    description: "A parameter in a function declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.iteration": {
    description:
      "Iteration scope of the formal parameters of a function declaration; should be the whole parameter list",
    scopeType: "argumentOrParameter",
    isIteration: true,
  },

  "comment.line": {
    description: "A line comment",
    scopeType: "comment",
  },
  "comment.block": {
    description: "A block comment",
    scopeType: "comment",
  },

  "string.singleLine": {
    description: "A single-line string",
    scopeType: "string",
  },
  "string.multiLine": {
    description: "A multi-line string",
    scopeType: "string",
  },

  "branch.if": {
    description: "An if/elif/else branch",
    scopeType: "branch",
  },

  "branch.if.iteration": {
    description:
      "Iteration scope for if/elif/else branch; should be the entire if-else statement",
    scopeType: "branch",
    isIteration: true,
  },
  "branch.try": {
    description: "A try/catch/finally branch",
    scopeType: "branch",
  },
  "branch.switchCase": {
    description: "A case/default branch in a switch/match statement",
    scopeType: "branch",
  },
  "branch.switchCase.iteration": {
    description:
      "Iteration scope for branches in a switch/match statement; should contain all the cases",
    scopeType: "branch",
    isIteration: true,
  },
  "branch.ternary": {
    description: "A branch in a ternary expression",
    scopeType: "branch",
  },

  "condition.if": {
    description: "A condition in an if statement",
    scopeType: "condition",
  },
  "condition.while": {
    description: "A condition in a while loop",
    scopeType: "condition",
  },
  "condition.doWhile": {
    description: "A condition in a do while loop",
    scopeType: "condition",
  },
  "condition.for": {
    description: "A condition in a for loop",
    scopeType: "condition",
  },
  "condition.ternary": {
    description: "A condition in a ternary expression",
    scopeType: "condition",
  },
  "condition.switchCase": {
    description: "A condition in a switch statement",
    scopeType: "condition",
  },

  "name.assignment": {
    description: "Name (LHS) of an assignment",
    scopeType: "name",
  },
  "name.assignment.pattern": {
    description: "LHS of an assignment with pattern destructuring",
    scopeType: "name",
  },
  "name.variable": {
    description: "Name (LHS) of a variable declaration",
    scopeType: "name",
  },
  "name.variable.pattern": {
    description:
      "Name (LHS) of a variable declaration with pattern destructuring",
    scopeType: "name",
  },
  "name.foreach": {
    description: "Iteration variable name in a for each loop",
    scopeType: "name",
  },
  "name.function": {
    description: "Name of a function",
    scopeType: "name",
  },
  "name.class": {
    description: "Name of a class",
    scopeType: "name",
  },
  "name.field": {
    description: "Name (LHS) of a field in a class / interface",
    scopeType: "name",
  },
  "name.resource": {
    description: "Name in a 'with' / 'use' / 'using' statement",
    scopeType: "name",
  },
  "name.resource.iteration": {
    description:
      "Iteration scope for names in a 'with' / 'use' / 'using' statement",
    scopeType: "name",
    isIteration: true,
  },

  "key.attribute": {
    description: "Key (LHS) of an attribute eg in an xml element",
    scopeType: "collectionKey",
  },
  "key.mapPair": {
    description: "Key (LHS) of a key-value pair of a map",
    scopeType: "collectionKey",
  },
  "key.mapPair.iteration": {
    description:
      "Iteration scope of key-value pairs in a map; should be between the braces",
    scopeType: "collectionKey",
    isIteration: true,
  },

  "value.assignment": {
    description: "Value (RHS) of an assignment",
    scopeType: "value",
  },
  "value.variable": {
    description: "Value (RHS) of a variable declaration",
    scopeType: "value",
  },
  "value.mapPair": {
    description: "Value (RHS) of a key-value pair in a map",
    scopeType: "value",
  },
  "value.mapPair.iteration": {
    description:
      "Iteration scope of key-value pairs in a map; should be between the braces",
    scopeType: "value",
    isIteration: true,
  },
  "value.foreach": {
    description: "Iterable in a for each loop",
    scopeType: "value",
  },
  "value.attribute": {
    description: "Value (RHS) of an attribute eg in an xml element",
    scopeType: "value",
  },
  "value.return": {
    description: "Return value of a function",
    scopeType: "value",
  },
  "value.return.lambda": {
    description: "Implicit return value from a lambda",
    scopeType: "value",
  },
  "value.field": {
    description: "Value (RHS) of a field in a class / interface",
    scopeType: "value",
  },
  "value.resource": {
    description: "Value of a 'with' / 'use' / 'using' statement",
    scopeType: "value",
  },
  "value.resource.iteration": {
    description:
      "Iteration scope for values in a 'with' / 'use' / 'using' statement",
    scopeType: "value",
    isIteration: true,
  },

  "type.assignment": {
    description: "Type of variable in an assignment",
    scopeType: "type",
  },
  "type.formalParameter": {
    description: "Type of formal parameter in a function declaration",
    scopeType: "type",
  },
  "type.return": {
    description: "Type of return value in a function declaration",
    scopeType: "type",
  },
  "type.field": {
    description: "Type of field in a class / interface",
    scopeType: "type",
  },
  "type.foreach": {
    description: "Type of variable in a for each loop",
    scopeType: "type",
  },
  "type.interface": {
    description: "An interface declaration",
    scopeType: "type",
  },
  "type.alias": {
    description: "A type alias declaration",
    scopeType: "type",
  },
};
