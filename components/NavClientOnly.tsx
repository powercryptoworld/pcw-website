"use client";

import dynamic from "next/dynamic";

// Load your existing Nav on the client only to avoid SSR/client HTML mismatch
const NavDynamic = dynamic(() => import("@/components/Nav"), { ssr: false });

export default function NavClientOnly(props: React.ComponentProps<any>) {
  return <NavDynamic {...props} />;
}
