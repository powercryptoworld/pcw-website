import React from "react";
import ToastClient from "@/components/providers/ToastClient";
import EnrichInterceptor from "@/components/tokenSearch/EnrichInterceptor";

export default function TokenSearchTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastClient>
      <EnrichInterceptor />
      <div className="pcw-tscope">{children}</div>
    </ToastClient>
  );
}
