import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Sparkles, X } from "lucide-react"

function Toast({ message, type = "success", onClose, duration = 4200 }) {
  useEffect(() => {
    if (duration <= 0) return undefined
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const isSuccess = type === "success"

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="relative overflow-hidden w-full max-w-sm rounded-[22px] bg-[#141416]/95 border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl px-4 py-3.5 flex items-start gap-3 pointer-events-auto"
    >
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isSuccess ? "bg-ember/15 text-ember" : "bg-red-500/15 text-red-400"
        }`}
      >
        {isSuccess ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      </div>
      <p className="flex-1 text-[15px] leading-snug text-[#f4f4f5] font-medium pt-1.5">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-1 p-1.5 rounded-full text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
      <motion.span
        className={`absolute bottom-0 left-0 h-[3px] ${isSuccess ? "bg-ember" : "bg-red-400"}`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  )
}

export function ToastHost({ toast, onClose }) {
  return (
    <div className="fixed top-5 inset-x-0 z-[80] flex justify-center px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {toast ? (
          <Toast key={toast.message} message={toast.message} type={toast.type} onClose={onClose} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default Toast
