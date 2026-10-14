"use client";

import React from "react";

export function useDebounce<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = React.useState(value);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => {
      setDebounced(value);
      setLoading(false);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return { value: debounced, loading };
}
