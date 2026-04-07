import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, timer: number) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(value);
    }, timer);

    return () => clearTimeout(timeout);
  }, [value, timer]);

  return debounced;
}
