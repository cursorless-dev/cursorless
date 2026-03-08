import * as React from "react";
import type { CheatsheetLegend } from "../cheatsheetLegend";
import useIsHighlighted from "../hooks/useIsHighlighted";
import { formatCaptures } from "./formatCaptures";
import SmartLink from "./SmartLink";

type Props = {
  data: CheatsheetLegend;
};

export default function CheatsheetLegendComponent({
  data,
}: Props): React.JSX.Element {
  const isHighlighted = useIsHighlighted("legend");

  const borderClassName = isHighlighted
    ? "border-violet-500 dark:border-violet-300"
    : "border-violet-300 dark:border-violet-500";

  return (
    <div
      id="legend"
      className={`border ${borderClassName} overflow-hidden rounded-lg bg-violet-100 dark:bg-violet-900`}
    >
      <h2 className="my-1 text-center text-xl text-violet-900 dark:text-violet-100">
        Legend
      </h2>
      <table className="w-full">
        <thead>
          <tr className="text bg-violet-300 dark:bg-violet-500">
            <th className="w-1/2 px-1 font-normal">Term</th>
            <th className="border-l border-violet-400 px-1 font-normal">
              Definition
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ term, definition, link, linkName, id }) => (
            <tr
              key={id}
              className="odd:bg-violet-200 dark:bg-violet-800 dark:odd:bg-violet-600"
            >
              <td className="px-1">{formatCaptures(`<${term}>`)}</td>
              <td className="border-l border-violet-400 px-1">
                {renderDefinition(definition, link, linkName)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
