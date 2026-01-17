import { uriEncodeHashId } from "@cursorless/common";
import React from "react";
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
  level: number,
  { className, id, title, children }: Props,
): React.JSX.Element {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
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
