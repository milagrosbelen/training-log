import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../services/authService"

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

  const firstName = user?.name?.trim().split(/\s+/)[0] || ""

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-[#2AF447] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center px-6"
      style={{ isolation: "isolate" }}
    >
      <div
        className="w-full max-w-lg text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 350ms ease-in-out, transform 350ms ease-in-out",
        }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
          ¿Estás listo/a para entrenar hoy,{" "}
          <span className="text-[#2AF447]">{firstName || "atleta"}</span>?
        </h1>

        <div className="mt-16">
          <button
            type="button"
            onClick={handleEnter}
            className="inline-flex items-center justify-center bg-[#2AF447] text-black font-bold py-3.5 px-10 rounded-xl transition-colors duration-200 hover:bg-[#3dff5c] active:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#2AF447] focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Entrar a MiLogit
          </button>
        </div>
      </div>
    </div>
  )
}
