/**
 * Controls whether a spoken form is exposed and enabled by default.
 *
 * - `"disabledByDefault"` indicates that the spoken form is available for
 *   customization but is not enabled by default. It appears in user CSV files
 *   with a `-` prefix.
 * - `"private"` indicates that the spoken form is intended only for internal
 *   experimentation or a targeted working group. Private spoken forms are
 *   also disabled by default.
 *
 * An omitted visibility indicates a public spoken form that is enabled by
 * default.
 */
export type SpokenFormVisibility = "disabledByDefault" | "private";
