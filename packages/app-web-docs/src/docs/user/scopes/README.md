# Scopes

## Text-based scopes

- [`"char"`](./character.mdx) - Single character within a token.
- [`"sub"`](./word.mdx) - Word-like component within a token, such as part of camelCase or snake_case.
- [`"token"`](./token.mdx) - Token such as a word, number, or operator.
- [`"identifier"`](./identifier.mdx) - Identifier-style sequence, such as camelCase, snake_case, or kebab-case.
- [`"sentence"`](./sentence.mdx) - Text ending at sentence punctuation or a paragraph boundary.
- [`"line"`](./line.mdx) - Line, without indentation.
- [`"full line"`](./fullLine.mdx) - Full line, including indentation.
- [`"block"`](./paragraph.mdx) - Paragraph, contiguous non-empty lines around the target.
- [`"short block"`](./boundedParagraph.mdx) - Paragraph bounded by surrounding pair delimiters.
- [`"file"`](./document.mdx) - Entire document.
- [`"paint"`](./nonWhitespaceSequence.mdx) - Non-whitespace sequence.
- [`"short paint"`](./boundedNonWhitespaceSequence.mdx) - Non-whitespace sequence bounded by surrounding pair delimiters.
- [`"link"`](./url.mdx) - URL / Web address.
- [`"<pair>"`](./surroundingPair.mdx) - Surrounding matching delimiter pair and its contents.
- [`"glyph <character>"`](./glyph.mdx) - Instance of single character `<character>`.

## Document hierarchy

- [`"part"`](./part.mdx) - Document part and its contents.
- [`"chapter"`](./chapter.mdx) - Document chapter and its contents.
- [`"subsection"`](./subSection.mdx) - Document subsection and its contents.
- [`"subsubsection"`](./subSubSection.mdx) - Document subsubsection and its contents.
- [`"paragraph"`](./namedParagraph.mdx) - Named document paragraph and its contents.
- [`"subparagraph"`](./subParagraph.mdx) - Document subparagraph and its contents.
- [`"environment"`](./environment.mdx) - Named document environment and its contents.

## Collections

- [`"list"`](./list.mdx) - List or array.
- [`"map"`](./map.mdx) - Map, object, or dictionary.
- [`"item"`](./collectionItem.mdx) - Entry in a list, map, object, or similar collection.
- [`"key"`](./collectionKey.mdx) - Key in a map, object, or dictionary.

## Functions and calls

- [`"arg"`](./argumentOrParameter.mdx) - Function parameter or function-call argument.
- [`"arg list"`](./argumentList.mdx) - Complete parameter or argument list.
- [`"lambda"`](./anonymousFunction.mdx) - Anonymous or lambda function.
- [`"funk"`](./namedFunction.mdx) - Named function declaration.
- [`"funk name"`](./functionName.mdx) - Name in a function declaration.
- [`"call"`](./functionCall.mdx) - Function, method, or constructor call.
- [`"callee"`](./functionCallee.mdx) - Expression invoked by a function call.

## Classes and objects

- [`"class"`](./class.mdx) - Class or struct declaration or definition.
- [`"class name"`](./className.mdx) - Name in a class or struct declaration.
- [`"instance"`](./instance.mdx) - Occurrence matching the current instance.
- [`"name"`](./name.mdx) - Name in a declaration, such as a variable or function name.
- [`"attribute"`](./attribute.mdx) - Attribute, such as one on an HTML element.
- [`"type"`](./type.mdx) - Type annotation or declaration.
- [`"value"`](./value.mdx) - Value in an assignment, collection entry, return statement, or similar construct.

## Statements and expressions

- [`"state"`](./statement.mdx) - Complete statement, such as a variable declaration or expression statement.
- [`"branch"`](./branch.mdx) - Branch of a control-flow construct, such as if, try, switch, or ternary.
- [`"if state"`](./ifStatement.mdx) - Complete if statement.
- [`"condition"`](./condition.mdx) - Condition of a conditional, loop, or similar construct.
- [`"comment"`](./comment.mdx) - Line or block comment.
- [`"command"`](./command.mdx) - Command, such as a Talon spoken command or shell command.
- [`"regex"`](./regularExpression.mdx) - Regular-expression literal.

## Markup and styles

- [`"element"`](./xmlElement.mdx) - Complete XML, HTML, or JSX element, or a LaTeX environment.
- [`"start tag"`](./xmlStartTag.mdx) - Opening XML, HTML, or JSX tag, or LaTeX `begin` command.
- [`"end tag"`](./xmlEndTag.mdx) - Closing XML, HTML, or JSX tag, or LaTeX `end` command.
- [`"tags"`](./xmlBothTags.mdx) - Opening and closing XML, HTML, or JSX tags, or LaTeX `begin` and `end` commands.
- [`"selector"`](./selector.mdx) - CSS selector.
- [`"unit"`](./unit.mdx) - Unit suffix in a measurement, such as `px` in `100px`.

## Sections

- [`"section"`](./section.mdx) - Heading and its content through the next heading of the same or higher level.
- [`"one section"`](./sectionLevelOne.mdx) - Level-one heading and its content. (**Disabled by default**)
- [`"two section"`](./sectionLevelTwo.mdx) - Level-two heading and its content. (**Disabled by default**)
- [`"three section"`](./sectionLevelThree.mdx) - Level-three heading and its content. (**Disabled by default**)
- [`"four section"`](./sectionLevelFour.mdx) - Level-four heading and its content. (**Disabled by default**)
- [`"five section"`](./sectionLevelFive.mdx) - Level-five heading and its content. (**Disabled by default**)
- [`"six section"`](./sectionLevelSix.mdx) - Level-six heading and its content. (**Disabled by default**)

## Notebook

- [`"cell"`](./notebookCell.mdx) - Notebook cell or Markdown fenced code block.
