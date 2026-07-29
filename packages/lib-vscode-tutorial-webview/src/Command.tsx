import type { JSX } from "preact";

interface Props {
  spokenForm: string;
}

export function Command({ spokenForm }: Props): JSX.Element {
  return <code>{`"${spokenForm}"`}</code>;
}
