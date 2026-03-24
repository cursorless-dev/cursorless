import { useEffect } from "preact/hooks";

interface Props {
  children: string;
}

export function Title({ children }: Props) {
  useEffect(() => {
    if (children !== document.title) {
      document.title = children;
    }
  }, [children]);

  return null;
}
