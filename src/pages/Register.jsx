import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register } from "../services/authService"
import PasswordInput from "../components/PasswordInput"

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setLoading(true)
    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation })
      navigate("/welcome")
    } catch (err) {
      const errors = err.response?.data?.errors
      const message = errors
        ? Object.values(errors).flat().join(" ") || err.response?.data?.message
        : err.response?.data?.message ?? "Error al crear la cuenta. Intentá de nuevo."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-ink-200 border border-white/5 rounded-2xl shadow-xl shadow-black/40 p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-ember text-center tracking-tight mb-2 [text-shadow:0_0_20px_rgba(235,87,61,0.35)]">
            MiLogit
          </h1>
          <p className="text-gold text-sm text-center mb-8">
            Crear cuenta
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-slate-300 mb-2">
                Nombre
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-ink-300 border border-slate-600 text-[#f4f4f5] placeholder:text-slate-400 caret-ember scheme-dark focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-ink-300 border border-slate-600 text-[#f4f4f5] placeholder:text-slate-400 caret-ember scheme-dark focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <PasswordInput
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmar contraseña
              </label>
              <PasswordInput
                id="register-confirm"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ember hover:bg-ember-400 disabled:bg-ember/60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-ember mt-2"
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/"
              className="text-ember hover:text-ember-400 font-medium underline underline-offset-2"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
