import React from "react";

export function H2({ children }: { children: string }) {
  return <Header level={2}>{children}</Header>;
}

export function H3({ children }: { children: string }) {
  return <Header level={3}>{children}</Header>;
}

interface HeaderProps {
  level: number;
  children: string;
}

function Header({ level, children }: HeaderProps) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  const href = children.toLowerCase().replaceAll(" ", "-");
  return (
    <Tag id={href} className="scope-header anchorWithStickyNavbar_IncK">
      {children}
      <a className="hash-link" href={`#${href}`} />
    </Tag>
  );
}
