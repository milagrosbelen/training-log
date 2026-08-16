import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../services/authService"
import { apiErrorMessage } from "../services/api"
import AuthFrame, { fieldClass, primaryBtnClass } from "../components/AuthFrame"

export default function LoginAdmin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      navigate("/admin", { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, "Las credenciales son incorrectas."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      title="Panel"
      subtitle="Acceso de la administradora."
      footer={
        <Link to="/" className="text-xs text-slate-600 hover:text-ember transition-colors">
          Volver al ingreso de alumnas
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <div>
          <label htmlFor="admin-email" className="block text-[11px] tracking-[0.18em] uppercase text-slate-500 mb-2">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={loading}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="admin-pass" className="block text-[11px] tracking-[0.18em] uppercase text-slate-500 mb-2">
            Contraseña
          </label>
          <input
            id="admin-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            className={fieldClass}
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
