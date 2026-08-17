import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../services/authService"
import BrandLogo from "../components/BrandLogo"

export default function Welcome() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) {
      const id = setTimeout(() => setVisible(true), 16)
      return () => clearTimeout(id)
    }
  }, [loading])

  const handleEnter = () => {
    navigate("/dashboard", { replace: true })
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "atleta"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-ink-400 border-t-ember rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div
        className="w-full max-w-md text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 350ms ease-in-out, transform 350ms ease-in-out",
        }}
      >
        <BrandLogo size="lg" className="mx-auto" />
        <p className="text-lg text-slate-400">¿Lista para entrenar hoy?</p>
        <h1
          className="mt-2 font-display text-5xl sm:text-6xl font-extrabold tracking-tight leading-none"
          style={{ color: "#FF4F2A", textShadow: "0 0 28px rgba(255,79,42,0.45)" }}
        >
          {firstName}
        </h1>

        <button
          type="button"
          onClick={handleEnter}
          className="mt-14 inline-flex items-center justify-center w-full max-w-xs h-14 rounded-full text-white text-[17px] font-semibold shadow-ember transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
          style={{ backgroundColor: "#FF4F2A" }}
        >
          Empezar
        </button>
      </div>
    </div>
  )
}
