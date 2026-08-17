import { useEffect, useMemo, useState } from "react"
import {
  Flame,
  Headphones,
  Play,
} from "lucide-react"
import { WEEKDAYS, firstName, todayWeekday } from "../../utils/planUtils"
import { isHomeTraining } from "../../utils/trainingType"
import { savePlanProgress } from "../../services/planService"
import { getWorkouts, peekWorkouts, logSessionExercise } from "../../services/workoutService"
import PlanDesktopHeader from "./PlanDesktopHeader"
import ExerciseHeroCard from "./ExerciseHeroCard"
import ExerciseDetail from "./ExerciseDetail"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.55)"

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
  const hideWeight = isHomeTraining(user) || isHomeTraining(plan)
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
      if (hideWeight || log?.weight || log?.reps || log?.notes) {
        const updatedWorkouts = await logSessionExercise({
          exercise: session.exercises[index],
          weight: hideWeight ? null : log.weight,
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

  const todayBanner = todayHasSession && !todayTrained
    ? {
        title: "Hoy te toca entrenar",
        story: "Es tu día. Entrá a la sesión y dejá todo.",
        action: true,
      }
    : todayHasSession && todayTrained
      ? {
          title: "Hoy ya entrenaste",
          story: "Qué bien. Mañana el cuerpo lo va a notar.",
          action: false,
        }
      : {
          title: "Hoy descansás",
          story: nextTraining
            ? `El ${nextTraining.name} es tu próximo entreno.`
            : "Recuperá. El próximo día de plan te espera.",
          action: false,
        }

  return (
    <div className="min-h-screen bg-black text-white pb-28 font-sans">
      <PlanDesktopHeader />
      <div className="max-w-md mx-auto px-5 pt-7">
        <p className="text-[11px] font-semibold tracking-[0.28em] uppercase" style={{ color: BLAZE }}>
          Plan de {displayName || "la alumna"}
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="font-display font-black italic tracking-tight text-[40px] leading-[0.9] text-white">
            Esta semana
          </h1>
          {daysPerWeek ? (
            <span
              className="mt-1 shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold text-right leading-tight"
              style={{ borderColor: BLAZE, color: BLAZE }}
            >
              {daysPerWeek} {daysPerWeek === 1 ? "día" : "días"} de entreno
            </span>
          ) : null}
        </div>

        <div className="mt-7 flex justify-between px-0.5">
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
                className="flex flex-col items-center min-w-[36px] bg-transparent"
              >
                <span
                  className="h-3 text-[9px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: isToday ? BLAZE : "transparent" }}
                >
                  Hoy
                </span>
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold transition-all duration-200 border-2"
                  style={
                    isActive
                      ? {
                          backgroundColor: BLAZE,
                          color: "#080809",
                          borderColor: BLAZE,
                          boxShadow: `0 0 16px ${BLAZE_GLOW}`,
                        }
                      : isTrained
                        ? { backgroundColor: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.85)" }
                        : hasSession
                          ? { backgroundColor: "transparent", color: "#fff", borderColor: BLAZE }
                          : { backgroundColor: "transparent", color: "#8d8d8d", borderColor: "#3a3a3a" }
                  }
                >
                  {day.label}
                </span>
                <span
                  className="h-5 mt-1 text-[10px] font-semibold"
                  style={{
                    color: isTrained
                      ? "#ffffff"
                      : hasSession
                        ? BLAZE
                        : "transparent",
                  }}
                >
                  {isTrained ? "Hecho" : hasSession ? "Entreno" : "."}
                </span>
              </button>
            )
          })}
        </div>

        {todayBanner.action ? (
          <button
            type="button"
            onClick={() => {
              setSelectedDay(today)
              setDetailIndex(null)
              setGuided(false)
            }}
            className="mt-1 w-full rounded-[28px] bg-black px-5 py-5 text-left flex items-center justify-between gap-3"
            style={{
              border: "1.5px solid rgba(255,92,0,0.7)",
              boxShadow: `0 0 28px rgba(255,92,0,0.22)`,
            }}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>Hoy</p>
              <p className="mt-1.5 font-display font-black italic tracking-tight text-[28px] leading-none text-white">
                {todayBanner.title}
              </p>
              <p className="mt-2 text-sm text-white/80">{todayBanner.story}</p>
            </div>
            <Flame className="h-12 w-12 shrink-0" style={{ color: BLAZE, filter: `drop-shadow(0 0 12px ${BLAZE_GLOW})` }} strokeWidth={1.8} />
          </button>
        ) : (
          <div
            className="mt-1 w-full rounded-[28px] bg-black px-5 py-5 flex items-center justify-between gap-3"
            style={{
              border: "1.5px solid rgba(255,92,0,0.7)",
              boxShadow: `0 0 28px rgba(255,92,0,0.22)`,
            }}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>Hoy</p>
              <p className="mt-1.5 font-display font-black italic tracking-tight text-[28px] leading-none text-white">
                {todayBanner.title}
              </p>
              <p className="mt-2 text-sm text-white/80">{todayBanner.story}</p>
            </div>
            <Flame className="h-12 w-12 shrink-0" style={{ color: BLAZE, filter: `drop-shadow(0 0 12px ${BLAZE_GLOW})` }} strokeWidth={1.8} />
          </div>
        )}

        {session ? (
          <>
            <div className="mt-8 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display font-black italic tracking-tight text-[28px] leading-tight text-white">
                  Día {session.day_number} · {session.title}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-[13px] font-medium" style={{ color: BLAZE }}>
                  <Headphones className="w-4 h-4 shrink-0" />
                  Coach asignó esta sesión
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartGuided}
                disabled={!total}
                className="mt-1 shrink-0 h-10 px-4 rounded-full text-white text-[13px] font-bold tracking-wide disabled:opacity-40"
                style={{ backgroundColor: BLAZE, boxShadow: `0 0 18px ${BLAZE_GLOW}` }}
              >
                {done > 0 && done < total ? "Seguir" : "Empezar"}
              </button>
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
              <div className="flex items-center justify-between text-[13px] mb-2">
                <span style={{ color: BLAZE }}>
                  {done} de {total} ejercicios
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#2A2A2A] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: BLAZE,
                    boxShadow: `0 0 10px ${BLAZE_GLOW}`,
                  }}
                />
              </div>
            </div>

            {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

            <button
              type="button"
              onClick={handleStartGuided}
              disabled={!total}
              className="mt-5 w-full h-14 rounded-full text-white text-[15px] font-bold tracking-[0.08em] uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
              style={{
                backgroundColor: BLAZE,
                boxShadow: `0 0 28px ${BLAZE_GLOW}`,
              }}
            >
              <Play className="w-4 h-4 fill-white" />
              {done > 0 && done < total ? "Seguir sesión guiada" : "Empezar sesión guiada"}
            </button>

            <p className="mt-4 text-center text-[12px] text-slate-500">
              Tocá una card para ver la zona.
            </p>
          </>
        ) : (
          <section
            className="mt-6 rounded-[28px] bg-black border px-4 py-10 text-center"
            style={{ borderColor: "rgba(255,92,0,0.35)" }}
          >
            <h2 className="font-display font-black italic tracking-tight text-2xl">Día de descanso</h2>
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
          hideWeight={hideWeight}
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
