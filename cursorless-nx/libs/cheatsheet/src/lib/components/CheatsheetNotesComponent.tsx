import * as React from 'react';
import SmartLink from './SmartLink';

export default function CheatsheetNotesComponent(): JSX.Element {
  return (
    <div
      id="notes"
      className="p-2 border border-violet-300 dark:border-violet-500 rounded-lg bg-violet-100 dark:bg-violet-900"
    >
      <h2 className="text-xl text-center mb-1 text-violet-900 dark:text-violet-100">
        Notes
      </h2>
      <ul>
        <li className="">
          See the{' '}
          <SmartLink to={'https://www.cursorless.org/docs/'}>
            full documentation
          </SmartLink>{' '}
          to learn more.
        </li>
      </ul>
    </div>
  );
}
