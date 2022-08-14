interface Props {
  text: string;
  href: string;
  isExternal: boolean;
}

export default function Button({ text, href, isExternal }: Props) {
  const className =
    'text-center tracking-wider sm:tracking-[0.24em] border sm:border-none border-salmon-300 bg-salmon-800 text-salmon-100 sm:text-salmon-400 sm:uppercase dark:bg-black rounded-sm font-semibold sm:font-medium text-[18px] sm:text-2xl w-[131px] h-[50px] sm:w-fit sm:h-fit flex items-center justify-center';

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
