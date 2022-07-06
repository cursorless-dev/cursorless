import * as React from 'react';
import useIsHighlighted from '../hooks/useIsHighlighted';
import { CheatsheetSection } from '../CheatsheetInfo';

type Props = {
  section: CheatsheetSection;
};

export default function CheatsheetListComponent({
  section,
}: Props): JSX.Element {
  const isHighlighted = useIsHighlighted(section.id);

  const spokenForms = section.items.flatMap((item) =>
    item.spokenForms.map((spokenForm) => ({
      item,
      spokenForm,
    }))
  );

  spokenForms.sort((form1, form2) =>
    form1.spokenForm.spokenForm.localeCompare(form2.spokenForm.spokenForm)
  );

  const borderClassName = isHighlighted
    ? 'border-violet-500 dark:border-violet-400'
    : 'border-stone-300 dark:border-stone-500';

  return (
    <div
      id={section.id}
      className={`border ${borderClassName} rounded-lg bg-stone-100 dark:bg-stone-700`}
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
          {spokenForms.map(({ item, spokenForm }) => (
            <tr
              key={spokenForm.spokenForm}
              className="odd:bg-stone-200 dark:odd:bg-stone-600"
            >
              <td className="px-1">
                <span className="text-stone-400">&#8220;</span>
                {spokenForm.spokenForm}
                <span className="text-stone-400">&#8221;</span>
              </td>
              <td className="border-l border-stone-400 px-1">
                {spokenForm.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
