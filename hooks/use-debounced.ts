import { useEffect, useState } from "react";

export function useDebounced<T>(value?: T, time: number = 400) {
  const [valueDebounced, setValueDebounced] = useState<T>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setValueDebounced(value);
    }, time);

    return () => {
      clearTimeout(timeout);
    };
  }, [time, value]);

  return valueDebounced;
}
