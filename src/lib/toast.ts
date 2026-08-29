export type ToastType = "success" | "error";

export type ToastDetail = {
  message: string;
  type: ToastType;
};

export function toast(message: string, type: ToastType = "success") {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ToastDetail>("devconnect:toast", {
      detail: { message, type },
    })
  );
}
