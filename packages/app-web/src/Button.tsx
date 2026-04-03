interface Props {
  text: string;
  href: string;
  isExternal: boolean;
}

export function Button({ text, href, isExternal }: Props) {
  return (
    <a
      href={href}
      className="landing-page-btn text-center text-uppercase"
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
    >
      {text}
    </a>
  );
}
