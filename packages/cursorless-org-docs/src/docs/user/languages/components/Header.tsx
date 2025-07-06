import React from "react";

interface Props {
  className?: string;
  title?: string;
  children: string;
}

export function H2(props: Props) {
  return renderHeader(2, props);
}

export function H3(props: Props) {
  return renderHeader(3, props);
}

export function H4(props: Props) {
  return renderHeader(4, props);
}

function renderHeader(
  level: number,
  { className, title, children }: Props,
): React.JSX.Element {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  const href = children.toLowerCase().replaceAll(" ", "-");
  return (
    <Tag
      id={href}
      title={title}
      className={
        "scope-header anchorWithStickyNavbar_IncK" +
        (className ? " " + className : "")
      }
    >
      {children}
      <a className="hash-link" href={`#${href}`} />
    </Tag>
  );
}
