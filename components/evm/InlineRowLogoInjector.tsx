"use client";
import React from "react";

type Props = {
  row?: any;
  size?: number;
  className?: string;
};

/**
 * Minimal stub so the app builds.
 * It simply renders its children (or nothing) and avoids the missing-module error.
 * You can replace with a real implementation later.
 */
export default function InlineRowLogoInjector({
  children,
}: React.PropsWithChildren<Props>) {
  return <>{children ?? null}</>;
}
