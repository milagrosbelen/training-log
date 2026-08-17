import { Component, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Headphones } from "lucide-react"
import { getStoredUser, isAuthenticated, isCoach } from "../services/authService"
import { getMyPlan, peekPlan } from "../services/planService"
import ClientPlanView from "../components/plan/ClientPlanView"
import CoachPlanEditor from "../components/plan/CoachPlanEditor"
import PlanDesktopHeader from "../components/plan/PlanDesktopHeader"

class PlanViewGuard extends Component {
  constructor(props) {
    super(props)
    this.state = { crashed: false }
  }

  static getDerivedStateFromError() {
    return { crashed: true }
  }

  render() {
    if (this.state.crashed) return this.props.fallback
    return this.props.children
  }
}

function EmptyPlan() {
  return (
    <div className="min-h-screen bg-black text-white pb-28 font-sans">
      <PlanDesktopHeader />
      <div className="max-w-md mx-auto px-5 pt-7">
        <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#FF5C00]">Tu plan</p>
        <h1 className="font-display font-black italic tracking-tight text-[40px] leading-[0.9] text-white mt-2">Esta semana</h1>
        <section className="mt-10 rounded-[28px] bg-black border border-[#FF5C00]/40 px-6 py-12 text-center">
          <Headphones className="w-8 h-8 text-[#FF5C00] mx-auto" />
          <h2 className="mt-4 font-display font-black italic tracking-tight text-2xl">Todavía no hay plan</h2>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Tu coach todavía no asignó esta semana. Cuando lo cargue, vas a ver acá cada sesión lista para entrenar.
          </p>
        </section>
      </div>
    </div>
  )
}

export default function Plan() {
  const user = getStoredUser()
  const [plan, setPlan] = useState(() => peekPlan() ?? null)
  const [ready, setReady] = useState(peekPlan() !== undefined)
  const authenticated = isAuthenticated()
  const coach = isCoach(user)

  useEffect(() => {
    if (!authenticated || coach) return
    let cancelled = false

    getMyPlan()
      .then((data) => {
        if (cancelled) return
        setPlan(data)
      })
      .catch(() => {
        if (cancelled) return
        const cached = peekPlan()
        if (cached !== undefined) setPlan(cached)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [authenticated, coach])

  if (!authenticated) {
    return <Navigate to="/" replace />
  }

  if (coach) {
    return <CoachPlanEditor />
  }

  if (plan) {
    return (
      <PlanViewGuard fallback={<EmptyPlan />}>
        <ClientPlanView plan={plan} user={user} onPlanChange={setPlan} />
      </PlanViewGuard>
    )
  }

  if (!ready) {
    return <div className="min-h-screen bg-black" />
  }

  return <EmptyPlan />
}
