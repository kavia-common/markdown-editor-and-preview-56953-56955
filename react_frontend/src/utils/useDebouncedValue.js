import { useEffect, useState } from "react";

// PUBLIC_INTERFACE
export function useDebouncedValue(value, delayMs) {
  /** React hook returning a debounced version of `value`. */
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
