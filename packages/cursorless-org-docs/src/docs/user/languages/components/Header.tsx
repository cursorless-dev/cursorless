import React from "react";

export function H2({ children }: { children: string }) {
  return renderHeader(2, children);
}

export function H3({ children }: { children: string }) {
  return renderHeader(3, children);
}

function renderHeader(level: number, children: string): React.JSX.Element {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  const href = children.toLowerCase().replaceAll(" ", "-");
  return (
    <Tag id={href} className="scope-header anchorWithStickyNavbar_IncK">
      {children}
      <a className="hash-link" href={`#${href}`} />
    </Tag>
  );
}
