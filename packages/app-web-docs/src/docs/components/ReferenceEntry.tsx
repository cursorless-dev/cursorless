import React, { Fragment } from "react";
import {
  actionReferences,
  modifierReferences,
  scopeReferences,
} from "@cursorless/lib-common";
import type { ReferenceEntry } from "@cursorless/lib-common";

export function ActionReference({ id }: { id: keyof typeof actionReferences }) {
  return <ReferenceEntryComponent id={id} entry={actionReferences[id]} />;
}

export function ModifierReference({
  id,
}: {
  id: keyof typeof modifierReferences;
}) {
  return <ReferenceEntryComponent id={id} entry={modifierReferences[id]} />;
}

export function ScopeReference({ id }: { id: keyof typeof scopeReferences }) {
  return <ReferenceEntryComponent id={id} entry={scopeReferences[id]} />;
}

function ReferenceEntryComponent({
  id,
  entry,
}: {
  id: string;
  entry: ReferenceEntry;
}) {
  return (
    <>
      {entry.description != null && <p>{entry.description}</p>}

      <p>
        Cursorless ID: <code>{id}</code>
      </p>

      {entry.defaultSpokenForm != null && (
        <p>
          Default spoken form: <code>{entry.defaultSpokenForm}</code>
          {entry.legacySpokenForms != null && (
            <div>
              Legacy spoken forms:{" "}
              {entry.legacySpokenForms.map((s, i) => (
                <Fragment key={s}>
                  {i > 0 && ", "}
                  <code>{s}</code>
                </Fragment>
              ))}
            </div>
          )}
          {entry.disabledByDefault && (
            <div>
              <strong>Disabled by default</strong>
            </div>
          )}
        </p>
      )}

      {entry.syntaxes.length > 0 && (
        <div>
          Syntax:
          <ul>
            {entry.syntaxes.map((syntax, index) => (
              <li key={index}>
                {formatPattern(syntax.pattern, entry.defaultSpokenForm)}:{" "}
                {formatPattern(syntax.description)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.examples.length > 0 && (
        <div>
          Examples:
          <ul>
            {entry.examples.map((example, index) => (
              <li key={index}>
                <code>
                  &quot;
                  {formatPattern(example.spokenForm, entry.defaultSpokenForm)}
                  &quot;
                </code>
                : {example.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function formatPattern(
  pattern: string,
  defaultSpokenForm?: string,
): React.ReactNode[] {
  return pattern.split(/(<[\w ]+>)/gu).map((part, index) => {
    if (part.startsWith("<") && part.endsWith(">")) {
      if (part === "<spokenForm>") {
        return defaultSpokenForm ?? "???";
      }
      return <code key={index}>{part}</code>;
    }
    return part;
  });
}
