import { AnimatePresence, motion } from "framer-motion"

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "ember",
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Cerrar"
            onClick={onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ y: 28, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-sm rounded-[28px] bg-[#161618] border border-white/10 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
          >
            <p className="text-[11px] tracking-[0.22em] uppercase text-ember font-semibold">MILOGIT</p>
            <h2 id="confirm-title" className="mt-3 text-2xl font-semibold text-white tracking-tight">
              {title}
            </h2>
            {body ? (
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{body}</p>
            ) : null}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="h-12 rounded-full border border-white/15 text-[#cfcfcf] text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`h-12 rounded-full text-sm font-semibold ${
                  tone === "danger" ? "btn-danger" : "btn-ember"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
