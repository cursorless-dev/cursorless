interface Props {
  text: string;
  href: string;
  isExternal: boolean;
}

export default function Button({ text, href, isExternal }: Props) {
  const className =
    'text-center border border-salmon-900 dark:border-salmon-300 bg-salmon-50 dark:bg-black rounded font-semibold text-[19px] w-[131px] h-[50px] flex items-center justify-center';

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
