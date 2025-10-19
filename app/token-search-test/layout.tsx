import React from "react";
import ToastClient from "@/components/providers/ToastClient";
import EnrichInterceptor from "@/components/tokenSearch/EnrichInterceptor";
import EnrichCooldown from "@/components/tokenSearch/EnrichCooldown";

export default function TokenSearchTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastClient>
      <EnrichInterceptor />
      <EnrichCooldown />
      <div className="pcw-tscope">{children}</div>
    </ToastClient>
  );
}
