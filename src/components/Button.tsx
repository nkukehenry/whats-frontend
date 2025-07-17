import React from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'bg-green-600 text-white font-bold rounded-lg px-4 py-2 transition shadow',
        'hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-60',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 