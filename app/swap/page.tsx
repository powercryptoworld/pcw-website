import React from "react";
import SwapCard from "@/components/SwapCard";

export const dynamic = "force-static";

export default function SwapPage() {
  return (
    <main className="min-h-screen w-full flex items-start justify-center pt-16 px-4">
      <SwapCard />
    </main>
  );
}
