interface Props {
  text: string;
  href: string;
  isExternal: boolean;
}

export default function Button({ text, href, isExternal }: Props) {
  const className =
    'text-center uppercase text-2xl sm:text-[2.4em] tracking-[0.18em] hover:text-salmon-400';

  const extraProps = isExternal
    ? {
        target: '_blank',
        rel: 'noreferrer',
      }
    : {};

  return (
    <a href={href} className={className} {...extraProps}>
      {text}
    </a>
  );
}
