import React from 'react';

interface AccentWordProps {
  children: React.ReactNode;
}

export default function AccentWord({ children }: AccentWordProps) {
  return <span className="font-serif">{children}</span>;
}
