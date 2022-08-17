import * as React from 'react';
import { CheatsheetLegend } from '../cheatsheetLegend';
import useIsHighlighted from '../hooks/useIsHighlighted';
import SmartLink from './SmartLink';

type Props = {
  data: CheatsheetLegend;
};

export default function CheatsheetLegendComponent({
  data,
}: Props): JSX.Element {
  const isHighlighted = useIsHighlighted('legend');

  const borderClassName = isHighlighted
    ? 'border-violet-500 dark:border-violet-300'
    : 'border-violet-300 dark:border-violet-500';

  return (
    <div
      id="legend"
      className={`border ${borderClassName} rounded-lg bg-violet-100 dark:bg-violet-900`}
    >
      <h2 className="text-xl text-center my-1 text-violet-900 dark:text-violet-100">
        Legend
      </h2>
      <table className="w-full">
        <thead>
          <tr className="text bg-violet-300 dark:bg-violet-500">
            <th className="px-1 font-normal w-1/2">Term</th>
            <th className="px-1 border-l border-violet-400 font-normal">
              Definition
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ term, definition, link, id }) => (
            <tr
              key={id}
              className="odd:bg-violet-200 odd:dark:bg-violet-600 dark:bg-violet-800"
            >
              <td className="px-1">{`<${term}>`}</td>
              <td className="border-l border-violet-400 px-1">
                {link != null ? (
                  <SmartLink to={link}>{definition}</SmartLink>
                ) : (
                  definition
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
