import "./Button.css";

interface Props {
  text: string;
  href: string;
  isExternal: boolean;
}

export function Button({ text, href, isExternal }: Props) {
  const extraProps = isExternal
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};

  return (
    <a
      href={href}
      className="landing-page-btn text-center text-uppercase"
      {...extraProps}
    >
      {text}
    </a>
  );
}
