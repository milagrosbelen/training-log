import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

const baseInputClass =
  "w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:border-transparent disabled:opacity-60 pr-11"

/**
 * Input de contraseña con toggle para mostrar/ocultar.
 * Reutilizable para Login y Register.
 */
export default function PasswordInput({ id, value, onChange, placeholder, required, disabled, minLength, ...rest }) {
  const [showPassword, setShowPassword] = useState(false)

  const toggle = (e) => {
    e.preventDefault()
    setShowPassword((prev) => !prev)
  }

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        minLength={minLength}
        className={baseInputClass}
        {...rest}
      />
      <button
        type="button"
        onClick={toggle}
        onMouseDown={(e) => e.preventDefault()}
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        tabIndex={-1}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 disabled:opacity-50 disabled:pointer-events-none transition-colors min-w-[2.5rem] min-h-[2.5rem] flex items-center justify-center touch-manipulation"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}
