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
        Internal ID: <code>{id}</code>
      </p>

      {entry.legacySpokenForms != null && (
        <p>Legacy spoken forms: {entry.legacySpokenForms.join(", ")}</p>
      )}

      {entry.syntaxes.length > 0 && (
        <ul>
          {entry.syntaxes.map((syntax, index) => (
            <li key={index}>
              <code>{syntax.pattern}</code>: {syntax.description}
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
                <code>{example.spokenForm}</code>: {example.description}
              </li>
            ))}
          </ul>
        </p>
      )}
    </>
  );
}
