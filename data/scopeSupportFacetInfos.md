### anonymousFunction

- `anonymousFunction` An anonymous function, eg a lambda function, an arrow function, etc.

### argumentOrParameter

- `argument.actual.constructor.iteration` Iteration scope for arguments in a constructor call: the argument list. The domain should be the entire constructor call..
- `argument.actual.constructor.multiLine` A multi line argument in a constructor call. Insertion delimiter should include new line.
- `argument.actual.constructor.singleLine` A single line argument in a constructor call
- `argument.actual.iteration` Iteration scope for arguments in a function call: the argument list. The domain should be the entire function call.
- `argument.actual.method.iteration` Iteration scope for arguments in a method call: the argument list. The domain should be the entire method call..
- `argument.actual.method.multiLine` A multi line argument in a method call. Insertion delimiter should include new line.
- `argument.actual.method.singleLine` A single line argument in a method call
- `argument.actual.multiLine` A multiline argument in a function call. Insertion delimiter should include new line.
- `argument.actual.singleLine` A single line argument in a function call
- `argument.catch` A parameter in a catch clause
- `argument.formal.constructor.iteration` Iteration scope for formal parameters in a constructor declaration: the parameter list. The domain should be the entire constructor.
- `argument.formal.constructor.multiLine` A multi line parameter in a constructor declaration. Insertion delimiter should include new line.
- `argument.formal.constructor.singleLine` A single line parameter in a constructor declaration
- `argument.formal.iteration` Iteration scope for formal parameters in a function declaration: the parameters list. The domain should be the entire function.
- `argument.formal.lambda.iteration` Iteration scope for formal parameters in a lambda declaration: the parameter list. The domain should be the entire lambda.
- `argument.formal.lambda.multiLine` A multi line parameter in a lambda declaration. Insertion delimiter should include new line.
- `argument.formal.lambda.singleLine` A single line parameter in a lambda declaration
- `argument.formal.method.iteration` Iteration scope for formal parameters in a method declaration: the parameter list. The domain should be the entire method.
- `argument.formal.method.multiLine` A multi line parameter in a class method declaration. Insertion delimiter should include new line.
- `argument.formal.method.singleLine` A single line parameter in a class method declaration
- `argument.formal.multiLine` A multi line parameter in a function declaration. Insertion delimiter should include new line.
- `argument.formal.singleLine` A single line parameter in a function declaration

### argumentList

- `argumentList.actual.constructor.empty` An empty list of arguments in a constructor call. Insertion delimiter should be empty.
- `argumentList.actual.constructor.multiLine` A multi line list of arguments in a constructor call. Insertion delimiter should include new line.
- `argumentList.actual.constructor.singleLine` A single line list of arguments in a constructor call
- `argumentList.actual.empty` An empty list of arguments in a function call. Insertion delimiter should be empty.
- `argumentList.actual.method.empty` An empty list of arguments in a method call. Insertion delimiter should be empty.
- `argumentList.actual.method.multiLine` A multi line list of arguments in a method call. Insertion delimiter should include new line.
- `argumentList.actual.method.singleLine` A single line list of arguments in a method call
- `argumentList.actual.multiLine` A multi line list of arguments in a function call. Insertion delimiter should include new line.
- `argumentList.actual.singleLine` A single line list of arguments in a function call
- `argumentList.formal.constructor.empty` An empty list of parameters in a constructor declaration. Insertion delimiter should be empty.
- `argumentList.formal.constructor.multiLine` A multi line list of parameters in a constructor declaration. Insertion delimiter should include new line.
- `argumentList.formal.constructor.singleLine` A single line list of parameters in a constructor declaration
- `argumentList.formal.empty` An empty list of parameters in a function declaration. Insertion delimiter should be empty.
- `argumentList.formal.lambda.empty` An empty list of parameters in a lambda declaration. Insertion delimiter should be empty.
- `argumentList.formal.lambda.multiLine` A multi line list of parameters in a lambda declaration. Insertion delimiter should include new line.
- `argumentList.formal.lambda.singleLine` A single line list of parameters in a lambda declaration
- `argumentList.formal.method.empty` An empty list of parameters in a class method declaration. Insertion delimiter should be empty.
- `argumentList.formal.method.multiLine` A multi line list of parameters in a class method declaration. Insertion delimiter should include new line.
- `argumentList.formal.method.singleLine` A single line list of parameters in a class method declaration
- `argumentList.formal.multiLine` A multi line list of parameters in a function declaration. Insertion delimiter should include new line.
- `argumentList.formal.singleLine` A single line list of parameters in a function declaration

