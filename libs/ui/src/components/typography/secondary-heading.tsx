import * as React from 'react';

export default function SecondaryHeading({
  children,
  className,
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={`scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 ${className}`}
    >
      {children}
    </h1>
  );
}
