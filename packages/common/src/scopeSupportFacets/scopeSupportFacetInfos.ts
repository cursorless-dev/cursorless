import type { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";
import type {
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
    description: "A xml/html element. Also used for LaTeX environments",
    scopeType: "xmlElement",
  },
  startTag: {
    description: "The start tag of a xml element",
    scopeType: "xmlStartTag",
  },
  endTag: {
    description: "The end tag of a xml element",
    scopeType: "xmlEndTag",
  },
  tags: {
    description: "Both tags in a xml element",
    scopeType: "xmlBothTags",
  },
  attribute: {
    description: "A attribute, eg of a html element or a C++ attribute",
    scopeType: "attribute",
  },

  environment: {
    description: "An environment, eg in LaTeX",
    scopeType: "environment",
  },

  section: {
    description: "A document section",
    scopeType: "section",
  },
  "section.iteration.document": documentIter("section", "sections"),
  "section.iteration.parent": iteration(
    "section",
    "sections",
    "the parent section",
  ),
  list: {
    description: "A list/array",
    scopeType: "list",
  },
  map: {
    description: "A map/dictionary",
    scopeType: "map",
  },
  regularExpression: {
    description: "A regular expression",
    scopeType: "regularExpression",
  },
  fieldAccess: {
    description: "A field access",
    scopeType: "private.fieldAccess",
  },
  ifStatement: {
    description: "An if statement",
    scopeType: "ifStatement",
  },

  statement: {
    description: "A statement, eg assignment, for loop, etc",
    scopeType: "statement",
  },
  "statement.class": {
    description: "A class declaration",
    scopeType: "statement",
  },
  "statement.interface": {
    description: "An interface declaration",
    scopeType: "statement",
  },
  "statement.enum": {
    description: "An enum declaration",
    scopeType: "statement",
  },
  "statement.field.class": {
    description: "A field declaration in a class",
    scopeType: "statement",
  },
  "statement.field.interface": {
    description: "A field declaration in a interface",
    scopeType: "statement",
  },
  "statement.iteration.document": documentIter("statement", "statements"),
  "statement.iteration.class": classIter("statement", "statements"),
  "statement.iteration.interface": interfaceIter("statement", "statements"),
  "statement.iteration.block": blockIter("statement", "statements"),

  class: {
    description: "A class in an object-oriented language",
    scopeType: "class",
  },
  "class.iteration.document": documentIter("class", "classes"),
  "class.iteration.block": blockIter("class", "classes"),
  className: {
    description: "The name of a class",
    scopeType: "className",
  },
  "className.iteration.document": documentIter("className", "class names"),
  "className.iteration.block": blockIter("className", "class names"),

  namedFunction: {
    description: "A named function declaration",
    scopeType: "namedFunction",
  },
  "namedFunction.method": {
    description: "A named method declaration in a class",
    scopeType: "namedFunction",
  },
  "namedFunction.method.iteration.class": classIter(
    "namedFunction",
    "named functions",
  ),
  "namedFunction.constructor": {
    description: "A constructor declaration in a class",
    scopeType: "namedFunction",
  },
  "namedFunction.iteration.block": blockIter(
    "namedFunction",
    "named functions",
  ),
  "namedFunction.iteration.document": documentIter(
    "namedFunction",
    "named functions",
  ),
  anonymousFunction: {
    description:
      "An anonymous function, eg a lambda function, an arrow function, etc",
    scopeType: "anonymousFunction",
  },
  functionName: {
    description: "The name of a function",
    scopeType: "functionName",
  },
  "functionName.method": {
    description: "The name of a method in a class",
    scopeType: "functionName",
  },
  "functionName.method.iteration.class": classIter(
    "functionName",
    "method names",
  ),
  "functionName.constructor": {
    description: "The name of a constructor in a class",
    scopeType: "functionName",
  },
  "functionName.iteration.block": blockIter("functionName", "function names"),
  "functionName.iteration.document": documentIter(
    "functionName",
    "function names",
  ),

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

  "argument.actual.singleLine": {
    description: "A single line argument in a function call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.multiLine": {
    description:
      "A multiline argument in a function call. Insertion delimiter should include new line.",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.iteration": iteration(
    "argumentOrParameter",
    "arguments in a function call",
    "the argument list. The domain should be the entire function call",
  ),
  "argument.actual.method.singleLine": {
    description: "A single line argument in a method call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.method.multiLine": {
    description:
      "A multi line argument in a method call. Insertion delimiter should include new line.",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.method.iteration": iteration(
    "argumentOrParameter",
    "arguments in a method call",
    "the argument list. The domain should be the entire method call",
  ),
  "argument.actual.constructor.singleLine": {
    description: "A single line argument in a constructor call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.constructor.multiLine": {
    description:
      "A multi line argument in a constructor call. Insertion delimiter should include new line.",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.constructor.iteration": iteration(
    "argumentOrParameter",
    "arguments in a constructor call",
    "the argument list. The domain should be the entire constructor call",
  ),

  "argument.formal.singleLine": {
    description: "A single line parameter in a function declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.multiLine": {
    description:
      "A multi line parameter in a function declaration. Insertion delimiter should include new line.",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.iteration": iteration(
    "argumentOrParameter",
    "formal parameters in a function declaration",
    "the parameters list. The domain should be the entire function",
  ),
  "argument.formal.method.singleLine": {
    description: "A single line parameter in a class method declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.method.multiLine": {
    description:
      "A multi line parameter in a class method declaration. Insertion delimiter should include new line.",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.method.iteration": iteration(
    "argumentOrParameter",
    "formal parameters in a method declaration",
    "the parameter list. The domain should be the entire method",
  ),

  "argument.formal.constructor.singleLine": {
    description: "A single line parameter in a constructor declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.constructor.multiLine": {
    description:
      "A multi line parameter in a constructor declaration. Insertion delimiter should include new line.",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.constructor.iteration": iteration(
    "argumentOrParameter",
    "formal parameters in a constructor declaration",
    "the parameter list. The domain should be the entire constructor",
  ),
  "argument.formal.lambda.singleLine": {
    description: "A single line parameter in a lambda declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.lambda.multiLine": {
    description:
      "A multi line parameter in a lambda declaration. Insertion delimiter should include new line.",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.lambda.iteration": iteration(
    "argumentOrParameter",
    "formal parameters in a lambda declaration",
    "the parameter list. The domain should be the entire lambda",
  ),
  "argument.catch": {
    description: "A parameter in a catch clause",
    scopeType: "argumentOrParameter",
  },

  "argumentList.actual.empty": {
    description:
      "An empty list of arguments in a function call. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.actual.singleLine": {
    description: "A single line list of arguments in a function call",
    scopeType: "argumentList",
  },
  "argumentList.actual.multiLine": {
    description:
      "A multi line list of arguments in a function call. Insertion delimiter should include new line.",
    scopeType: "argumentList",
  },
  "argumentList.actual.method.empty": {
    description:
      "An empty list of arguments in a method call. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.actual.method.singleLine": {
    description: "A single line list of arguments in a method call",
    scopeType: "argumentList",
  },
  "argumentList.actual.method.multiLine": {
    description:
      "A multi line list of arguments in a method call. Insertion delimiter should include new line.",
    scopeType: "argumentList",
  },
  "argumentList.actual.constructor.empty": {
    description:
      "An empty list of arguments in a constructor call. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.actual.constructor.singleLine": {
    description: "A single line list of arguments in a constructor call",
    scopeType: "argumentList",
  },
  "argumentList.actual.constructor.multiLine": {
    description:
      "A multi line list of arguments in a constructor call. Insertion delimiter should include new line.",
    scopeType: "argumentList",
  },

  "argumentList.formal.empty": {
    description:
      "An empty list of parameters in a function declaration. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.formal.singleLine": {
    description: "A single line list of parameters in a function declaration",
    scopeType: "argumentList",
  },
  "argumentList.formal.multiLine": {
    description:
      "A multi line list of parameters in a function declaration. Insertion delimiter should include new line.",
    scopeType: "argumentList",
  },
  "argumentList.formal.lambda.empty": {
    description:
      "An empty list of parameters in a lambda declaration. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.formal.lambda.singleLine": {
    description: "A single line list of parameters in a lambda declaration",
    scopeType: "argumentList",
  },
  "argumentList.formal.lambda.multiLine": {
    description:
      "A multi line list of parameters in a lambda declaration. Insertion delimiter should include new line.",
    scopeType: "argumentList",
  },
  "argumentList.formal.method.empty": {
    description:
      "An empty list of parameters in a class method declaration. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.formal.method.singleLine": {
    description:
      "A single line list of parameters in a class method declaration",
    scopeType: "argumentList",
  },
  "argumentList.formal.method.multiLine": {
    description:
      "A multi line list of parameters in a class method declaration. Insertion delimiter should include new line.",
    scopeType: "argumentList",
  },
  "argumentList.formal.constructor.empty": {
    description:
      "An empty list of parameters in a constructor declaration. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.formal.constructor.singleLine": {
    description:
      "A single line list of parameters in a constructor declaration",
    scopeType: "argumentList",
  },
  "argumentList.formal.constructor.multiLine": {
    description:
      "A multi line list of parameters in a constructor declaration. Insertion delimiter should include new line.",
    scopeType: "argumentList",
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

  "textFragment.comment.line": {
    description: "Text fragment consisting of a line comment",
    scopeType: "textFragment",
  },
  "textFragment.comment.block": {
    description: "Text fragment consisting of a block comment",
    scopeType: "textFragment",
  },
  "textFragment.string.singleLine": {
    description: "Text fragment consisting of a single-line string",
    scopeType: "textFragment",
  },
  "textFragment.string.multiLine": {
    description: "Text fragment consisting of a multi-line string",
    scopeType: "textFragment",
  },
  "textFragment.element": {
    description: "Text fragment consisting of a xml element interior",
    scopeType: "textFragment",
  },

  disqualifyDelimiter: {
    description:
      "Used to disqualify a token from being treated as a surrounding pair delimiter. This will usually be operators containing `>` or `<`, eg `<`, `<=`, `->`, etc",
    scopeType: "disqualifyDelimiter",
  },
  pairDelimiter: {
    description:
      "A pair delimiter, eg parentheses, brackets, braces, quotes, etc",
    scopeType: "pairDelimiter",
  },

  "branch.if": {
    description: "An if branch",
    scopeType: "branch",
  },
  "branch.if.elif.else": {
    description:
      "An if-elif-else branch. The removal range for the if branch should include the trailing `else` keyword.",
    scopeType: "branch",
  },
  "branch.if.else": {
    description: "An if-else branch",
    scopeType: "branch",
  },
  "branch.if.iteration": iteration(
    "branch",
    "if/elif/else branches",
    "the if-else statement",
  ),
  "branch.loop": {
    description:
      "A for / while loop branch. For most languages this is not supported, but eg in Python you can have an else branch for a loop.",
    scopeType: "branch",
  },
  "branch.loop.iteration": iteration(
    "branch",
    "loop branches",
    "the loop statement",
  ),
  "branch.try": {
    description: "A try/catch/finally branch",
    scopeType: "branch",
  },
  "branch.try.iteration": iteration(
    "branch",
    "try/catch/finally branches",
    "the try-catch statement",
  ),
  "branch.switchCase": {
    description: "A case/default branch in a switch statement",
    scopeType: "branch",
  },
  "branch.switchCase.iteration": iteration(
    "branch",
    "switch branches",
    "the switch statement body",
  ),
  "branch.ternary": {
    description: "A branch in a ternary expression",
    scopeType: "branch",
  },
  "branch.ternary.iteration": iteration(
    "branch",
    "ternary expression branches",
    "the ternary expression",
  ),
  "collectionItem.unenclosed": {
    description:
      "An item in a comma-separated list without enclosing delimiters. This could be multi-variable declarations, import statements, etc.",
    scopeType: "collectionItem",
  },
  "collectionItem.unenclosed.iteration": iteration(
    "collectionItem",
    "items in a comma-separated list without enclosing delimiters",
  ),

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
  "condition.switchCase.iteration": iteration(
    "condition",
    "conditions in a switch statement",
    "the switch statement body",
  ),

  "name.assignment": {
    description: "Name (LHS) of an assignment",
    scopeType: "name",
  },
  "name.assignment.pattern": {
    description: "LHS of an assignment with pattern destructuring",
    scopeType: "name",
  },
  "name.command": {
    description: "LHS of a command, eg Talon spoken command or bash",
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
  "name.method": {
    description: "Name of a class method",
    scopeType: "name",
  },
  "name.constructor": {
    description: "Name of a constructor",
    scopeType: "name",
  },
  "name.class": {
    description: "Name of a class",
    scopeType: "name",
  },
  "name.interface": {
    description: "Name of a interface",
    scopeType: "name",
  },
  "name.enum": {
    description: "Name of an enum",
    scopeType: "name",
  },
  "name.namespace": {
    description: "Name of a namespace",
    scopeType: "name",
  },
  "name.field.class": {
    description: "Name (LHS) of a field in a class",
    scopeType: "name",
  },
  "name.field.interface": {
    description: "Name (LHS) of a field in an interface",
    scopeType: "name",
  },
  "name.field.enum": {
    description: "Name (LHS) of a field in an enum",
    scopeType: "name",
  },
  "name.iteration.block": blockIter("name", "names"),
  "name.iteration.class": classIter("name", "names"),
  "name.iteration.interface": interfaceIter("name", "names"),
  "name.iteration.enum": enumIter("name", "names"),
  "name.iteration.document": documentIter("name", "names"),
  "name.resource": {
    description: "Name in a 'with' / 'use' / 'using' statement",
    scopeType: "name",
  },
  "name.resource.iteration": iteration(
    "name",
    "names in a 'with' / 'use' / 'using' statement",
    "the resource list. The domain should be the entire statement",
  ),
  "name.argument.actual": {
    description: "Name of a (keyword) argument in a function call",
    scopeType: "name",
  },
  "name.argument.actual.iteration": iteration(
    "name",
    "names of the arguments in a function call",
    "the argument list. The domain should be the whole function call",
  ),
  "name.argument.formal": {
    description: "Name of a parameter in a function declaration",
    scopeType: "name",
  },
  "name.argument.formal.iteration": iteration(
    "name",
    "names of formal parameters in a function declaration",
    "the parameters list. The domain should be the entire function",
  ),
  "name.argument.formal.method": {
    description: "Name of a parameter in a class method declaration",
    scopeType: "name",
  },
  "name.argument.formal.method.iteration": iteration(
    "name",
    "names of formal parameters in a method declaration",
    "the parameters list. The domain should be the entire method",
  ),
  "name.argument.formal.constructor": {
    description: "The name of a parameter in a constructor declaration",
    scopeType: "name",
  },
  "name.argument.formal.constructor.iteration": iteration(
    "name",
    "names of formal parameters in a constructor declaration",
    "the parameters list. The domain should be the entire constructor",
  ),
  "name.argument.catch": {
    description: "Name of a parameter in a catch clause",
    scopeType: "name",
  },

  "key.attribute": {
    description: "Key (LHS) of an attribute eg in a xml element",
    scopeType: "collectionKey",
  },
  "key.mapPair": {
    description: "Key (LHS) of a key-value pair of a map",
    scopeType: "collectionKey",
  },
  "key.mapPair.iteration": iteration(
    "collectionKey",
    "keys of key-value pairs in a map",
    "should be between the braces",
  ),

  "value.assignment": {
    description: "Value (RHS) of an assignment",
    scopeType: "value",
  },
  "value.command": {
    description: "Value (RHS) of an command, eg Talon spoken command",
    scopeType: "value",
  },
  "value.variable": {
    description: "Value (RHS) of a variable declaration",
    scopeType: "value",
  },
  "value.variable.pattern": {
    description:
      "Value (RHS) of a variable declaration with pattern destructuring",
    scopeType: "value",
  },
  "value.mapPair": {
    description: "Value (RHS) of a key-value pair in a map",
    scopeType: "value",
  },
  "value.mapPair.iteration": iteration(
    "value",
    "values of key-value pairs in a map",
    "should be between the braces",
  ),
  "value.foreach": {
    description: "Iterable in a for each loop",
    scopeType: "value",
  },
  "value.attribute": {
    description: "Value (RHS) of an attribute eg in a xml element",
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
  "value.field.class": {
    description: "Value (RHS) of a field in a class",
    scopeType: "value",
  },
  "value.field.enum": {
    description: "Value (RHS) of a field in an enum",
    scopeType: "value",
  },
  "value.yield": {
    description: "Value of a yield statement",
    scopeType: "value",
  },
  "value.switch": {
    description: "The value / subject of a switch statement",
    scopeType: "value",
  },
  "value.iteration.block": blockIter("value", "values"),
  "value.iteration.class": classIter("value", "values"),
  "value.iteration.enum": enumIter("value", "values"),
  "value.iteration.document": documentIter("value", "values"),
  "value.resource": {
    description: "Value of a 'with' / 'use' / 'using' statement",
    scopeType: "value",
  },
  "value.resource.iteration": iteration(
    "value",
    "values in a 'with' / 'use' / 'using' statement",
    "the resource list. The domain should be the entire statement",
  ),
  "value.argument.actual": {
    description: "The value of a (keyword) argument in a function call",
    scopeType: "value",
  },
  "value.argument.actual.iteration": iteration(
    "value",
    "values of arguments in a function call",
    "the arguments list. The domain should be the entire function call",
  ),
  "value.argument.formal": {
    description: "The value of a (keyword) argument in a function declaration",
    scopeType: "value",
  },
  "value.argument.formal.iteration": iteration(
    "value",
    "values of formal parameters in a function declaration",
    "the parameters list. The domain should be the entire function",
  ),
  "value.argument.formal.method": {
    description: "The value of a parameter in a class method declaration",
    scopeType: "value",
  },
  "value.argument.formal.method.iteration": iteration(
    "value",
    "values of formal parameters in a method declaration",
    "the parameters list. The domain should be the entire method",
  ),
  "value.argument.formal.constructor": {
    description: "The value of a parameter in a constructor declaration",
    scopeType: "value",
  },
  "value.argument.formal.constructor.iteration": iteration(
    "value",
    "values of formal parameters in a constructor declaration",
    "the parameters list. The domain should be the entire constructor",
  ),
  "value.typeAlias": {
    description: "Value of a type alias declaration",
    scopeType: "value",
  },

  "type.variable": {
    description: "Type of variable in a variable declaration",
    scopeType: "type",
  },
  "type.argument.formal": {
    description: "Type of formal parameter in a function declaration",
    scopeType: "type",
  },
  "type.argument.formal.iteration": iteration(
    "type",
    "types of formal parameters in a function declaration",
    "the parameters list. The domain should be the entire function",
  ),
  "type.argument.formal.method": {
    description: "Type of formal parameter in a class method declaration",
    scopeType: "type",
  },
  "type.argument.formal.method.iteration": iteration(
    "type",
    "types of formal parameters in a method declaration",
    "the parameters list. The domain should be the entire method",
  ),
  "type.argument.formal.constructor": {
    description: "Type of formal parameter in a constructor declaration",
    scopeType: "type",
  },
  "type.argument.formal.constructor.iteration": iteration(
    "type",
    "types of formal parameters in a constructor declaration",
    "the parameters list. The domain should be the entire constructor",
  ),
  "type.argument.catch": {
    description: "Type of parameter in a catch clause",
    scopeType: "type",
  },

  "type.return": {
    description: "Type of return value in a function declaration",
    scopeType: "type",
  },
  "type.field.class": {
    description: "Type of field in a class",
    scopeType: "type",
  },
  "type.field.interface": {
    description: "Type of field in a interface",
    scopeType: "type",
  },
  "type.foreach": {
    description: "Type of variable in a for each loop",
    scopeType: "type",
  },
  "type.enum": {
    description: "An enum declaration",
    scopeType: "type",
  },
  "type.class": {
    description: "A class declaration",
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
  "type.cast": {
    description: "A type cast",
    scopeType: "type",
  },
  "type.typeArgument": {
    description: "Type argument to a generic / parametrized type",
    scopeType: "type",
  },
  "type.typeArgument.iteration": iteration(
    "type",
    "type arguments to a generic / parametrized type",
    "the type argument list",
  ),
  "type.resource": {
    description: "Type in a 'with' / 'use' / 'using' statement",
    scopeType: "type",
  },
  "type.resource.iteration": iteration(
    "type",
    "types in a 'with' / 'use' / 'using' statement",
    "the resource list. The domain should be the entire statement",
  ),
  "type.iteration.block": blockIter("type", "types"),
  "type.iteration.class": classIter("type", "types"),
  "type.iteration.interface": interfaceIter("type", "types"),
  "type.iteration.document": documentIter("type", "types"),

  "interior.element": {
    description: "The interior/children of a XML element",
    scopeType: { type: "interior" },
  },
  "interior.command": {
    description: "The body of a command, eg Talon spoken command",
    scopeType: { type: "interior" },
  },
  "interior.cell": {
    description: "The body of a code cell in markdown",
    scopeType: { type: "interior" },
  },
  "interior.class": {
    description: "The body of a class",
    scopeType: { type: "interior" },
  },
  "interior.interface": {
    description: "The body of a interface",
    scopeType: { type: "interior" },
  },
  "interior.enum": {
    description: "The body of an enum",
    scopeType: { type: "interior" },
  },
  "interior.function": {
    description: "The body of a function declaration",
    scopeType: { type: "interior" },
  },
  "interior.constructor": {
    description: "The body of a constructor declaration",
    scopeType: { type: "interior" },
  },
  "interior.method": {
    description: "The body of a method declaration",
    scopeType: { type: "interior" },
  },
  "interior.lambda": {
    description: "The block body of a lambda/anonymous function",
    scopeType: { type: "interior" },
  },
  "interior.if": {
    description: "The body of an if/elif/else branch",
    scopeType: { type: "interior" },
  },
  "interior.try": {
    description: "The body of a try/catch/finally branch",
    scopeType: { type: "interior" },
  },
  "interior.switch": {
    description: "The body of a switch statement",
    scopeType: { type: "interior" },
  },
  "interior.switchCase": {
    description: "The body of a switch case branch",
    scopeType: { type: "interior" },
  },
  "interior.ternary": {
    description: "The body of a ternary condition/branch",
    scopeType: { type: "interior" },
  },
  "interior.for": {
    description: "The body of a for loop",
    scopeType: { type: "interior" },
  },
  "interior.foreach": {
    description: "The body of a for-each loop",
    scopeType: { type: "interior" },
  },
  "interior.while": {
    description: "The body of a while loop",
    scopeType: { type: "interior" },
  },
  "interior.doWhile": {
    description: "The body of a do-while loop",
    scopeType: { type: "interior" },
  },
  "interior.resource": {
    description: "the body of a 'with' / 'use' / 'using' statement",
    scopeType: { type: "interior" },
  },
  "interior.namespace": {
    description: "the body of a namespace statement",
    scopeType: { type: "interior" },
  },
  "interior.static": {
    description: "the body of a static statement",
    scopeType: { type: "interior" },
  },

  notebookCell: {
    description: "A cell in a notebook or a markdown code block",
    scopeType: "notebookCell",
  },
  selector: {
    description: "A selector in a css rule set",
    scopeType: "selector",
  },
  unit: {
    description: "A unit in a css rule set",
    scopeType: "unit",
  },
};

function documentIter(
  scopeType: SimpleScopeTypeType,
  label: string,
): ScopeSupportFacetInfo {
  return iteration(
    scopeType,
    label,
    "the entire document including leading and trailing empty lines",
  );
}

function classIter(
  scopeType: SimpleScopeTypeType,
  label: string,
): ScopeSupportFacetInfo {
  return iteration(scopeType, label, "class bodies");
}

function interfaceIter(
  scopeType: SimpleScopeTypeType,
  label: string,
): ScopeSupportFacetInfo {
  return iteration(scopeType, label, "interface bodies");
}

function enumIter(
  scopeType: SimpleScopeTypeType,
  label: string,
): ScopeSupportFacetInfo {
  return iteration(scopeType, label, "enum bodies");
}

function blockIter(
  scopeType: SimpleScopeTypeType,
  label: string,
): ScopeSupportFacetInfo {
  return iteration(
    scopeType,
    label,
    "statement blocks (body of functions/if-statements/for-loops/etc)",
  );
}

function iteration(
  scopeType: SimpleScopeTypeType,
  label: string,
  desc?: string,
): ScopeSupportFacetInfo {
  const description =
    desc != null
      ? `Iteration scope for ${label}: ${desc}.`
      : `Iteration scope for ${label}`;
  return {
    description,
    scopeType,
    isIteration: true,
  };
}
