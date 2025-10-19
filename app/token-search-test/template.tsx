import React from 'react';

export default function TokenSearchTemplate({ children }: { children: React.ReactNode }) {
  // Keep the page lean; logos now render inline in the result rows.
  return <>{children}</>;
}
