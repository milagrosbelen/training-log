import { useEffect } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"

function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const isSuccess = type === "success"
  const bgColor = isSuccess ? "bg-teal-500/90" : "bg-red-500/90"
  const borderColor = isSuccess ? "border-teal-400" : "border-red-400"
  const iconColor = isSuccess ? "text-teal-100" : "text-red-100"

  return (
    <div
      className={`${bgColor} ${borderColor} border backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-md transition-all duration-300 ease-in-out`}
    >
      {isSuccess ? (
        <CheckCircle2 className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
      ) : (
        <XCircle className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
      )}
      <p className="text-white text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Toast

