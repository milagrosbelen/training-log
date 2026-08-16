import { useEffect, useMemo, useState } from "react"
import {
  Headphones,
  Lightbulb,
  Play,
} from "lucide-react"
import { WEEKDAYS, firstName, todayWeekday } from "../../utils/planUtils"
import { savePlanProgress } from "../../services/planService"
import { getWorkouts, peekWorkouts, logSessionExercise } from "../../services/workoutService"
import PlanDesktopHeader from "./PlanDesktopHeader"
import ExerciseHeroCard from "./ExerciseHeroCard"
import ExerciseDetail from "./ExerciseDetail"

export default function ClientPlanView({ plan, user, onPlanChange }) {
  const sessionsByDay = useMemo(() => {
    const map = {}
    for (const session of plan.sessions || []) {
      map[Number(session.weekday)] = session
    }
    return map
  }, [plan.sessions])

  const defaultDay = useMemo(() => {
    const today = todayWeekday()
    if (sessionsByDay[today]) return today
    const first = (plan.sessions || [])[0]
    return first ? first.weekday : today
  }, [plan.sessions, sessionsByDay])

  const [selectedDay, setSelectedDay] = useState(defaultDay)
  const [guided, setGuided] = useState(false)
  const [guidedIndex, setGuidedIndex] = useState(0)
  const [detailIndex, setDetailIndex] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [workouts, setWorkouts] = useState(() => peekWorkouts() || [])

  const session = sessionsByDay[selectedDay] || null
  const today = todayWeekday()
  const progress = plan.progress_by_weekday?.[selectedDay] || {
    completed: 0,
    total: session?.exercises?.length || 0,
    indexes: [],
  }
  const completedSet = new Set(progress.indexes || [])
  const trained = new Set((plan.trained_weekdays || []).map(Number))
  const displayName = firstName(plan.user_name || user?.name)
  const total = session?.exercises?.length || 0
  const done = Math.min(progress.completed || 0, total)
  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  const daysPerWeek = Number(plan.days_per_week) || (plan.sessions || []).length || 0
  const todayHasSession = Boolean(sessionsByDay[today])
  const todayTrained = trained.has(today)
  const nextTraining = WEEKDAYS.find((day) => day.key > today && sessionsByDay[day.key])
    || WEEKDAYS.find((day) => sessionsByDay[day.key])

  useEffect(() => {
    getWorkouts()
      .then((list) => setWorkouts(Array.isArray(list) ? list : []))
      .catch(() => {})
  }, [])

  const openGuidedAt = (index) => {
    if (!session?.exercises?.length) return
    setDetailIndex(null)
    setGuidedIndex(index)
    setGuided(true)
  }

  const handleStartGuided = () => {
    if (!session?.exercises?.length) return
    const firstPending = session.exercises.findIndex((_, i) => !completedSet.has(i))
    openGuidedAt(firstPending >= 0 ? firstPending : 0)
  }

  const handleCompleteExercise = async (index, log) => {
    if (!session) return
    setSaving(true)
    setError("")
    try {
      if (log?.weight) {
        const updatedWorkouts = await logSessionExercise({
          exercise: session.exercises[index],
          weight: log.weight,
          reps: log.reps,
          sets: log.sets,
          notes: log.notes,
          sessionTitle: session.title,
          workouts,
        })
        setWorkouts((current) => {
          const date = updatedWorkouts?.date
          const without = current.filter((item) => item.date !== date)
          return updatedWorkouts ? [updatedWorkouts, ...without] : current
        })
      }
      const next = [...new Set([...(progress.indexes || []), index])]
      const updated = await savePlanProgress(selectedDay, next)
      onPlanChange(updated)
      if (index >= (session.exercises.length || 1) - 1) {
        setGuided(false)
      } else {
        setGuidedIndex(index + 1)
      }
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudo guardar el registro.")
    } finally {
      setSaving(false)
    }
  }

  const activeExercise = guided
    ? session?.exercises?.[guidedIndex]
    : detailIndex != null
      ? session?.exercises?.[detailIndex]
      : null

  return (
    <div className="min-h-screen bg-ink text-white pb-28 font-sans">
      <PlanDesktopHeader />
      <div className="max-w-md mx-auto px-5 pt-8">
        <p className="text-[13px] text-gold tracking-wide">
          Plan de {displayName || "la alumna"}
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="font-serif text-[40px] leading-none text-white">Esta semana</h1>
          {daysPerWeek ? (
            <span className="mt-2 shrink-0 rounded-full border border-gold/70 px-3 py-1 text-[11px] text-gold text-right leading-tight">
              {daysPerWeek} {daysPerWeek === 1 ? "día" : "días"} de entreno a la semana
            </span>
          ) : null}
        </div>
        {plan.objective ? (
          <p className="mt-3 text-sm text-slate-400">{plan.objective}</p>
        ) : null}

        <div className="mt-8 flex justify-between px-1">
          {WEEKDAYS.map((day) => {
            const isActive = selectedDay === day.key
            const isToday = today === day.key
            const isTrained = trained.has(day.key)
            const hasSession = Boolean(sessionsByDay[day.key])
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => {
                  setSelectedDay(day.key)
                  setDetailIndex(null)
                  setGuided(false)
                }}
                className="flex flex-col items-center min-w-[36px]"
              >
                <span className={`h-3 text-[9px] uppercase tracking-[0.12em] ${isToday ? "text-gold" : "text-transparent"}`}>
                  Hoy
                </span>
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-medium transition-colors ${
                    isActive
                      ? "bg-ember text-white"
                      : hasSession
                        ? "border-2 border-ember text-white"
                        : "text-slate-500"
                  }`}
                >
                  {day.label}
                </span>
                <span className={`h-5 mt-1 text-[10px] ${isTrained ? "text-gold" : hasSession ? "text-ember/80" : "text-transparent"}`}>
                  {isTrained ? "Hecho" : hasSession ? "Entreno" : "."}
                </span>
              </button>
            )
          })}
        </div>

        {todayHasSession && !todayTrained ? (
          <button
            type="button"
            onClick={() => {
              setSelectedDay(today)
              setDetailIndex(null)
              setGuided(false)
            }}
            className="mt-2 w-full rounded-[24px] border border-ember/40 bg-ember/10 px-4 py-4 text-left"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-ember">Hoy</p>
            <p className="mt-1 font-serif text-[26px] leading-none text-white">Hoy te toca entrenar</p>
            <p className="mt-2 text-sm text-slate-400">
              Es tu día. Entrá a la sesión y dejá todo.
            </p>
          </button>
        ) : null}

        {todayHasSession && todayTrained ? (
          <div className="mt-2 w-full rounded-[24px] border border-gold/30 bg-ink-200 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Hoy</p>
            <p className="mt-1 font-serif text-[26px] leading-none text-white">Hoy ya entrenaste</p>
            <p className="mt-2 text-sm text-slate-400">Qué bien. Mañana el cuerpo lo va a notar.</p>
          </div>
        ) : null}

        {!todayHasSession ? (
          <div className="mt-2 w-full rounded-[24px] border border-white/5 bg-ink-200 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Hoy</p>
            <p className="mt-1 font-serif text-[26px] leading-none text-white">Hoy descansás</p>
            <p className="mt-2 text-sm text-slate-400">
              {nextTraining
                ? `El ${nextTraining.name} es tu próximo entreno.`
                : "Recuperá. El próximo día de plan te espera."}
            </p>
          </div>
        ) : null}

        {session ? (
          <>
            <div className="mt-8">
              <h2 className="font-serif text-[28px] leading-tight">
                Día {session.day_number} · {session.title}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-[13px] text-gold">
                <Headphones className="w-4 h-4" />
                Coach asignó esta sesión
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {(session.exercises || []).map((exercise, index) => (
                <ExerciseHeroCard
                  key={`${exercise.name}-${index}`}
                  exercise={exercise}
                  index={index}
                  completed={completedSet.has(index)}
                  onOpen={() => setDetailIndex(index)}
                />
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-[13px] text-[#bdbdbd] mb-2">
                <span>
                  {done} de {total} ejercicios
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-ink-400 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ember transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

            <button
              type="button"
              onClick={handleStartGuided}
              disabled={!total}
              className="mt-5 w-full h-12 rounded-2xl bg-ember text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              {done > 0 && done < total ? "Seguir sesión guiada" : "Empezar sesión guiada"}
            </button>

            <p className="mt-4 flex items-start gap-2 text-[12px] text-slate-500 leading-relaxed">
              <Lightbulb className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              Tocá una card para ver la zona. En la sesión guiada, al final de cada ejercicio anotá peso y cómo te fue.
            </p>
          </>
        ) : (
          <section className="mt-6 rounded-[28px] bg-ink-200 border border-white/5 px-4 py-10 text-center">
            <h2 className="font-serif text-2xl">Día de descanso</h2>
            <p className="mt-2 text-sm text-slate-500">
              Hoy no hay sesión asignada. Recuperá y volvé al próximo día de plan.
            </p>
          </section>
        )}
      </div>

      {activeExercise ? (
        <ExerciseDetail
          exercise={activeExercise}
          workouts={workouts}
          guided={guided}
          guidedLabel={
            guided
              ? `Ejercicio ${guidedIndex + 1} de ${session.exercises.length}`
              : ""
          }
          saving={saving}
          error={error}
          onClose={() => {
            setGuided(false)
            setDetailIndex(null)
          }}
          onUse={() => openGuidedAt(detailIndex ?? 0)}
          onComplete={(log) => handleCompleteExercise(guidedIndex, log)}
          completeLabel={
            guidedIndex >= (session.exercises.length || 1) - 1
              ? "Completar sesión"
              : "Hecho, siguiente"
          }
        />
      ) : null}
    </div>
  )
}
