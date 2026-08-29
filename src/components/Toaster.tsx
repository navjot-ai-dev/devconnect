"use client";

import { useEffect, useState } from "react";
import type { ToastDetail } from "@/lib/toast";

type ToastItem = ToastDetail & { id: number };

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const custom = event as CustomEvent<ToastDetail>;
      const id = Date.now() + Math.random();

      setToasts((current) => [
        ...current,
        { id, ...custom.detail },
      ]);

      window.setTimeout(() => {
        setToasts((current) =>
          current.filter((item) => item.id !== id)
        );
      }, 3200);
    }

    window.addEventListener("devconnect:toast", onToast);
    return () => {
      window.removeEventListener("devconnect:toast", onToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(100%-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
            item.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
