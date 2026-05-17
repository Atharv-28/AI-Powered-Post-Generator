import { useCallback, useEffect, useState } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 10000) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), toast.duration)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return { toasts, addToast, removeToast };
}
