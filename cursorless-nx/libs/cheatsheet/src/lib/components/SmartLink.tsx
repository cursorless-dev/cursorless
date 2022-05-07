import { Link } from "gatsby";
import * as React from "react";

type SmartLinkProps = {
  /**
   * The target of the link
   */
  to: string;
};

/**
 * Link component that will use `a` tag for external links and `Link` tag for
 * internal
 * @returns SmartLink component
 */
const SmartLink: React.FC<SmartLinkProps> = ({ to, children }) => (
  <span className="text-blue-500 hover:text-violet-700 dark:text-cyan-400 hover:dark:text-violet-200">
    {to.startsWith("https://") ? (
      <a href={to} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : to.startsWith("#") ? (
      <a href={to}>{children}</a>
    ) : (
      <Link to={to}>{children}</Link>
    )}
  </span>
);

export default SmartLink;
