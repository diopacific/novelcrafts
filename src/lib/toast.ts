import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';
export type ToastEvent = { message: string; type: ToastType; id: number };

let toastId = 0;
let listeners: ((toast: ToastEvent) => void)[] = [];

export const toast = {
  success: (message: string) => emit({ message, type: 'success', id: ++toastId }),
  error: (message: string) => emit({ message, type: 'error', id: ++toastId }),
  info: (message: string) => emit({ message, type: 'info', id: ++toastId }),
};

const emit = (event: ToastEvent) => {
  listeners.forEach(listener => listener(event));
};

export const useToastListener = () => {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const handleToast = (event: ToastEvent) => {
      setToasts(prev => [...prev, event]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== event.id));
      }, 3000);
    };
    listeners.push(handleToast);
    return () => {
      listeners = listeners.filter(l => l !== handleToast);
    };
  }, []);

  return toasts;
};
