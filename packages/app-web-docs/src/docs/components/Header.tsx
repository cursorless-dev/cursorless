import React from "react";
import { uriEncodeHashId } from "@cursorless/lib-common";
import "./Header.css";

interface Props {
  className?: string;
  id?: string;
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

export function H5(props: Props) {
  return renderHeader(5, props);
}

function renderHeader(
  level: 2 | 3 | 4 | 5,
  { className, id, title, children }: Props,
): React.JSX.Element {
  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion
  const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5";
  const encodedId = uriEncodeHashId(id ?? children);
  return (
    <Tag
      id={encodedId}
      title={title}
      className={
        "anchor-with-sticky-navbar" + (className ? " " + className : "")
      }
    >
      {children}
      <a className="hash-link" href={`#${encodedId}`} />
    </Tag>
  );
}
