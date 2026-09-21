import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => {
      setDebounced(value);
      setLoading(false);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return { value: debounced, loading };
}
