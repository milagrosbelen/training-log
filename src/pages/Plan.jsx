import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Headphones } from "lucide-react"
import { getCurrentUser, getStoredUser, isAuthenticated, isCoach } from "../services/authService"
import { getMyPlan } from "../services/planService"
import ClientPlanView from "../components/plan/ClientPlanView"
import CoachPlanEditor from "../components/plan/CoachPlanEditor"
import PlanDesktopHeader from "../components/plan/PlanDesktopHeader"

export default function Plan() {
  const [user, setUser] = useState(getStoredUser())
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) return
    let cancelled = false
    async function load() {
      setError("")
      setLoading(true)
      try {
        const current = await getCurrentUser()
        if (cancelled) return
        setUser(current)
        if (!isCoach(current)) {
          const data = await getMyPlan()
          if (!cancelled) setPlan(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message ?? "No se pudo cargar el plan.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [authenticated])

  if (!authenticated) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-white flex items-center justify-center pb-24">
        <p className="text-slate-500">Cargando plan...</p>
      </div>
    )
  }

  if (isCoach(user)) {
    return <CoachPlanEditor />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink text-white flex items-center justify-center px-6 pb-24">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-ink text-white pb-28 font-sans">
        <PlanDesktopHeader />
        <div className="max-w-md mx-auto px-5 pt-8">
          <p className="text-[13px] text-gold tracking-wide">Tu plan</p>
          <h1 className="font-serif text-[40px] leading-none text-white mt-1">Esta semana</h1>
          <section className="mt-10 rounded-[28px] bg-ink-200 border border-white/5 px-6 py-12 text-center">
            <Headphones className="w-8 h-8 text-gold mx-auto" />
            <h2 className="mt-4 font-serif text-2xl">Todavía no hay plan</h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Tu coach todavía no asignó esta semana. Cuando lo cargue, vas a ver acá cada sesión lista para entrenar.
            </p>
          </section>
        </div>
      </div>
    )
  }

  return <ClientPlanView plan={plan} user={user} onPlanChange={setPlan} />
}
