"use client";
import * as React from "react";

/**
 * useDebouncedValue
 * Returns a debounced copy of a value after `delayMs` of inactivity.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/**
 * useDebouncedCallback
 * Returns a stable debounced function you can call frequently.
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delayMs = 300
): T {
  const fnRef = React.useRef(fn);
  fnRef.current = fn;
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = React.useCallback((...args: any[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fnRef.current(...args);
    }, delayMs);
  }, [delayMs]) as T;

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return debounced;
}
