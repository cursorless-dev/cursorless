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
export function SmartLink({
  to,
  children,
  noFormatting = false,
}: SmartLinkProps) {
  const className = noFormatting ? undefined : "cheatsheet-link";

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
