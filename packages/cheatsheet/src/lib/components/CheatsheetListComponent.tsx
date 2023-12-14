import {
  CheatsheetSection,
  FeatureUsageStats,
  Variation,
} from "@cursorless/common";
import useIsHighlighted from "../hooks/useIsHighlighted";
import { formatCaptures } from "./formatCaptures";

type Props = {
  section: CheatsheetSection;
  featureUsageStats?: FeatureUsageStats;
};

export default function CheatsheetListComponent({
  section,
  featureUsageStats,
}: Props): JSX.Element {
  const isHighlighted = useIsHighlighted(section.id);

  // const variations = section.items.flatMap((item) => item.variations);

  // variations.sort((form1, form2) =>
  //   form1.spokenForm.localeCompare(form2.spokenForm),
  // );

  const borderClassName = isHighlighted
    ? "border-violet-500 dark:border-violet-400"
    : "border-stone-300 dark:border-stone-500";

  console.log(featureUsageStats);

  return (
    <div
      id={section.id}
      className={`border ${borderClassName} rounded-lg bg-stone-100 dark:bg-stone-700 overflow-hidden`}
    >
      <h2 className="text-xl text-center my-1">{section.name}</h2>
      <table className="w-full">
        <thead>
          <tr className="text bg-stone-300 dark:bg-stone-500">
            <th className="px-1 font-normal w-1/2">Spoken form</th>
            <th className="px-1 border-l border-stone-400 font-normal">
              Meaning
            </th>
          </tr>
        </thead>
        <tbody>
          {section.items.flatMap(({ variations, id }) => {
            // If single variation, just render it directly
            // If multiple - have a header with usage count, following by the variations
            return [
              // if there is more than 1 variation,{} add one top level tr element with sub-section info
              variations.map((variation) => {
                console.log(
                  `variation: ${variation.spokenForm} id: ${id} featureUsageStats: ${featureUsageStats?.featureUsageCount[id]}`,
                );
                return (
                  <CheatsheetListEntry
                    key={variation.spokenForm}
                    variation={variation}
                    // For now lets just repeat this all up :D
                    usageCount={featureUsageStats?.featureUsageCount[id]}
                  />
                );
              }),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}

type CheatsheetListEntryProps = {
  variation: Variation;
  usageCount?: number;
};

function CheatsheetListEntry({
  variation: { spokenForm, description },
  usageCount,
}: CheatsheetListEntryProps): JSX.Element {
  return (
    <tr className="odd:bg-stone-200 dark:odd:bg-stone-600">
      <td className="px-1">
        <div className="flex flex-row">
          <div>
            <span key="openingQuote" className="text-stone-400">
              &#8220;
            </span>
            {formatCaptures(spokenForm)}
            <span key="closingQuote" className="text-stone-400">
              &#8221;
            </span>
          </div>

          {/* Separator */}
          <div className="grow"></div>

          {/* Optional feature usage */}
          {usageCount && <span className="text-stone-400">({usageCount})</span>}
        </div>
      </td>
      <td className="border-l border-stone-400 px-1">
        {formatCaptures(description)}
      </td>
    </tr>
  );
}