### attribute

- `attribute` A attribute, eg of a html element or a C++ attribute

### boundedNonWhitespaceSequence

- `boundedNonWhitespaceSequence` A sequence of non-whitespace characters bounded by matching pair
- `boundedNonWhitespaceSequence.iteration` Iteration scope for bounded non-whitespace sequence

### boundedParagraph

- `boundedParagraph` A single paragraph(contiguous block of lines) in the document bounded by matching pair
- `boundedParagraph.iteration` Iteration scope for bounded paragraph

### branch

- `branch.if` An if branch
- `branch.if.elif.else` An if-elif-else branch. The removal range for the if branch should include the trailing `else` keyword.
- `branch.if.else` An if-else branch
- `branch.if.iteration` Iteration scope for if/elif/else branches: the if-else statement.
- `branch.loop` A for / while loop branch. For most languages this is not supported, but eg in Python you can have an else branch for a loop.
- `branch.loop.iteration` Iteration scope for loop branches: the loop statement.
- `branch.switchCase` A case/default branch in a switch statement
- `branch.switchCase.iteration` Iteration scope for switch branches: the switch statement body.
- `branch.ternary` A branch in a ternary expression
- `branch.ternary.iteration` Iteration scope for ternary expression branches: the ternary expression.
- `branch.try` A try/catch/finally branch
- `branch.try.iteration` Iteration scope for try/catch/finally branches: the try-catch statement.

### character

- `character` A single character in the document

### class

- `class` A class in an object-oriented language
- `class.iteration.block` Iteration scope for classes: statement blocks (body of functions/if-statements/for-loops/etc).
- `class.iteration.document` Iteration scope for classes: the entire document including leading and trailing empty lines.

### collectionItem

- `collectionItem.textual` A text based collection item
- `collectionItem.textual.iteration` Iteration scope for text based collection items
- `collectionItem.unenclosed.iteration` Iteration scope for items in a comma-separated list without enclosing delimiters
- `collectionItem.unenclosed.multiLine` An item in a comma-separated multi line list without enclosing delimiters. This could be multi-variable declarations, import statements, etc. Insertion delimiter should include new line.
- `collectionItem.unenclosed.singleLine` An item in a comma-separated single line list without enclosing delimiters. This could be multi-variable declarations, import statements, etc.

### command

- `command` A command, for example Talon spoken command or bash

### comment

- `comment.block` A block comment
- `comment.line` A line comment

### condition

- `condition.doWhile` A condition in a do while loop
- `condition.for` A condition in a for loop
- `condition.if` A condition in an if statement
- `condition.switchCase` A condition in a switch statement
- `condition.switchCase.iteration` Iteration scope for conditions in a switch statement: the switch statement body.
- `condition.ternary` A condition in a ternary expression
- `condition.while` A condition in a while loop

### disqualifyDelimiter

- `disqualifyDelimiter` Used to disqualify a token from being treated as a surrounding pair delimiter. This will usually be operators containing `>` or `<`, eg `<`, `<=`, `->`, etc

### document

- `document` The entire document

### xmlElement

- `element` A xml/html element. Also used for LaTeX environments

### xmlEndTag

- `endTag` The end tag of a xml element

### environment

- `environment` An environment, eg in LaTeX

### private.fieldAccess

- `fieldAccess` A field access

