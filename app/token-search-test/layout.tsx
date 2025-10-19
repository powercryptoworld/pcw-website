import React from "react";
import ToastClient from "@/components/providers/ToastClient";

export default function TokenSearchTestLayout({ children }: { children: React.ReactNode }) {
  // Add a scoped wrapper so we can improve readability without touching other pages.
  return (
    <ToastClient>
      <div className="pcw-tscope">{children}</div>
    </ToastClient>
  );
}
