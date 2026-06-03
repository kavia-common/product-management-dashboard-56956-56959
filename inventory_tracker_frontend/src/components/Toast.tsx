import React, { useEffect } from "react";

export type ToastState = {
  kind: "success" | "error" | "warning" | "info";
  message: string;
};

type Props = {
  toast: ToastState | null;
  onDismiss: () => void;
};

export function Toast(props: Props) {
  const { toast, onDismiss } = props;

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => onDismiss(), 3000);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className={`toast toast${toast.kind}`}>
      <div className="toastMsg">{toast.message}</div>
      <button className="toastClose" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