### functionCall

- `functionCall` A function call
- `functionCall.chain` A chain of function calls, eg `foo().bar()`
- `functionCall.constructor` A constructor call
- `functionCall.method` A method call

### functionCallee

- `functionCallee` The function being called in a function call
- `functionCallee.chain` The function being called in a chain of function calls, including parent objects.
- `functionCallee.constructor` The class being constructed in a class instantiation, including the `new` keyword.
- `functionCallee.method` The function being called in a method call, including parent objects.

### identifier

- `identifier` A single alphanumeric identifier in the document

### ifStatement

- `ifStatement` An if statement

### interior

- `interior.cell` The body of a code cell in markdown
- `interior.class` The body of a class
- `interior.command` The body of a command, eg Talon spoken command
- `interior.constructor` The body of a constructor declaration
- `interior.doWhile` The body of a do-while loop
- `interior.element` The interior/children of a XML element
- `interior.enum` The body of an enum
- `interior.for` The body of a for loop
- `interior.foreach` The body of a for-each loop
- `interior.function` The body of a function declaration
- `interior.if` The body of an if/elif/else branch
- `interior.interface` The body of a interface
- `interior.lambda` The block body of a lambda/anonymous function
- `interior.method` The body of a method declaration
- `interior.namespace` the body of a namespace statement
- `interior.resource` the body of a 'with' / 'use' / 'using' statement
- `interior.static` the body of a static statement
- `interior.surroundingPair` The interior scope of a surrounding pair
- `interior.switch` The body of a switch statement
- `interior.switchCase` The body of a switch case branch
- `interior.ternary` The body of a ternary condition/branch
- `interior.try` The body of a try/catch/finally branch
- `interior.while` The body of a while loop

### collectionKey

- `key.attribute` Key (LHS) of an attribute eg in a xml element
- `key.mapPair` Key (LHS) of a key-value pair of a map
- `key.mapPair.iteration` Iteration scope for keys of key-value pairs in a map: should be between the braces.

### line

- `line` A single line in the document

### list

- `list` A list/array

### map

- `map` A map/dictionary

### name

- `name.argument.actual` Name of a (keyword) argument in a function call
- `name.argument.actual.iteration` Iteration scope for names of (keyword) arguments in a function call: the argument list..
- `name.argument.catch` Name of a parameter in a catch clause
- `name.argument.formal` Name of a parameter in a function declaration
- `name.argument.formal.constructor` The name of a parameter in a constructor declaration
- `name.argument.formal.constructor.iteration` Iteration scope for names of formal parameters in a constructor declaration: the parameters list. The domain should be the entire constructor.
- `name.argument.formal.iteration` Iteration scope for names of formal parameters in a function declaration: the parameters list. The domain should be the entire function.
- `name.argument.formal.method` Name of a parameter in a class method declaration
- `name.argument.formal.method.iteration` Iteration scope for names of formal parameters in a method declaration: the parameters list. The domain should be the entire method.
- `name.assignment` Name (LHS) of an assignment
- `name.assignment.pattern` LHS of an assignment with pattern destructuring
- `name.class` Name of a class
- `name.command` LHS of a command, eg Talon spoken command or bash
- `name.constructor` Name of a constructor
- `name.enum` Name of an enum
- `name.field.class` Name (LHS) of a field in a class
- `name.field.enum` Name (LHS) of a field in an enum
- `name.field.interface` Name (LHS) of a field in an interface
- `name.foreach` Iteration variable name in a for each loop
- `name.function` Name of a function
- `name.interface` Name of a interface
- `name.iteration.block` Iteration scope for names: statement blocks (body of functions/if-statements/for-loops/etc).
- `name.iteration.class` Iteration scope for names: class bodies.
- `name.iteration.document` Iteration scope for names: the entire document including leading and trailing empty lines.
- `name.iteration.enum` Iteration scope for names: enum bodies.
- `name.iteration.interface` Iteration scope for names: interface bodies.
- `name.method` Name of a class method
- `name.namespace` Name of a namespace
- `name.resource` Name in a 'with' / 'use' / 'using' statement
- `name.resource.iteration` Iteration scope for names in a 'with' / 'use' / 'using' statement: the resource list. The domain should be the entire statement.
- `name.variable` Name (LHS) of a variable declaration
- `name.variable.pattern` Name (LHS) of a variable declaration with pattern destructuring

