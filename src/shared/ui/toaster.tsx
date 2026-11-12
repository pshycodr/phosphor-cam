import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster({ duration = 1800 }: { duration?: number }) {
  return (
    <HotToaster
      position="top-center"
      gutter={8}
      containerStyle={{
        top: "calc(env(safe-area-inset-top, 0px) + 16px)",
      }}
      toastOptions={{
        duration,
        className: "translucent",
        style: {
          background: "rgba(14, 16, 15, 0.92)",
          color: "#e6ebe7",
          border: "1px solid #3a423c",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "12px",
          fontFamily: "inherit",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(12px)",
          maxWidth: "min(90vw, 420px)",
        },
        success: {
          iconTheme: { primary: "#38f370", secondary: "#080908" },
        },
        error: {
          iconTheme: { primary: "#ff6b5a", secondary: "#080908" },
        },
      }}
    />
  );
}
