import {
  createPatternMatchers,
  argumentMatcher,
  leadingMatcher,
  conditionMatcher,
  trailingMatcher,
  cascadingMatcher,
} from '../util/nodeMatchers';
import { NodeMatcherAlternative, ScopeType } from '../typings/Types';

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  // treating classes = classlike
  class: ['class_definition', 'object_definition', 'trait_definition'],
  className: ['class_definition[name]', 'object_definition[name]', 'trait_definition[name]'],

  ifStatement: 'if_expression',

  string: ['interpolated_string_expression', 'string'],
  comment: 'comment',

  // lists basic definition is just a function call to a constructor, eg List(1,2,3,4)
  // MISSING: fancy list style: val foo = 1 :: (2 :: (3 :: Nil)) // List(1,2,3)
  list: 'call_expression',
  map: 'call_expression',

  // list.size(), does not count foo.size (field_expression), or foo size (postfix_expression)
  functionCall: 'call_expression',
  namedFunction: 'function_definition',
  // Do we want to consider partial functions as lambdas? eg
  //   foo.map(_ + 1)
  //   foo.map {_ + 1}
  //   foo.map {case x => x + 1}
  // are not under `lambda_expression`
  anonymousFunction: 'lambda_expression',

  argumentOrParameter: argumentMatcher('arguments', 'parameters', 'class_parameters', 'bindings'),

  name: ['*[name]', '*[pattern]'],
  functionName: 'function_definition[name]',

  // MISSING: function/class/trait generics
  type: leadingMatcher([
    'generic_type.type_identifier',
    'type_identifier',
    'type_parameters',
  ], [':']),
  value: leadingMatcher(['*[value]', '*[default_value]'], ['=']),
  condition: conditionMatcher('*[condition]'),

  // Pulled from the complete list that isn't implemented above

  // collectionItem: "???"
  // collectionKey: "???",

  // regularExpression: "???",

  // attribute: "???",
  // xmlElement: "???",
  // xmlStartTag: "???",
  // xmlEndTag: "???",
  // xmlBothTags: "???",
};

export default createPatternMatchers(nodeMatchers);
