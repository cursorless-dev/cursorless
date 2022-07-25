import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export type IconButtonProps = {
  icon: IconProp;
} & React.HTMLAttributes<HTMLButtonElement>;

export const IconButton: React.FC<IconButtonProps> = (props) => {
  const { icon, className, ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      className={`${className} p-2 rounded-full aspect-square flex justify-center items-center hover:bg-black dark:hover:bg-white hover:bg-opacity-5 dark:hover:bg-opacity-10`}
    >
      <FontAwesomeIcon icon={props.icon} />
    </button>
  );
};
