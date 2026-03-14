interface Props {
  text: string;
  href: string;
  isExternal: boolean;
}

export default function Button({ text, href, isExternal }: Props) {
  const extraProps = isExternal
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};

  return (
    <a
      href={href}
      className="hover:text-salmon-400 text-center text-2xl tracking-[0.18em] uppercase sm:text-[2.4em]"
      {...extraProps}
    >
      {text}
    </a>
  );
}
