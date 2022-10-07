import reactStringReplace from 'react-string-replace';
import SmartLink from './SmartLink';

export function formatCaptures(input: string) {
  return reactStringReplace(input, captureRegex, (match, i) => {
    const innerElement =
      match === 'ordinal' ? (
        <span>
          n<sup>th</sup>
        </span>
      ) : (
        match
      );

    return (
      <span className="inline-block px-[2px] rounded-md text-cyan-900 dark:text-inherit bg-cyan-400 dark:bg-cyan-600">
        <SmartLink key={i} to="#legend" noFormatting={true}>
          {'{'}
          {innerElement}
          {'}'}
        </SmartLink>
      </span>
    );
  });
}
const captureRegex = /<([^>]+)>/g;
