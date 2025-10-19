import React from "react";
import ToastClient from "@/components/providers/ToastClient";
import EnrichInterceptor from "@/components/tokenSearch/EnrichInterceptor";
import EnrichCooldown from "@/components/tokenSearch/EnrichCooldown";
import EnrichDebug from "@/components/tokenSearch/EnrichDebug";
import SelectLogoDecorator from "@/components/chain/SelectLogoDecorator";
import InlineRowLogoInjector from "@/components/evm/InlineRowLogoInjector";

export default function TokenSearchTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastClient>
      <EnrichInterceptor />
      <EnrichCooldown />
      <SelectLogoDecorator />
      {/* Inline injector renders the logo inside the row */}
      <InlineRowLogoInjector />
      <div className="pcw-tscope">{children}</div>
      <EnrichDebug />
    </ToastClient>
  );
}
