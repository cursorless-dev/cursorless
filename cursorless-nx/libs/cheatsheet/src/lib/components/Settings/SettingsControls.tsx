import clsx from 'clsx';
import React from 'react';
import { useSettings } from './SettingsContext';
import { MODES, ORDERS, SettingOption, THEMES } from './settings';
import { IconButton } from '../IconButton';
import { faClose } from '@fortawesome/free-solid-svg-icons';

type RadioOptionProps = {
  name: string;
  option: SettingOption;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const RadioOption: React.FC<RadioOptionProps> = (props) => {
  return (
    <label className="block mb-1" key={props.option.id}>
      <input
        type="radio"
        name={props.name}
        checked={props.checked}
        onChange={props.onChange}
        // TODO
        disabled={props.option.id === 'functional'}
      />
      <span className="pl-2">{props.option.name}</span>
      {props.option.description && (
        <p className="ml-6 text-stone-600 dark:text-stone-300 text-sm">
          {props.option.description}
        </p>
      )}
    </label>
  );
};

export type SettingsControlsProps = {
  open: boolean;
  onClose: React.MouseEventHandler<HTMLButtonElement>;
};

export const SettingsControls: React.FC<SettingsControlsProps> = (props) => {
  const settings = useSettings();

  return (
    <div
      className={clsx(
        'mx-2 md:mx-3 xl:mx-4 transition-all overflow-hidden max-h-0',
        props.open && '!max-h-screen'
      )}
    >
      <div className="relative mt-3 p-5 border border-stone-300 dark:border-stone-500 bg-stone-100 dark:bg-stone-700 rounded-lg h-full">
        <IconButton
          className="absolute right-3 -mt-2"
          icon={faClose}
          title="Close Settings"
          onClick={props.onClose}
        />
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1">
            <h3 className="font-medium mb-1">Mode</h3>
            {MODES.map((option) => (
              <RadioOption
                name="mode"
                key={option.id}
                option={option}
                checked={option.id === settings.mode}
                onChange={() => settings.setMode(option.id)}
              />
            ))}
          </div>

          <div className="flex-1">
            <h3 className="font-medium mb-1">Command order</h3>
            {ORDERS.map((option) => (
              <RadioOption
                name="order"
                key={option.id}
                option={option}
                checked={option.id === settings.order}
                onChange={() => settings.setOrder(option.id)}
              />
            ))}
          </div>

          <div className="flex-1">
            <h3 className="font-medium mb-1">Theme</h3>
            {THEMES.map((option) => (
              <RadioOption
                name="theme"
                key={option.id}
                option={option}
                checked={option.id === settings.theme}
                onChange={() => settings.setTheme(option.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
