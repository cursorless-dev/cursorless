import type { ComponentChildren } from "preact";

type SmartLinkProps = {
  /**
   * The target of the link
   */
  to: string;

  children?: ComponentChildren;
  noFormatting?: boolean;
};

/**
 * Link component that will use `a` tag for external links and `Link` tag for
 * internal
 * @returns SmartLink component
 */
export default function SmartLink({
  to,
  children,
  noFormatting = false,
}: SmartLinkProps) {
  const className = noFormatting
    ? ""
    : "text-blue-500 hover:text-violet-700 dark:text-cyan-400 dark:hover:text-violet-200";

  return (
    <span className={className}>
      {to.startsWith("https://") ? (
        <a href={to} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <a href={to}>{children}</a>
      )}
    </span>
  );
}
