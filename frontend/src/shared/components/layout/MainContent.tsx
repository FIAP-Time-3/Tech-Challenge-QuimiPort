import type { ComponentProps } from 'react';

export function MainContent({
  children,
  className = '',
  ...props
}: ComponentProps<'main'>) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`mx-auto w-full max-w-[1440px] flex-1 space-y-6 p-4 outline-none sm:p-8 ${className}`}
      {...props}
    >
      {children}
    </main>
  );
}
