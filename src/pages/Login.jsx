import { useState, useEffect, createElement } from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardList, User } from "lucide-react"
import { loginWithPin } from "../services/authService"
import { apiErrorMessage, warmupApi } from "../services/api"
import BrandLogo from "../components/BrandLogo"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.45)"

const fieldClass =
  "w-full h-14 px-5 rounded-2xl bg-black border border-white/15 text-[#f4f4f5] text-[17px] placeholder:text-slate-500 caret-[#FF5C00] scheme-dark focus:outline-none focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/35"

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState("alumna")
  const [username, setUsername] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    warmupApi()
  }, [])

  const handlePinChange = (value) => {
    if (role === "alumna") {
      setPin(value.replace(/\D/g, "").slice(0, 6))
      return
    }
    setPin(value.slice(0, 72))
  }

  const handleRole = (next) => {
    setRole(next)
    setError("")
    if (next === "alumna") {
      setPin((current) => current.replace(/\D/g, "").slice(0, 6))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const session = await loginWithPin(username, pin, role)
      const isCoach = session?.user?.role === "coach"
      navigate(isCoach ? "/admin" : "/dashboard", { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, "Los datos son incorrectos."))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[340px]">
        <BrandLogo size="lg" className="mx-auto" />

        <p
          className="mt-10 text-[11px] font-semibold tracking-[0.28em] uppercase"
          style={{ color: BLAZE }}
        >
          Acceso
        </p>
        <h1 className="mt-2 font-display font-black italic tracking-tight text-[56px] leading-none text-white">
          Entrar
        </h1>
        <p className="mt-3 text-[15px] text-slate-400">Un solo acceso. Elegí tu rol.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-slate-500 mb-2">Soy</p>
            <div className="grid grid-cols-2 gap-3">
              <RoleButton
                active={role === "alumna"}
                icon={User}
                label="Alumna"
                onClick={() => handleRole("alumna")}
              />
              <RoleButton
                active={role === "coach"}
                icon={ClipboardList}
                label="Coach"
                onClick={() => handleRole("coach")}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-400 text-center">{error}</p> : null}

          <div>
            <label htmlFor="login-user" className="block text-[11px] tracking-[0.22em] uppercase text-slate-500 mb-2">
              Usuario
            </label>
            <input
              id="login-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username"
              required
              disabled={loading}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="login-pin" className="block text-[11px] tracking-[0.22em] uppercase text-slate-500 mb-2">
              PIN
            </label>
            <input
              id="login-pin"
              type="password"
              inputMode={role === "alumna" ? "numeric" : "text"}
              pattern={role === "alumna" ? "[0-9]*" : undefined}
              maxLength={role === "alumna" ? 6 : 72}
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
              className={`${fieldClass} tracking-[0.45em]`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-full text-white text-[22px] font-black italic tracking-tight disabled:opacity-60"
            style={{ backgroundColor: BLAZE, boxShadow: `0 0 28px ${BLAZE_GLOW}` }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-8 text-center text-[13px] text-slate-500">
          El PIN te lo da tu coach.
        </p>
      </div>
    </div>
  )
}

function RoleButton({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-14 rounded-2xl flex items-center justify-center gap-2 text-[17px] font-black italic tracking-tight border transition-all duration-200 ${
        active ? "text-white border-transparent" : "bg-black text-white border-white/20"
      }`}
      style={
        active
          ? { backgroundColor: BLAZE, boxShadow: `0 0 22px ${BLAZE_GLOW}` }
          : undefined
      }
    >
      {icon ? createElement(icon, { className: "w-[18px] h-[18px]", strokeWidth: 2.4 }) : null}
      {label}
    </button>
  )
}
