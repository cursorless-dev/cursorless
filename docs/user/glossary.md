# Glossary

This is a summary of some of the more used concept when using Cursorless.

## Position

A single position in a text. Contains `line` and `character` numbers/indices.

## Range

A single range in a text. Contains `start` and `end` positions. Ranges have no direction and `start` is always before or (in the case of an empty range) equal to `end`.

## Selection

A single selection in a text. Is derived from range, but adds directional information. Contains `anchor` and `active` positions where `active` is the position of the caret/cursor.

## Content range

The range containing the content of a target. This is the range that will be used when selecting a target.

## Leading delimiter range

The range containing delimiters before the target. eg for a list item the leading delimiter range would be the comma and whitespaces between this item and the previous one.

## Trailing delimiter range

Same as `leading delimiter range`, but after the target.

## Removal range

The range used when removing a target. This is generally the content range plus one of the leading/trailing delimiter ranges.

## Domain range

The range in within a scope type definition is valid/active. eg the scope type `key` is valid anywhere inside the domain `key/value pair` and `function name` is valid anywhere inside the domain `function`.

## Insertion delimiter

The textual delimiter to be inserted between targets when inserting. eg `", "` between list items.

## Scope type

A predefined pattern/structure in the text. This could be textual like `line` and `paragraph` or syntactic like `function` and `class`.