### namedFunction

- `namedFunction` A named function declaration
- `namedFunction.constructor` A constructor declaration in a class
- `namedFunction.iteration.class` Iteration scope for named functions: class bodies.
- `namedFunction.iteration.document` Iteration scope for named functions: the entire document including leading and trailing empty lines.
- `namedFunction.method` A named method declaration in a class

### nonWhitespaceSequence

- `nonWhitespaceSequence` A sequence of non-whitespace characters

### notebookCell

- `notebookCell` A cell in a notebook or a markdown code block

### pairDelimiter

- `pairDelimiter` A pair delimiter, eg parentheses, brackets, braces, quotes, etc

### paragraph

- `paragraph` A single paragraph(contiguous block of lines) in the document

### regularExpression

- `regularExpression` A regular expression

### section

- `section` A document section
- `section.iteration.document` Iteration scope for sections: the entire document including leading and trailing empty lines.
- `section.iteration.parent` Iteration scope for sections: the parent section.

### selector

- `selector` A selector in a css rule set

### sentence

- `sentence` A single sentence in the document

### xmlStartTag

- `startTag` The start tag of a xml element

### statement

- `statement.assignment` An assignment statement
- `statement.break` A break statement
- `statement.class` A class declaration
- `statement.command` A command statement, eg Talon spoken command or bash
- `statement.constructor` A constructor declaration
- `statement.continue` A continue statement
- `statement.doWhile` A do-while loop statement
- `statement.enum` An enum declaration
- `statement.field.class` A field declaration in a class
- `statement.field.interface` A field declaration in a interface
- `statement.for` A for loop statement
- `statement.foreach` A for-each loop statement
- `statement.function` A named function declaration
- `statement.if` A if/elif/else statement
- `statement.interface` An interface declaration
- `statement.iteration.block` Iteration scope for statements: statement blocks (body of functions/if-statements/for-loops/etc).
- `statement.iteration.class` Iteration scope for statements: class bodies.
- `statement.iteration.document` Iteration scope for statements: the entire document including leading and trailing empty lines.
- `statement.iteration.interface` Iteration scope for statements: interface bodies.
- `statement.method` A method declaration
- `statement.misc` A miscellaneous statement
- `statement.namespace` A namespace declaration
- `statement.resource` A 'with' / 'use' / 'using' statement
- `statement.return` A return statement
- `statement.static` A static statement
- `statement.switch` A switch statement
- `statement.try` A try/catch/finally statement
- `statement.variable` A variable declaration
- `statement.while` A while loop statement
- `statement.yield` A yield statement

### string

- `string.multiLine` A multi-line string
- `string.singleLine` A single-line string

### surroundingPair

- `surroundingPair` A delimiter pair, such as parentheses or quotes
- `surroundingPair.iteration` The iteration scope for delimiter pairs

### xmlBothTags

- `tags` Both tags in a xml element

### textFragment

- `textFragment.comment.block` Text fragment consisting of a block comment
- `textFragment.comment.line` Text fragment consisting of a line comment
- `textFragment.element` Text fragment consisting of a xml element interior
- `textFragment.string.multiLine` Text fragment consisting of a multi-line string
- `textFragment.string.singleLine` Text fragment consisting of a single-line string

### token

- `token` A single token in the document

### type

