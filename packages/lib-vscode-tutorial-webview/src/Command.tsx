import type { FunctionComponent } from "preact";

interface CommandProps {
  spokenForm: string;
}

export const Command: FunctionComponent<CommandProps> = ({ spokenForm }) => {
  return <code>{`"${spokenForm}"`}</code>;
};
