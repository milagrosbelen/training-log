import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../services/authService"

function Login() {
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
      navigate("/dashboard")
    } catch (err) {
      const message =
        err.response?.data?.errors?.email?.[0] ??
        err.response?.data?.message ??
        "Error al iniciar sesión. Verificá tus credenciales."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/95 border border-slate-700/50 rounded-2xl shadow-xl shadow-black/20 p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-1">
            Bienvenido a MiLogit
          </h1>
          <p className="text-slate-400 text-sm text-center mb-8">
            Iniciá sesión para gestionar tus entrenamientos
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-600/60 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 mt-2"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            ¿No tenés cuenta?{" "}
            <Link
              to="/register"
              className="text-teal-400 hover:text-teal-300 font-medium underline underline-offset-2"
            >
              Registrate
            </Link>
          </p>
          <p className="text-center text-slate-500 text-xs mt-3">
            Usuario de prueba: test@test.com / password123
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
