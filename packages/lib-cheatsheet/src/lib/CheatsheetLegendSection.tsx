import type { JSX } from "preact";
import type { CheatsheetLegend } from "./cheatsheet.types";
import { formatCaptures } from "./utils/formatCaptures";
import { SmartLink } from "./utils/SmartLink";
import { useIsHighlighted } from "./utils/useIsHighlighted";

type Props = {
  data: CheatsheetLegend;
};

export function CheatsheetLegendSection({ data }: Props): JSX.Element {
  const isHighlighted = useIsHighlighted("legend");

  return (
    <section
      id="legend"
      className={`card bg-info${isHighlighted ? " highlighted" : ""}`}
    >
      <div className="card-header">
        <h2>Legend</h2>
      </div>
      <div className="card-body">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Term</th>
              <th>Definition</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ term, definition, link, linkName, id }) => (
              <tr key={id}>
                <td>{formatCaptures(`<${term}>`)}</td>
                <td>{renderDefinition(definition, link, linkName)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function renderDefinition(
  definition: string,
  link?: string,
  linkName?: string,
) {
  if (link == null) {
    return definition;
  }
  if (linkName == null) {
    return <SmartLink to={link}>{definition}</SmartLink>;
  }
  return (
    <>
      <SmartLink to={link}>{linkName}</SmartLink>
      &nbsp;
      {definition}
    </>
  );
}
