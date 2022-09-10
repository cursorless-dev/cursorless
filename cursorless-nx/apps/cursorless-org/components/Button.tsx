interface Props {
  text: string;
  href: string;
  isExternal: boolean;
}

export default function Button({ text, href, isExternal }: Props) {
  const className =
    'text-center tracking-wider sm:tracking-[0.24em] sm:uppercase rounded-sm font-bold text-[18px] sm:text-[2.4em] w-[131px] h-[50px] sm:w-fit sm:h-fit flex items-center justify-center';

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
