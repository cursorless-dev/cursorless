import type { JSX } from "preact";
import type { CheatsheetSection, Variation } from "./cheatsheet.types";
import { formatCaptures } from "./utils/formatCaptures";
import { useIsHighlighted } from "./utils/useIsHighlighted";

type Props = {
  section: CheatsheetSection;
};

export function CheatsheetListSection({ section }: Props): JSX.Element {
  const isHighlighted = useIsHighlighted(section.id);

  const variations = section.items.flatMap((item) => item.variations);

  variations.sort((form1, form2) =>
    form1.spokenForm.localeCompare(form2.spokenForm),
  );

  return (
    <section
      id={section.id}
      className={`card${isHighlighted ? " highlighted" : ""}`}
    >
      <div className="card-header">
        <h2>{section.name}</h2>
      </div>
      <div className="card-body">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Spoken form</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {variations.map((variation) => (
              <CheatsheetListEntry
                key={variation.spokenForm}
                variation={variation}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type CheatsheetListEntryProps = {
  variation: Variation;
};

function CheatsheetListEntry({
  variation: { spokenForm, description },
}: CheatsheetListEntryProps): JSX.Element {
  return (
    <tr>
      <td>
        <span className="opening-quote">&#8220;</span>
        {formatCaptures(spokenForm)}
        <span className="closing-quote">&#8221;</span>
      </td>
      <td>{formatCaptures(description)}</td>
    </tr>
  );
}
