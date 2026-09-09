import { useEffect, useRef } from "react";

const typeStyles = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-500",
    title: "text-emerald-800",
    msg: "text-emerald-700",
    btn: "bg-emerald-600 hover:bg-emerald-700",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500",
    title: "text-red-800",
    msg: "text-red-700",
    btn: "bg-red-600 hover:bg-red-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-500",
    title: "text-blue-800",
    msg: "text-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
};

function MessageDialog({ isOpen, onClose, type = "info", title, message }) {
  const closeRef = useRef(null);
  const s = typeStyles[type] || typeStyles.info;

  useEffect(() => {
    if (isOpen && closeRef.current) closeRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape" || e.key === "Enter") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative ${s.bg} ${s.border} border rounded-2xl shadow-xl max-w-sm w-full p-6 animate-[dialogIn_0.2s_ease-out]`}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`mt-0.5 ${s.icon}`}>
            {type === "success" && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === "error" && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === "info" && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            {title && <h3 className={`text-base font-semibold ${s.title} mb-1`}>{title}</h3>}
            <p className={`text-sm ${s.msg}`}>{message}</p>
          </div>
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          className={`w-full py-2.5 ${s.btn} text-white text-sm font-medium rounded-xl transition-colors`}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default MessageDialog;
