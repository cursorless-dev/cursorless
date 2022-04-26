# Parse tree pattern matcher

We have a small domain-specific language that we use to define patterns to look for in tree-sitter parse trees. This DSL enables us to rapidly define new syntactic scope types and support new programming languages.

## Format

`GRAND_PARENT_TYPE.*.CHILD_TYPE[FIELD]!?`

| Syntax              | Description                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| TYPE                | Match node type<br/>`node.type`                                                                                                   |
| Dot operator(`.`)   | Type hierarchy between parent and child                                                                                           |
| Wildcard op(`*`)    | Match any type                                                                                                                    |
| Negation op(`~`)    | Match any type other than what is specified after `~`                                                                             |
| Important op(`!`)   | Use this node as result instead of parent.<br/>By default the leftmost/top node is used                                           |
| Optional op(`?`)    | Node is optional. Will match if available.                                                                                        |
| Field op(`[field]`) | Get child field node for resulting node.<br/>Only evaluated on the resulting node at the end.<br/>`node.childForFieldName(field)` |

## Multiple patterns

When using multiple patterns evaluation will be performed top to bottom and the first pattern too match will be used.

```js
["export_statement?.class_declaration", "export_statement.class"];
```
