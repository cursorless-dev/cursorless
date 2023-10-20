import {
  SpokenFormMapEntry,
  SpokenFormMapKeyTypes,
  SpokenFormType,
} from "../spokenForms/SpokenFormMap";

/**
 * A component of a spoken form used internally during spoken form generation.
 * This is a recursive type, so it can contain other spoken form components.
 * During the final step of spoken form generation, it is flattened.
 *
 * FIXME: In the future, we want to replace `string` with something like
 * `LiteralSpokenFormComponent` and `SpokenFormComponent[]` with something like
 * `SequenceSpokenFormComponent`. We'd also like to avoid throwing
 * `NoSpokenFormError` and instead return a `SpokenFormComponent` that
 * represents an error. This would allow us to localize errors and still render
 * the remainder of the spoken form component.
 */
export type SpokenFormComponent =
  | CustomizableSpokenFormComponent
  | string
  | SpokenFormComponent[];

export interface CustomizableSpokenFormComponentForType<T extends SpokenFormType> {
  type: "customizable";
  spokenForms: SpokenFormMapEntry;
  spokenFormType: T;
  id: SpokenFormMapKeyTypes[T];
}

/**
 * A customizable spoken form component. This is a spoken form component that
 * can be customized by the user. It is used internally during spoken form
 * generation.
 */
export type CustomizableSpokenFormComponent = {
  [K in SpokenFormType]: CustomizableSpokenFormComponentForType<K>;
}[SpokenFormType];
