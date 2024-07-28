import { type FunctionComponent } from "react";

interface CommandProps {
  spokenForm: string;
}

export const Command: FunctionComponent<CommandProps> = ({ spokenForm }) => {
  return <code>{`"${spokenForm}"`}</code>;
};
