import React from 'react';
export default function Lead({ children, className }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-xl text-muted-foreground ${className}`}>{children}</p>;
}
