import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Quota exceeded (common with base64 logos) — surface in console,
      // don't crash the app.
      console.error(`Could not persist "${key}" to localStorage`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
