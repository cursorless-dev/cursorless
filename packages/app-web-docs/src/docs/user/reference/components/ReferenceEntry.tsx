import React from "react";
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
        ID: <code>{id}</code>
      </p>

      {entry.defaultSpokenForm != null && (
        <p>
          Default spoken form: <code>{entry.defaultSpokenForm}</code>
        </p>
      )}

      {entry.legacySpokenForms != null && (
        <p>
          Legacy spoken forms:{" "}
          {entry.legacySpokenForms.map((s, i) => (
            <>
              {i > 0 && ", "}
              <code key={s}>{s}</code>
            </>
          ))}
        </p>
      )}

      {entry.syntaxes.length > 0 && (
        <ul>
          {entry.syntaxes.map((syntax, index) => (
            <li key={index}>
              {formatPattern(syntax.pattern, entry.defaultSpokenForm)}:{" "}
              {formatPattern(syntax.description)}
            </li>
          ))}
        </ul>
      )}

      {entry.examples.length > 0 && (
        <p>
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
        </p>
      )}
    </>
  );
}

function formatPattern(
  pattern: string,
  defaultSpokenForm?: string,
): React.ReactNode[] {
  return pattern.split(/(<\w+>)/gu).map((part, index) => {
    if (part.startsWith("<") && part.endsWith(">")) {
      if (part === "<spokenForm>") {
        return defaultSpokenForm ?? "???";
      }
      return <code key={index}>{part}</code>;
    }
    return part;
  });
}
