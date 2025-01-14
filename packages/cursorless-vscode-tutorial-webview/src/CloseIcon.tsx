import { type FunctionComponent } from "react";

export const CloseIcon: FunctionComponent = () => {
  // From https://github.com/microsoft/vscode-codicons/blob/eaa030691d720b9c5c0efa93d9be9e2e45d7262b/src/icons/close.svg
  // FIXME: Use codicons the way it's intended; see https://github.com/microsoft/vscode-codicons
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
      />
    </svg>
  );
};
