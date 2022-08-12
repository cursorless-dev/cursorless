interface Props {
  text: string;
  href: string;
  isExternal: boolean;
}

export default function Button({ text, href, isExternal }: Props) {
  const className =
    'text-center tracking-wider border border-salmon-300 dark:border-salmon-300 bg-salmon-800 text-salmon-100 dark:bg-black rounded font-semibold text-[18px] w-[131px] h-[50px] flex items-center justify-center';

  return isExternal ? (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {text}
    </a>
  ) : (
    <a href={href} className={className}>
      {text}
    </a>
  );
}
