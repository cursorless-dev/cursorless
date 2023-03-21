export interface UnknownValuesOptions {
  allowed: true;

  /**
   * An optional template to use when displaying the new option to the user. The
   * template must include `{}` as a substring, which will be replaced with the
   * user's input when displaying an option to add the unknown item.
   *
   * For example:
   *
   * "Add new value '{}' →"
   *
   * In this case, when the user types `foo`, the following option will be
   * displayed in the quickpick that will allow the user to select the unknown
   * value `foo`:
   *
   * "Add new value 'foo' →"
   */
  newValueTemplate?: string;
}

export interface QuickPickOptions {
  /**
   * An optional string that represents the title of the quick pick.
   */
  title?: string;

  /**
   * Indicates whether the quick pick should allow unknown values, and if so,
   * how to handle them.
   */
  unknownValues?: UnknownValuesOptions;
}
