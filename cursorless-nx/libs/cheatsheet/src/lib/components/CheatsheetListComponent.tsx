import React, { useEffect, useState } from 'react';
import useIsHighlighted from '../hooks/useIsHighlighted';
import { CheatsheetSection } from '../CheatsheetInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import { useSettings } from './Settings/SettingsContext';

type Props = {
  section: CheatsheetSection;
};

export default function CheatsheetListComponent({
  section,
}: Props): JSX.Element {
  const isHighlighted = useIsHighlighted(section.id);
  const { modeConfig, ...settings } = useSettings();

  const collapseItemIds = modeConfig.defaultCommands[section.id];
  const collapsible = !!collapseItemIds;
  const collapseDefault = collapsible && modeConfig.collapseByDefault;

  const [collapsed, setCollapsed] = useState(collapseDefault);

  useEffect(
    () => setCollapsed(collapseDefault),
    [modeConfig.collapseByDefault]
  );

  const toggleCollapse = () => setCollapsed((current) => !current);

  const variations = section.items
    .filter((item) => !collapsed || collapseItemIds?.includes(item.id))
    .flatMap((item) => item.variations);

  variations.sort((form1, form2) => {
    switch (settings.order) {
      case 'alphabetical':
        return form1.spokenForm.localeCompare(form2.spokenForm);
      case 'functional':
        // TODO add more meaningful grouping to sort by
        return form1.description.localeCompare(form2.description);
    }
  });

  const borderClassName = isHighlighted
    ? 'border-violet-500 dark:border-violet-400'
    : 'border-stone-300 dark:border-stone-500';

  return (
    <div
      id={section.id}
      className={`border ${borderClassName} rounded-lg bg-stone-100 dark:bg-stone-700`}
    >
      <h2 className="text-xl text-center">
        <button
          className={clsx(
            'py-1 w-full flex justify-center items-center rounded-t-lg',
            collapsible && 'hover:bg-stone-50 dark:hover:bg-stone-600'
          )}
          onClick={toggleCollapse}
          disabled={!collapsible}
          title={collapsed ? 'Show more' : 'Show less'}
        >
          {section.name}
          {collapseItemIds != null && (
            <div
              className={clsx(
                'ml-2 text-stone-500 dark:text-stone-400 text-xs transform transition-transform',
                collapsed && 'rotate-180'
              )}
            >
              <FontAwesomeIcon icon={faChevronUp} />
            </div>
          )}
        </button>
      </h2>
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
          {variations.map((variation) => (
            <tr
              key={variation.spokenForm}
              className="odd:bg-stone-200 dark:odd:bg-stone-600"
            >
              <td className="px-1">
                <span className="text-stone-400">&#8220;</span>
                {variation.spokenForm}
                <span className="text-stone-400">&#8221;</span>
              </td>
              <td className="border-l border-stone-400 px-1">
                {variation.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
