import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginWithPin } from "../services/authService"
import AuthFrame, { fieldClass, primaryBtnClass } from "../components/AuthFrame"

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await loginWithPin(username, pin)
      navigate("/welcome", { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? "Los datos son incorrectos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      title="Tu entrenamiento"
      subtitle="Ingresá el usuario y el PIN que te dio tu entrenadora."
      footer={
        <Link
          to="/acceso"
          className="text-xs text-slate-600 hover:text-ember transition-colors"
        >
          Acceso profesional
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}
        <div>
          <label htmlFor="login-user" className="block text-[11px] tracking-[0.18em] uppercase text-slate-500 mb-2">
            Usuario
          </label>
          <input
            id="login-user"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="milagros"
            autoCapitalize="none"
            autoCorrect="off"
            required
            disabled={loading}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="login-pin" className="block text-[11px] tracking-[0.18em] uppercase text-slate-500 mb-2">
            PIN
          </label>
          <input
            id="login-pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="••••"
            required
            disabled={loading}
            className={`${fieldClass} tracking-[0.4em]`}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={primaryBtnClass}
          style={{ backgroundColor: "#FF4F2A" }}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </AuthFrame>
  )
}
