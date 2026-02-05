'use client';

import { useEffect, useState } from 'react';

type ToastType = 'error' | 'success';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as { message: string; type?: ToastType };
      if (!detail?.message) {
        return;
      }
      const id = `${Date.now()}-${Math.random()}`;
      const type = detail.type || 'error';
      setToasts((prev) => [...prev, { id, message: detail.message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3500);
    };

    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm rounded-lg border px-4 py-3 shadow-lg text-sm ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}
