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
    description: "An XML/HTML element. Also used for LaTeX environments",
    scopeType: "xmlElement",
  },
  startTag: {
    description: "The start tag of an XML/HTML element",
    scopeType: "xmlStartTag",
  },
  endTag: {
    description: "The end tag of an XML/HTML element",
    scopeType: "xmlEndTag",
  },
  tags: {
    description: "Both tags in an XML/HTML element",
    scopeType: "xmlBothTags",
  },
  attribute: {
    description: "An attribute, eg of an HTML element or a C++ attribute",
    scopeType: "attribute",
  },

  environment: {
    description: "An environment, eg in LaTeX",
    scopeType: "environment",
  },

  chapter: {
    description: "A document chapter",
    scopeType: "chapter",
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
  subSection: {
    description: "A document subsection",
    scopeType: "subSection",
  },
  subSubSection: {
    description: "A document subsubsection",
    scopeType: "subSubSection",
  },
  sectionLevelOne: {
    description: "A level one section",
    scopeType: "sectionLevelOne",
  },
  sectionLevelTwo: {
    description: "A level two section",
    scopeType: "sectionLevelTwo",
  },
  sectionLevelThree: {
    description: "A level three section",
    scopeType: "sectionLevelThree",
  },
  sectionLevelFour: {
    description: "A level four section",
    scopeType: "sectionLevelFour",
  },
  sectionLevelFive: {
    description: "A level five section",
    scopeType: "sectionLevelFive",
  },
  sectionLevelSix: {
    description: "A level six section",
    scopeType: "sectionLevelSix",
  },
  namedParagraph: {
    description: "A named paragraph",
    scopeType: "namedParagraph",
  },
  subParagraph: {
    description: "A subparagraph",
    scopeType: "subParagraph",
  },
  part: {
    description: "A document part",
    scopeType: "part",
  },

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

  "statement.class": {
    description: "A class/struct declaration",
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
    description: "A field declaration in a class/struct",
    scopeType: "statement",
  },
  "statement.field.interface": {
    description: "A field declaration in an interface",
    scopeType: "statement",
  },
  "statement.function": {
    description: "A named function declaration",
    scopeType: "statement",
  },
  "statement.constructor": {
    description: "A constructor declaration",
    scopeType: "statement",
  },
  "statement.method": {
    description: "A method declaration",
    scopeType: "statement",
  },
  "statement.method.interface": {
    description: "A method declaration in an interface",
    scopeType: "statement",
  },
  "statement.functionCall": {
    description: "A function call statement",
    scopeType: "statement",
  },
  "statement.if": {
    description: "An if/elif/else statement",
    scopeType: "statement",
  },
  "statement.try": {
    description: "A try/catch/finally statement",
    scopeType: "statement",
  },
  "statement.switch": {
    description: "A switch statement",
    scopeType: "statement",
  },
  "statement.for": {
    description: "A for loop",
    scopeType: "statement",
  },
  "statement.foreach": {
    description: "A for-each loop",
    scopeType: "statement",
  },
  "statement.while": {
    description: "A while loop",
    scopeType: "statement",
  },
  "statement.doWhile": {
    description: "A do-while loop",
    scopeType: "statement",
  },
  "statement.variable.uninitialized": {
    description: "An uninitialized variable declaration",
    scopeType: "statement",
  },
  "statement.variable.initialized": {
    description: "An initialized variable declaration",
    scopeType: "statement",
  },
  "statement.variable.destructuring": {
    description:
      "A variable declaration using a destructuring pattern, eg `const { x, y } = point`",
    scopeType: "statement",
  },
  "statement.constant": {
    description: "A constant declaration",
    scopeType: "statement",
  },
  "statement.assignment": {
    description: "An assignment statement",
    scopeType: "statement",
  },
  "statement.assignment.destructuring": {
    description: "An assignment statement using a destructuring pattern",
    scopeType: "statement",
  },
  "statement.assignment.compound": {
    description: "A compound assignment statement, eg +=/-=",
    scopeType: "statement",
  },
  "statement.typeAlias": {
    description: "A type alias declaration",
    scopeType: "statement",
  },
  "statement.update": {
    description: "An update statement, eg ++/--",
    scopeType: "statement",
  },
  "statement.return": {
    description: "A return statement",
    scopeType: "statement",
  },
  "statement.yield": {
    description: "A yield statement",
    scopeType: "statement",
  },
  "statement.throw": {
    description: "A throw statement",
    scopeType: "statement",
  },
  "statement.break": {
    description: "A break statement",
    scopeType: "statement",
  },
  "statement.continue": {
    description: "A continue statement",
    scopeType: "statement",
  },
  "statement.resource": {
    description: "A resource management statement, eg `with` / `use` / `using`",
    scopeType: "statement",
  },
  "statement.command": {
    description: "A command statement, eg Talon spoken command or bash",
    scopeType: "statement",
  },
  "statement.package": {
    description: "A package declaration",
    scopeType: "statement",
  },
  "statement.namespace": {
    description: "A namespace declaration",
    scopeType: "statement",
  },
  "statement.static": {
    description:
      "A static initialization block in a class, eg `static { ... }`",
    scopeType: "statement",
  },
  "statement.import": {
    description: "An import statement",
    scopeType: "statement",
  },
  "statement.misc": {
    description: "A miscellaneous statement",
    scopeType: "statement",
  },

  "statement.iteration.document": documentIter("statement", "statements"),
  "statement.iteration.class": classIter("statement", "statements"),
  "statement.iteration.interface": interfaceIter("statement", "statements"),
  "statement.iteration.block": blockIter("statement", "statements"),

  class: {
    description: "A class/struct declaration",
    scopeType: "class",
  },
  "class.iteration.document": documentIter("class", "classes"),
  "class.iteration.class": classIter("class", "classes"),

  namedFunction: {
    description: "A named function declaration",
    scopeType: "namedFunction",
  },
  "namedFunction.method": {
    description: "A method declaration",
    scopeType: "namedFunction",
  },
  "namedFunction.constructor": {
    description: "A constructor declaration",
    scopeType: "namedFunction",
  },
  "namedFunction.iteration.document": documentIter(
    "namedFunction",
    "named functions",
  ),
  "namedFunction.iteration.class": classIter(
    "namedFunction",
    "named functions",
  ),
  anonymousFunction: {
    description:
      "An anonymous function, eg a lambda function, an arrow function, etc.",
    scopeType: "anonymousFunction",
  },

  functionCall: {
    description: "A function call",
    scopeType: "functionCall",
  },
  "functionCall.constructor": {
    description: "A constructor call",
    scopeType: "functionCall",
  },
  "functionCall.method": {
    description: "A method call",
    scopeType: "functionCall",
  },
  "functionCall.chain": {
    description: "A chain of function calls, eg `foo().bar()`",
    scopeType: "functionCall",
  },
  "functionCall.generic": {
    description: "A function call with generic type arguments",
    scopeType: "functionCall",
  },
  "functionCall.enum": {
    description: "An enum constructor call",
    scopeType: "functionCall",
  },

  functionCallee: {
    description: "The function being called in a function call",
    scopeType: "functionCallee",
  },
  "functionCallee.constructor": {
    description:
      "The class being constructed in a class instantiation, including the `new` keyword.",
    scopeType: "functionCallee",
  },
  "functionCallee.method": {
    description:
      "The function being called in a method call, including parent objects.",
    scopeType: "functionCallee",
  },
  "functionCallee.chain": {
    description:
      "The function being called in a chain of function calls, including parent objects.",
    scopeType: "functionCallee",
  },
  "functionCallee.generic": {
    description:
      "The function being called in a function call with generic type arguments",
    scopeType: "functionCallee",
  },
  "functionCallee.enum": {
    description: "The enum constructor being called",
    scopeType: "functionCallee",
  },

  "argument.actual.singleLine": {
    description: "A single-line argument in a function call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.multiLine": {
    description:
      "A multi-line argument in a function call. Insertion delimiter should include a newline.",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.iteration": iteration(
    "argumentOrParameter",
    "arguments in a function call",
    "the argument list. The domain should be the entire function call",
  ),
  "argument.actual.method.singleLine": {
    description: "A single-line argument in a method call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.method.multiLine": {
    description:
      "A multi-line argument in a method call. Insertion delimiter should include a newline.",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.method.iteration": iteration(
    "argumentOrParameter",
    "arguments in a method call",
    "the argument list. The domain should be the entire method call",
  ),
  "argument.actual.constructor.singleLine": {
    description: "A single-line argument in a constructor call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.constructor.multiLine": {
    description:
      "A multi-line argument in a constructor call. Insertion delimiter should include a newline.",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.constructor.iteration": iteration(
    "argumentOrParameter",
    "arguments in a constructor call",
    "the argument list. The domain should be the entire constructor call.",
  ),
  "argument.actual.enum.singleLine": {
    description: "A single-line argument in an enum constructor call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.enum.multiLine": {
    description:
      "A multi-line argument in an enum constructor call. Insertion delimiter should include a newline.",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.enum.iteration": iteration(
    "argumentOrParameter",
    "arguments in an enum constructor call",
    "the argument list. The domain should be the entire enum constructor call.",
  ),

  "argument.formal.singleLine": {
    description: "A single-line parameter in a function declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.multiLine": {
    description:
      "A multi-line parameter in a function declaration. Insertion delimiter should include a newline.",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.iteration": iteration(
    "argumentOrParameter",
    "parameters in a function declaration",
    "the parameter list. The domain should be the entire function",
  ),
  "argument.formal.method.singleLine": {
    description: "A single-line parameter in a method declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.method.multiLine": {
    description:
      "A multi-line parameter in a method declaration. Insertion delimiter should include a newline.",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.method.iteration": iteration(
    "argumentOrParameter",
    "parameters in a method declaration",
    "the parameter list. The domain should be the entire method",
  ),

  "argument.formal.constructor.singleLine": {
    description: "A single-line parameter in a constructor declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.constructor.multiLine": {
    description:
      "A multi-line parameter in a constructor declaration. Insertion delimiter should include a newline.",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.constructor.iteration": iteration(
    "argumentOrParameter",
    "parameters in a constructor declaration",
    "the parameter list. The domain should be the entire constructor",
  ),
  "argument.formal.lambda.singleLine": {
    description: "A single-line parameter in an anonymous function",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.lambda.multiLine": {
    description:
      "A multi-line parameter in an anonymous function. Insertion delimiter should include a newline.",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.lambda.iteration": iteration(
    "argumentOrParameter",
    "parameters in an anonymous function",
    "the parameter list. The domain should be the entire anonymous function",
  ),
  "argument.formal.catch": {
    description: "A parameter in a catch clause",
    scopeType: "argumentOrParameter",
  },

  "argumentList.actual.empty": {
    description:
      "An empty list of arguments in a function call. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.actual.singleLine": {
    description: "A single-line list of arguments in a function call",
    scopeType: "argumentList",
  },
  "argumentList.actual.multiLine": {
    description:
      "A multi-line list of arguments in a function call. Insertion delimiter should include a newline.",
    scopeType: "argumentList",
  },
  "argumentList.actual.method.empty": {
    description:
      "An empty list of arguments in a method call. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.actual.method.singleLine": {
    description: "A single-line list of arguments in a method call",
    scopeType: "argumentList",
  },
  "argumentList.actual.method.multiLine": {
    description:
      "A multi-line list of arguments in a method call. Insertion delimiter should include a newline.",
    scopeType: "argumentList",
  },
  "argumentList.actual.constructor.empty": {
    description:
      "An empty list of arguments in a constructor call. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.actual.constructor.singleLine": {
    description: "A single-line list of arguments in a constructor call",
    scopeType: "argumentList",
  },
  "argumentList.actual.constructor.multiLine": {
    description:
      "A multi-line list of arguments in a constructor call. Insertion delimiter should include a newline.",
    scopeType: "argumentList",
  },
  "argumentList.actual.enum.empty": {
    description:
      "An empty list of arguments in an enum constructor call. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.actual.enum.singleLine": {
    description: "A single-line list of arguments in an enum constructor call",
    scopeType: "argumentList",
  },
  "argumentList.actual.enum.multiLine": {
    description:
      "A multi-line list of arguments in an enum constructor call. Insertion delimiter should include a newline.",
    scopeType: "argumentList",
  },

  "argumentList.formal.empty": {
    description:
      "An empty list of parameters in a function declaration. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.formal.singleLine": {
    description: "A single-line list of parameters in a function declaration",
    scopeType: "argumentList",
  },
  "argumentList.formal.multiLine": {
    description:
      "A multi-line list of parameters in a function declaration. Insertion delimiter should include a newline.",
    scopeType: "argumentList",
  },
  "argumentList.formal.lambda.empty": {
    description:
      "An empty list of parameters in an anonymous function. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.formal.lambda.singleLine": {
    description: "A single-line list of parameters in an anonymous function",
    scopeType: "argumentList",
  },
  "argumentList.formal.lambda.multiLine": {
    description:
      "A multi-line list of parameters in an anonymous function. Insertion delimiter should include a newline.",
    scopeType: "argumentList",
  },
  "argumentList.formal.method.empty": {
    description:
      "An empty list of parameters in a method declaration. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.formal.method.singleLine": {
    description: "A single-line list of parameters in a method declaration",
    scopeType: "argumentList",
  },
  "argumentList.formal.method.multiLine": {
    description:
      "A multi-line list of parameters in a method declaration. Insertion delimiter should include a newline.",
    scopeType: "argumentList",
  },
  "argumentList.formal.constructor.empty": {
    description:
      "An empty list of parameters in a constructor declaration. Insertion delimiter should be empty.",
    scopeType: "argumentList",
  },
  "argumentList.formal.constructor.singleLine": {
    description:
      "A single-line list of parameters in a constructor declaration",
    scopeType: "argumentList",
  },
  "argumentList.formal.constructor.multiLine": {
    description:
      "A multi-line list of parameters in a constructor declaration. Insertion delimiter should include a newline.",
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
    "the if/elif/else statement",
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
    "the try/catch/finally statement",
  ),
  "branch.switchCase": {
    description: "A case/default branch in a switch statement",
    scopeType: "branch",
  },
  "branch.switchCase.iteration": iteration(
    "branch",
    "case/default branches in a switch statement",
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
  "collectionItem.unenclosed.singleLine": {
    description:
      "An item in a comma-separated single-line list without enclosing delimiters. This could be multi-variable declarations, import statements, etc.",
    scopeType: "collectionItem",
  },
  "collectionItem.unenclosed.multiLine": {
    description:
      "An item in a comma-separated multi-line list without enclosing delimiters. This could be multi-variable declarations, import statements, etc. Insertion delimiter should include a newline.",
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
    description: "A condition in a do-while loop",
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

  "name.command": {
    description: "Name (LHS) of a command, eg Talon spoken command or bash",
    scopeType: "name",
  },
  "name.variable.uninitialized": {
    description: "Name (LHS) of an uninitialized variable declaration",
    scopeType: "name",
  },
  "name.variable.initialized": {
    description: "Name (LHS) of an initialized variable declaration",
    scopeType: "name",
  },
  "name.variable.destructuring": {
    description:
      "Name (LHS) of a variable declaration using a destructuring pattern",
    scopeType: "name",
  },
  "name.constant": {
    description: "Name (LHS) of a constant declaration",
    scopeType: "name",
  },
  "name.assignment": {
    description: "Name (LHS) of an assignment statement",
    scopeType: "name",
  },
  "name.assignment.destructuring": {
    description:
      "Name (LHS) of an assignment statement using a destructuring pattern",
    scopeType: "name",
  },
  "name.assignment.compound": {
    description: "Name (LHS) of a compound assignment statement, eg +=/-=",
    scopeType: "name",
  },
  "name.foreach": {
    description: "Iteration variable name in a for-each loop",
    scopeType: "name",
  },
  "name.function": {
    description: "Name of a function declaration",
    scopeType: "name",
  },
  "name.method": {
    description: "Name of a method declaration",
    scopeType: "name",
  },
  "name.method.interface": {
    description: "Name of a method declaration in an interface",
    scopeType: "name",
  },
  "name.constructor": {
    description: "Name of a constructor declaration",
    scopeType: "name",
  },
  "name.class": {
    description: "Name of a class/struct declaration",
    scopeType: "name",
  },
  "name.interface": {
    description: "Name of an interface declaration",
    scopeType: "name",
  },
  "name.enum": {
    description: "Name of an enum declaration",
    scopeType: "name",
  },
  "name.typeAlias": {
    description: "Name (LHS) of a type alias declaration",
    scopeType: "name",
  },
  "name.namespace": {
    description: "Name of a namespace declaration",
    scopeType: "name",
  },
  "name.field.class": {
    description: "Name (LHS) of a field declaration in a class/struct",
    scopeType: "name",
  },
  "name.field.interface": {
    description: "Name (LHS) of a field declaration in an interface",
    scopeType: "name",
  },
  "name.field.enum": {
    description: "Name (LHS) of a field declaration in an enum",
    scopeType: "name",
  },
  "name.iteration.block": blockIter("name", "names"),
  "name.iteration.class": classIter("name", "names"),
  "name.iteration.interface": interfaceIter("name", "names"),
  "name.iteration.enum": enumIter("name", "names"),
  "name.iteration.document": documentIter("name", "names"),
  "name.resource": {
    description:
      "Name in a resource management statement, eg `with` / `use` / `using`",
    scopeType: "name",
  },
  "name.argument.actual": {
    description: "Name of a (keyword) argument in a function call",
    scopeType: "name",
  },
  "name.argument.actual.iteration": iteration(
    "name",
    "names of (keyword) arguments in a function call",
    "the argument list",
  ),
  "name.argument.formal": {
    description: "Name of a parameter in a function declaration",
    scopeType: "name",
  },
  "name.argument.formal.iteration": iteration(
    "name",
    "names of parameters in a function declaration",
    "the parameter list",
  ),
  "name.argument.formal.method": {
    description: "Name of a parameter in a method declaration",
    scopeType: "name",
  },
  "name.argument.formal.method.iteration": iteration(
    "name",
    "names of parameters in a method declaration",
    "the parameter list",
  ),
  "name.argument.formal.lambda": {
    description: "Name of a parameter in an anonymous function",
    scopeType: "name",
  },
  "name.argument.formal.lambda.iteration": iteration(
    "name",
    "names of parameters in an anonymous function",
    "the parameter list",
  ),
  "name.argument.formal.constructor": {
    description: "Name of a parameter in a constructor declaration",
    scopeType: "name",
  },
  "name.argument.formal.constructor.iteration": iteration(
    "name",
    "names of parameters in a constructor declaration",
    "the parameter list",
  ),
  "name.argument.catch": {
    description: "Name of a parameter in a catch clause",
    scopeType: "name",
  },

  "key.attribute": {
    description: "Key (LHS) of an attribute, eg in an XML/HTML element",
    scopeType: "collectionKey",
  },
  "key.mapPair": {
    description: "Key (LHS) of a key-value pair in a map",
    scopeType: "collectionKey",
  },
  "key.mapPair.iteration": iteration(
    "collectionKey",
    "keys of key-value pairs in a map",
    "should be between the braces",
  ),

  "value.command": {
    description: "Value (RHS) of a command, eg Talon spoken command",
    scopeType: "value",
  },
  "value.variable": {
    description: "Value (RHS) of a variable declaration",
    scopeType: "value",
  },
  "value.variable.destructuring": {
    description:
      "Value (RHS) of a variable declaration using a destructuring pattern",
    scopeType: "value",
  },
  "value.constant": {
    description: "Value (RHS) of a constant declaration",
    scopeType: "value",
  },
  "value.assignment": {
    description: "Value (RHS) of an assignment statement",
    scopeType: "value",
  },
  "value.assignment.destructuring": {
    description:
      "Value (RHS) of an assignment statement using a destructuring pattern",
    scopeType: "value",
  },
  "value.assignment.compound": {
    description: "Value (RHS) of a compound assignment statement, eg +=/-=",
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
    description: "Iterable in a for-each loop",
    scopeType: "value",
  },
  "value.attribute": {
    description: "Value (RHS) of an attribute, eg in an XML/HTML element",
    scopeType: "value",
  },
  "value.return": {
    description: "Return value of a function",
    scopeType: "value",
  },
  "value.return.lambda": {
    description: "Implicit return value of an anonymous function",
    scopeType: "value",
  },
  "value.field.class": {
    description: "Value (RHS) of a field declaration in a class/struct",
    scopeType: "value",
  },
  "value.field.interface": {
    description: "Value (RHS) of a field declaration in an interface",
    scopeType: "value",
  },
  "value.field.enum": {
    description: "Value (RHS) of a field declaration in an enum",
    scopeType: "value",
  },
  "value.yield": {
    description: "Value of a yield statement",
    scopeType: "value",
  },
  "value.throw": {
    description: "Value of a throw statement",
    scopeType: "value",
  },
  "value.switch": {
    description: "Value / subject of a switch statement",
    scopeType: "value",
  },
  "value.iteration.block": blockIter("value", "values"),
  "value.iteration.class": classIter("value", "values"),
  "value.iteration.enum": enumIter("value", "values"),
  "value.iteration.document": documentIter("value", "values"),
  "value.resource": {
    description:
      "Value of a resource management statement, eg `with` / `use` / `using`",
    scopeType: "value",
  },
  "value.argument.actual": {
    description: "Value of a (keyword) argument in a function call",
    scopeType: "value",
  },
  "value.argument.actual.iteration": iteration(
    "value",
    "values of (keyword) arguments in a function call",
    "the argument list",
  ),
  "value.argument.formal": {
    description: "Default value of a parameter in a function declaration",
    scopeType: "value",
  },
  "value.argument.formal.iteration": iteration(
    "value",
    "default values of parameters in a function declaration",
    "the parameter list",
  ),
  "value.argument.formal.method": {
    description: "Default value of a parameter in a method declaration",
    scopeType: "value",
  },
  "value.argument.formal.method.iteration": iteration(
    "value",
    "default values of parameters in a method declaration",
    "the parameter list",
  ),
  "value.argument.formal.constructor": {
    description: "Default value of a parameter in a constructor declaration",
    scopeType: "value",
  },
  "value.argument.formal.constructor.iteration": iteration(
    "value",
    "default values of parameters in a constructor declaration",
    "the parameter list",
  ),
  "value.argument.formal.lambda": {
    description: "Default value of a parameter in an anonymous function",
    scopeType: "value",
  },
  "value.argument.formal.lambda.iteration": iteration(
    "value",
    "default values of parameters in an anonymous function",
    "the parameter list",
  ),
  "value.typeAlias": {
    description: "Type expression (RHS) of a type alias declaration",
    scopeType: "value",
  },

  "type.variable.uninitialized": {
    description: "Type of an uninitialized variable declaration",
    scopeType: "type",
  },
  "type.variable.initialized": {
    description: "Type of an initialized variable declaration",
    scopeType: "type",
  },
  "type.constant": {
    description: "Type of a constant declaration",
    scopeType: "type",
  },
  "type.argument.formal": {
    description: "Type of a parameter in a function declaration",
    scopeType: "type",
  },
  "type.argument.formal.iteration": iteration(
    "type",
    "types of parameters in a function declaration",
    "the parameter list",
  ),
  "type.argument.formal.method": {
    description: "Type of a parameter in a method declaration",
    scopeType: "type",
  },
  "type.argument.formal.method.iteration": iteration(
    "type",
    "types of parameters in a method declaration",
    "the parameter list",
  ),
  "type.argument.formal.lambda": {
    description: "Type of a parameter in an anonymous function",
    scopeType: "type",
  },
  "type.argument.formal.lambda.iteration": iteration(
    "type",
    "types of parameters in an anonymous function",
    "the parameter list",
  ),
  "type.argument.formal.constructor": {
    description: "Type of a parameter in a constructor declaration",
    scopeType: "type",
  },
  "type.argument.formal.constructor.iteration": iteration(
    "type",
    "types of parameters in a constructor declaration",
    "the parameter list",
  ),
  "type.argument.catch": {
    description: "Type of a parameter in a catch clause",
    scopeType: "type",
  },

  "type.return": {
    description: "Type of a return value in a function declaration",
    scopeType: "type",
  },
  "type.return.method": {
    description: "Type of a return value in a method declaration",
    scopeType: "type",
  },
  "type.return.lambda": {
    description: "Type of a return value in an anonymous function",
    scopeType: "type",
  },
  "type.field.class": {
    description: "Type of a field declaration in a class/struct",
    scopeType: "type",
  },
  "type.field.interface": {
    description: "Type of a field declaration in an interface",
    scopeType: "type",
  },
  "type.foreach": {
    description: "Type of a variable in a for-each loop",
    scopeType: "type",
  },
  "type.enum": {
    description: "An enum declaration",
    scopeType: "type",
  },
  "type.class": {
    description: "A class/struct declaration",
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
    description:
      "Type in a resource management statement, eg `with` / `use` / `using`",
    scopeType: "type",
  },
  "type.iteration.block": blockIter("type", "types"),
  "type.iteration.class": classIter("type", "types"),
  "type.iteration.interface": interfaceIter("type", "types"),
  "type.iteration.document": documentIter("type", "types"),

  "interior.element": {
    description: "The interior/children of an XML/HTML element",
    scopeType: { type: "interior" },
  },
  "interior.command": {
    description: "The body of a command, eg Talon spoken command",
    scopeType: { type: "interior" },
  },
  "interior.cell": {
    description: "The body of a code cell in Markdown",
    scopeType: { type: "interior" },
  },
  "interior.class": {
    description: "The body of a class/struct declaration",
    scopeType: { type: "interior" },
  },
  "interior.interface": {
    description: "The body of an interface declaration",
    scopeType: { type: "interior" },
  },
  "interior.enum": {
    description: "The body of an enum declaration",
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
    description: "The block body of an anonymous function",
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
    description: "The body of a case/default branch in a switch statement",
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
    description:
      "The body of a resource management statement, eg `with` / `use` / `using`",
    scopeType: { type: "interior" },
  },
  "interior.namespace": {
    description: "The body of a namespace declaration",
    scopeType: { type: "interior" },
  },
  "interior.static": {
    description: "The body of a static initialization block in a class",
    scopeType: { type: "interior" },
  },

  notebookCell: {
    description: "A cell in a notebook or a Markdown code block",
    scopeType: "notebookCell",
  },
  selector: {
    description: "A selector in a CSS rule set",
    scopeType: "selector",
  },
  unit: {
    description: "A unit in a CSS rule set",
    scopeType: "unit",
  },

  // Internal scope facets

  "textFragment.comment.line": {
    description: "Internally used text fragment consisting of a line comment",
    scopeType: "textFragment",
  },
  "textFragment.comment.block": {
    description: "Internally used text fragment consisting of a block comment",
    scopeType: "textFragment",
  },
  "textFragment.string.singleLine": {
    description:
      "Internally used text fragment consisting of a single-line string",
    scopeType: "textFragment",
  },
  "textFragment.string.multiLine": {
    description:
      "Internally used text fragment consisting of a multi-line string",
    scopeType: "textFragment",
  },
  "textFragment.element": {
    description:
      "Internally used text fragment consisting of an XML/HTML element interior",
    scopeType: "textFragment",
  },

  disqualifyDelimiter: {
    description:
      "Internally used to disqualify a token from being treated as a surrounding pair delimiter. This will usually be operators containing `>` or `<`, eg `<`, `<=`, `->`, etc.",
    scopeType: "disqualifyDelimiter",
  },
  pairDelimiter: {
    description:
      'Internally used to add additional language specific surrounding pair delimiters in addition to the text based definitions. eg `r"`.',
    scopeType: "pairDelimiter",
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
