interface Props {
  text: string;
  href: string;
  isExternal: boolean;
}

export default function Button({ text, href, isExternal }: Props) {
  const className =
    'text-center tracking-wider md:tracking-[0.24em] border md:border-none border-salmon-300 bg-salmon-800 text-salmon-100 md:text-salmon-400 md:uppercase dark:bg-black rounded-sm font-semibold md:font-medium text-[18px] md:text-2xl w-[131px] h-[50px] md:w-fit md:h-fit flex items-center justify-center';

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
