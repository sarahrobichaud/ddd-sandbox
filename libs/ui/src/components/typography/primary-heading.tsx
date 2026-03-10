import React from 'react';
export default function PrimaryHeading({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h1
      className={`scroll-m-20 font-serif text-4xl font-extrabold tracking-tight lg:text-6xl ${className}`}
    >
      {children}
    </h1>
  );
}
