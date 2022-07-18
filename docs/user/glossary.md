# Glossary

Here we provide a breakdown of several commonly used Cursorless terms.

## Action

The action being performed ona target, such as `"chuck"` (to delete), `"post"` (to place your cursor after a target), etc.

## Content range

The [range](#range) containing the content of a target. This is the range that will be used when selecting a target, copying a target, as the source of a `"bring"` command, etc.

## Domain

The [range](#range) within which a [scope](#scope) is valid/active. For example, the scope type `key` is valid anywhere inside its containing key/value pair, and `function name` is valid anywhere inside its containing function.

## Insertion delimiter

The delimiter to be inserted between targets when inserting a new target. For example, for list items, the insertion delimiter is `", "`.

## Leading / trailing delimiter range

The leading delimiter range, if it exists, contains the delimiter before a [target](#target); the trailing delimiter range contains the delimiter after a target. For example, for a token with a hat over it, the trailing delimiter will be any whitespace after the token. For a function argument, it will be the trailing comma and any whitespace after the comma.

## Position

A single position in a text document, consisting of `line` and `character` numbers/indices. A position is equivalent to a zero-length [range](#range) or zero-length [selection](#selection). Examples of positions include a cursor position, the start of your selection, the end of a function, etc.

## Range

A single range in a text document. Consists of `start` and `end` [positions](#position). Ranges have no direction, and `start` is always before, or, in the case of an empty range, equal to `end`. Examples of ranges include the range of a function, the whole document, a token with a hat over it, etc.

## Removal range

The range used when removing a [target](#target). This is generally the [content range](#content-range) plus one of the [leading or trailing delimiter ranges](#leading--trailing-delimiter-range), if they exist for the given target. For example, for a function call argument, the removal range will include a leading or trailing comma and whitespace, so that saying `"chuck arg"` or `"move arg"` will clean up the comma.

## Scope type

A predefined pattern/structure that can appear in a text document. This could be textual, like `line`, or `paragraph`, or syntactic like `function` and `class`. Each scope type represents a way to view a text document in a structured manner, for example as a sequence of lines, or a hierarchy of statements (ie an `if` statement containing series of variable declarations). Scope types allow us to say things like `"take funk"` to select the function containing your cursor.

## Scope

A concrete instance of a given [scope type](#scope-type). For example, a particular function, line, or token in a text document.

## Selection

A directed selection in a text document. A selection is a range with a direction. Contains `anchor` and `active` positions, where `active` is the position of the caret/cursor.

## Target

The thing being operated on by a Cursorless command, such as a function, a line, a function parameter, etc. For example, in the command `"chuck funk"`, the target will be the function containing your cursor.
