// frontend/src/components/common/CommonModal.jsx
export default function CommonModal({
  open,
  onClose,

  title = "알림",
  message = "",

  // 버튼들
  cancelText = "닫기",
  onCancel, // 없으면 onClose로 대체
  confirmText, // 없으면 confirm 버튼 숨김
  onConfirm,

  // 옵션
  dimClose = true, // 바깥 클릭으로 닫기
  confirmVariant = "primary", // "primary" | "ghost" | "danger"
}) {
  if (!open) return null;

  const handleDimClick = () => {
    if (!dimClose) return;
    onClose?.();
  };

  const confirmClass =
    confirmVariant === "danger"
      ? "bg-red-500/90 hover:bg-red-500"
      : confirmVariant === "ghost"
      ? "bg-white/5 hover:bg-white/10"
      : "bg-button hover:bg-button-hover";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* dim */}
      <div className="absolute inset-0 bg-black/60" onClick={handleDimClick} />

      {/* modal */}
      <div className="relative w-[360px] rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl text-left">
        <h3 className="text-white font-semibold text-base">{title}</h3>

        {message && (
          <p className="text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        )}

        <div className="mt-4 flex gap-2 justify-between">
          <button
            onClick={onCancel || onClose}
            className="px-3 py-1.5 rounded-xl text-sm bg-white/5 text-slate-200 hover:bg-white/10 transition hover:cursor-pointer"
          >
            {cancelText}
          </button>

          {confirmText && (
            <button
              onClick={onConfirm}
              className={`px-3 py-1.5 rounded-xl text-sm text-white transition hover:cursor-pointer ${confirmClass}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
