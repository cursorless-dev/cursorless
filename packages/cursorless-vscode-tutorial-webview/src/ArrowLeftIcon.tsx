import { type FunctionComponent } from "react";

interface Props {
  size?: number;
}

export const ArrowLeftIcon: FunctionComponent<Props> = ({ size = 16 }) => {
  // From https://github.com/microsoft/vscode-codicons/blob/eaa030691d720b9c5c0efa93d9be9e2e45d7262b/src/icons/arrow-left.svg
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
        d="M7 3.093l-5 5V8.8l5 5 .707-.707-4.146-4.147H14v-1H3.56L7.708 3.8 7 3.093z"
      />
    </svg>
  );
};
