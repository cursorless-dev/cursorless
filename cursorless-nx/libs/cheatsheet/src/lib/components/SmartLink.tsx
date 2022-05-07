import * as React from 'react';

type SmartLinkProps = {
  /**
   * The target of the link
   */
  to: string;

  children?: React.ReactNode;
};

/**
 * Link component that will use `a` tag for external links and `Link` tag for
 * internal
 * @returns SmartLink component
 */
const SmartLink: React.FC<SmartLinkProps> = ({ to, children }) => (
  <span className="text-blue-500 hover:text-violet-700 dark:text-cyan-400 hover:dark:text-violet-200">
    {to.startsWith('https://') ? (
      <a href={to} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <a href={to}>{children}</a>
    )}
  </span>
);

export default SmartLink;
