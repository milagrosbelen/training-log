import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Headphones } from "lucide-react"
import { getStoredUser, isAuthenticated, isCoach } from "../services/authService"
import { getMyPlan, peekPlan } from "../services/planService"
import ClientPlanView from "../components/plan/ClientPlanView"
import CoachPlanEditor from "../components/plan/CoachPlanEditor"
import PlanDesktopHeader from "../components/plan/PlanDesktopHeader"

export default function Plan() {
  const user = getStoredUser()
  const [plan, setPlan] = useState(() => peekPlan() ?? null)
  const [ready, setReady] = useState(peekPlan() !== undefined)
  const [error, setError] = useState("")
  const authenticated = isAuthenticated()
  const coach = isCoach(user)

  useEffect(() => {
    if (!authenticated || coach) return

    getMyPlan()
      .then((data) => {
        setPlan(data)
        setError("")
      })
      .catch((err) => {
        setError(err.response?.data?.message ?? "No se pudo cargar el plan.")
      })
      .finally(() => {
        setReady(true)
      })
  }, [authenticated, coach])

  if (!authenticated) {
    return <Navigate to="/" replace />
  }

  if (coach) {
    return <CoachPlanEditor />
  }

  if (plan) {
    return <ClientPlanView plan={plan} user={user} onPlanChange={setPlan} />
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-ink text-white pb-28 font-sans">
        <PlanDesktopHeader />
        <div className="max-w-md mx-auto px-5 pt-8">
          <p className="text-[13px] text-gold tracking-wide">Tu plan</p>
          <h1 className="font-serif text-[40px] leading-none text-white mt-1">Esta semana</h1>
          <p className="mt-8 text-sm text-slate-500">Estamos trayendo tu plan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink text-white flex items-center justify-center px-6 pb-24">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    )
  }

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