- `type.alias` A type alias declaration
- `type.argument.catch` Type of parameter in a catch clause
- `type.argument.formal` Type of formal parameter in a function declaration
- `type.argument.formal.constructor` Type of formal parameter in a constructor declaration
- `type.argument.formal.constructor.iteration` Iteration scope for types of formal parameters in a constructor declaration: the parameters list. The domain should be the entire constructor.
- `type.argument.formal.iteration` Iteration scope for types of formal parameters in a function declaration: the parameters list. The domain should be the entire function.
- `type.argument.formal.method` Type of formal parameter in a class method declaration
- `type.argument.formal.method.iteration` Iteration scope for types of formal parameters in a method declaration: the parameters list. The domain should be the entire method.
- `type.cast` A type cast
- `type.class` A class declaration
- `type.enum` An enum declaration
- `type.field.class` Type of field in a class
- `type.field.interface` Type of field in a interface
- `type.foreach` Type of variable in a for each loop
- `type.interface` An interface declaration
- `type.iteration.block` Iteration scope for types: statement blocks (body of functions/if-statements/for-loops/etc).
- `type.iteration.class` Iteration scope for types: class bodies.
- `type.iteration.document` Iteration scope for types: the entire document including leading and trailing empty lines.
- `type.iteration.interface` Iteration scope for types: interface bodies.
- `type.resource` Type in a 'with' / 'use' / 'using' statement
- `type.resource.iteration` Iteration scope for types in a 'with' / 'use' / 'using' statement: the resource list. The domain should be the entire statement.
- `type.return` Type of return value in a function declaration
- `type.typeArgument` Type argument to a generic / parametrized type
- `type.typeArgument.iteration` Iteration scope for type arguments to a generic / parametrized type: the type argument list.
- `type.variable` Type of variable in a variable declaration

### unit

- `unit` A unit in a css rule set

### url

- `url` A url

### value

- `value.argument.actual` The value of a (keyword) argument in a function call
- `value.argument.actual.iteration` Iteration scope for values of (keyword) arguments in a function call: the arguments list..
- `value.argument.formal` The value of a (keyword) argument in a function declaration
- `value.argument.formal.constructor` The value of a parameter in a constructor declaration
- `value.argument.formal.constructor.iteration` Iteration scope for values of formal parameters in a constructor declaration: the parameters list. The domain should be the entire constructor.
- `value.argument.formal.iteration` Iteration scope for values of formal parameters in a function declaration: the parameters list. The domain should be the entire function.
- `value.argument.formal.method` The value of a parameter in a class method declaration
- `value.argument.formal.method.iteration` Iteration scope for values of formal parameters in a method declaration: the parameters list. The domain should be the entire method.
- `value.assignment` Value (RHS) of an assignment
- `value.attribute` Value (RHS) of an attribute eg in a xml element
- `value.command` Value (RHS) of an command, eg Talon spoken command
- `value.field.class` Value (RHS) of a field in a class
- `value.field.enum` Value (RHS) of a field in an enum
- `value.foreach` Iterable in a for each loop
- `value.iteration.block` Iteration scope for values: statement blocks (body of functions/if-statements/for-loops/etc).
- `value.iteration.class` Iteration scope for values: class bodies.
- `value.iteration.document` Iteration scope for values: the entire document including leading and trailing empty lines.
- `value.iteration.enum` Iteration scope for values: enum bodies.
- `value.mapPair` Value (RHS) of a key-value pair in a map
- `value.mapPair.iteration` Iteration scope for values of key-value pairs in a map: should be between the braces.
- `value.resource` Value of a 'with' / 'use' / 'using' statement
- `value.resource.iteration` Iteration scope for values in a 'with' / 'use' / 'using' statement: the resource list. The domain should be the entire statement.
- `value.return` Return value of a function
- `value.return.lambda` Implicit return value from a lambda
- `value.switch` The value / subject of a switch statement
- `value.typeAlias` Value of a type alias declaration
- `value.variable` Value (RHS) of a variable declaration
- `value.variable.pattern` Value (RHS) of a variable declaration with pattern destructuring
- `value.yield` Value of a yield statement

### word

- `word` A single word in a token
