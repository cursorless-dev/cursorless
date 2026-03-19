/**
 * The spoken form of a command, scope type, etc, that can be spoken
 * using a given set of custom or default spoken forms.
 */
export interface SpokenFormSuccess {
  type: "success";

  /**
   * The spoken forms for this entity. These could either be a user's custom
   * spoken forms, if we have access to them, or the default spoken forms, if we
   * don't, or if we're testing. There will often only be a single entry in this
   * array, but there can be multiple if the user has used the `|` syntax in their
   * spoken form csv's to define aliases for a single spoken form.
   */
  spokenForms: string[];
}

/**
 * An error spoken form, which indicates that the given entity (command, scope
 * type, etc) cannot be spoken, and the reason why.
 */
export interface SpokenFormError {
  type: "error";

  /**
   * The reason why the entity cannot be spoken.
   */
  reason: string;

  /**
   * If `true`, indicates that the entity wasn't found in the user's Talon spoken
   * forms json, and so they need to update their cursorless-talon to get the
   * given entity.
   */
  requiresTalonUpdate: boolean;

  /**
   * If `true`, indicates that the entity is only for internal experimentation,
   * and should not be exposed to users except within a targeted working group.
   */
  isPrivate: boolean;
}

/**
 * A spoken form, which can either be a success or an error.
 */
export type SpokenForm = SpokenFormSuccess | SpokenFormError;
