import { type FunctionComponent } from "react";

interface Props {
  size?: number;
}

export const ArrowRightIcon: FunctionComponent<Props> = ({ size = 16 }) => {
  // From https://github.com/microsoft/vscode-codicons/blob/eaa030691d720b9c5c0efa93d9be9e2e45d7262b/src/icons/arrow-right.svg
  // FIXME: Use codicons the way it's intended; see https://github.com/microsoft/vscode-codicons
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9 13.887l5-5V8.18l-5-5-.707.707 4.146 4.147H2v1h10.44L8.292 13.18l.707.707z"
      />
    </svg>
  );
};
