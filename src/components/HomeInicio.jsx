import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { dateToISOString, formatDateShort } from "../utils/dateUtils"
import { getExerciseProgressStatus } from "../utils/exerciseProgress"
import { getMyPlan } from "../services/planService"
import Calendar from "./Calendar"

const WEEK_LABELS = ["L", "M", "X", "J", "V", "S", "D"]
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const BTN =
  "w-full h-14 rounded-full bg-ember text-white text-[17px] font-semibold shadow-ember transition-all duration-200 ease-out hover:bg-ember-400 hover:shadow-[0_0_28px_rgba(255,79,42,0.5)] active:scale-[0.97] active:bg-ember-600"

function greetingForNow() {
  const hour = new Date().getHours()
  if (hour < 12) return "Buenos días,"
  if (hour < 19) return "Buenas tardes,"
  return "Buenas noches,"
}

function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return d
}

function weekDatesFrom(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
}

function normalizeDate(value) {
  if (!value) return ""
  return String(value).slice(0, 10)
}

function exerciseVolume(exercise) {
  if (!exercise) return 0
  if (Array.isArray(exercise.series) && exercise.series.length > 0) {
    return exercise.series.reduce((sum, set) => {
      const weight = parseFloat(set.weight) || 0
      const reps = parseInt(set.reps, 10) || 0
      return sum + weight * reps
    }, 0)
  }
  const weight = parseFloat(exercise.weight) || 0
  const reps = parseInt(exercise.reps, 10) || 0
  const sets = parseInt(exercise.sets, 10) || 1
  return weight * reps * sets
}

function workoutVolume(workout) {
  return (workout?.exercises || []).reduce((sum, exercise) => sum + exerciseVolume(exercise), 0)
}

function formatVolume(kg) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(Math.round(kg))
}

function countImproved(workout, allWorkouts) {
  if (!workout?.date) return 0
  return (workout.exercises || []).filter((exercise) => {
    if (!String(exercise.name || "").trim()) return false
    return getExerciseProgressStatus(exercise, workout.date, allWorkouts).status === "improved"
  }).length
}

function scoreWorkout(workout, allWorkouts) {
  const volume = workoutVolume(workout)
  const improved = countImproved(workout, allWorkouts)
  const named = (workout.exercises || []).filter((ex) => String(ex.name || "").trim()).length
  return volume + improved * 4000 + named * 80
}

function storyForBest(workout, volume, improved, monthName) {
  const type = workout?.type?.trim() || "Entrenamiento"
  if (improved >= 2) {
    return {
      eyebrow: `Mejor sesión · ${monthName}`,
      story: `Ese día subiste en ${improved} ejercicios. Registrarlo es lo que hace visible el progreso.`,
      title: type,
    }
  }
  if (volume >= 4000) {
    return {
      eyebrow: `Mejor sesión · ${monthName}`,
      story: "Tu mayor volumen del mes. Cada serie anotada suma a esta marca.",
      title: type,
    }
  }
  if (improved >= 1) {
    return {
      eyebrow: `Mejor sesión · ${monthName}`,
      story: "Día que rindió. Seguí entrenando y anotando: el mes se construye así.",
      title: type,
    }
  }
  return {
    eyebrow: `Mejor sesión · ${monthName}`,
    story: "La clase que más pesó este mes. Cuanto más registres, más clara se ve tu evolución.",
    title: type,
  }
}

function sparklinePaths(values, width = 168, height = 64) {
  const src = values.length >= 2 ? values : [8, 14, 11, 18, 16, 24, 22, 30]
  const max = Math.max(...src, 1)
  const min = Math.min(...src)
  const span = max - min || 1
  const padX = 4
  const padY = 6
  const pts = src.map((v, i) => {
    const x = padX + (i / Math.max(src.length - 1, 1)) * (width - padX * 2)
    const y = height - padY - ((v - min) / span) * (height - padY * 2)
    return [x, y]
  })
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")
  const last = pts[pts.length - 1]
  const first = pts[0]
  const area = `${line} L${last[0].toFixed(1)} ${height} L${first[0].toFixed(1)} ${height} Z`
  return { line, area, last }
}

export default function HomeInicio({ userName, workouts = [], selectedDate, onSelectDate }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [planDates, setPlanDates] = useState([])
  const list = Array.isArray(workouts) ? workouts : []

  useEffect(() => {
    let cancelled = false
    getMyPlan()
      .then((plan) => {
        if (cancelled) return
        const dates = Array.isArray(plan?.trained_dates) ? plan.trained_dates : []
        setPlanDates(dates.map((date) => String(date).slice(0, 10)).filter(Boolean))
      })
      .catch(() => {
        if (!cancelled) setPlanDates([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const firstName = String(userName || "").trim().split(/\s+/)[0] || "atleta"
  const today = useMemo(() => dateToISOString(new Date()), [])
  const days = useMemo(() => weekDatesFrom(weekStart), [weekStart])
  const now = useMemo(() => new Date(), [])
  const monthName = MONTHS[now.getMonth()]
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const trainedSet = useMemo(() => {
    const dates = new Set(planDates)
    for (const workout of list) {
      const key = normalizeDate(workout?.date)
      if (key) dates.add(key)
    }
    return dates
  }, [list, planDates])

  const monthWorkouts = useMemo(
    () =>
      list.filter((workout) => {
        const key = normalizeDate(workout?.date)
        if (!key) return false
        const [y, m] = key.split("-").map(Number)
        return y === year && m === month
      }),
    [list, year, month]
  )

  const bestSession = useMemo(() => {
    if (monthWorkouts.length === 0) return null
    return monthWorkouts.reduce((best, workout) => {
      const currentScore = scoreWorkout(workout, list)
      const bestScore = best ? scoreWorkout(best, list) : -1
      return currentScore >= bestScore ? workout : best
    }, null)
  }, [monthWorkouts, list])

  const bestVolume = bestSession ? workoutVolume(bestSession) : 0
  const bestImproved = bestSession ? countImproved(bestSession, list) : 0
  const bestCopy = bestSession
    ? storyForBest(bestSession, bestVolume, bestImproved, monthName)
    : {
        eyebrow: `Este mes · ${monthName}`,
        story: "Cuando completes una sesión del plan, acá va a aparecer tu mejor clase del mes.",
        title: "Tu mejor clase",
      }

  const elapsedDays = now.getDate()
  const monthGoal = Math.max(4, Math.ceil(elapsedDays / 7) * 4)
  const monthProgress = Math.min(100, Math.round((monthWorkouts.length / monthGoal) * 100))

  const monthVolume = useMemo(
    () => monthWorkouts.reduce((total, workout) => total + workoutVolume(workout), 0),
    [monthWorkouts]
  )

  const volumeSeries = useMemo(() => {
    const ordered = [...monthWorkouts]
      .sort((a, b) => normalizeDate(a.date).localeCompare(normalizeDate(b.date)))
      .map((workout) => workoutVolume(workout))
    return ordered.length ? ordered : []
  }, [monthWorkouts])

  const spark = sparklinePaths(volumeSeries)
  const exerciseCount = (bestSession?.exercises || []).filter((ex) => String(ex.name || "").trim()).length

  const goPrevWeek = () => {
    setWeekStart((current) => {
      const next = new Date(current)
      next.setDate(current.getDate() - 7)
      return next
    })
  }

  const goNextWeek = () => {
    setWeekStart((current) => {
      const next = new Date(current)
      next.setDate(current.getDate() + 7)
      return next
    })
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="pt-1">
        <p className="text-[11px] font-medium tracking-[0.28em] text-slate-500 uppercase">MILOGIT</p>
        <p className="mt-3 text-lg text-slate-400">{greetingForNow()}</p>
        <h1 className="text-[34px] leading-none font-semibold tracking-tight text-white">{firstName}</h1>
      </div>

      <button
        type="button"
        onClick={() => onSelectDate(bestSession ? normalizeDate(bestSession.date) : today)}
        className="relative w-full overflow-hidden rounded-[28px] h-[232px] border border-white/5 text-left transition-transform duration-200 ease-out active:scale-[0.985]"
      >
        <img src="/home-hero-bench.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-black/25" />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-[11px] font-medium tracking-[0.16em] text-ember uppercase">
            {bestCopy.eyebrow}
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white leading-tight">
            {bestCopy.title}
          </h2>
          <p className="mt-2 text-sm text-slate-200 leading-snug">{bestCopy.story}</p>
          <p className="mt-2 text-xs text-slate-400">
            {bestSession
              ? `${formatDateShort(normalizeDate(bestSession.date))} · ${exerciseCount} ejercicio${exerciseCount === 1 ? "" : "s"} · ${formatVolume(bestVolume)} kg`
              : "La mejor clase del mes se elige con lo que anotes."}
          </p>
        </div>
      </button>

      <Link to="/plan" className={`${BTN} flex items-center justify-center`}>
        Ver plan
      </Link>

      <section
        className="rounded-[28px] bg-ink-200/85 backdrop-blur-xl border border-white/10 px-5 py-4"
        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.45), 0 0 32px rgba(255,79,42,0.08)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">Actividad semanal</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrevWeek}
              className="p-1.5 rounded-lg text-slate-500 hover:text-ember hover:bg-ember/10 transition-colors"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNextWeek}
              className="p-1.5 rounded-lg text-slate-500 hover:text-ember hover:bg-ember/10 transition-colors"
              aria-label="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {days.map((date, index) => {
            const iso = dateToISOString(date)
            const trained = trainedSet.has(iso)
            const isToday = iso === today
            const isSelected = iso === selectedDate
            const filled = trained || isSelected
            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelectDate(iso)}
                className="flex flex-col items-center gap-2 min-w-[32px] bg-transparent transition-transform duration-150 active:scale-90"
              >
                <span className={`text-[11px] font-medium ${filled || isToday ? "text-ember" : "text-slate-500"}`}>
                  {WEEK_LABELS[index]}
                </span>
                <span
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold tabular-nums transition-all duration-200 ${
                    filled
                      ? "bg-ember text-ink shadow-ember-sm border-2 border-ember"
                      : isToday
                        ? "bg-ember/15 text-ember border-2 border-ember"
                        : "bg-transparent text-slate-500 border-2 border-slate-600"
                  }`}
                >
                  {date.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <section
          className="rounded-[28px] bg-ink-200/85 backdrop-blur-xl border border-white/10 px-5 py-6"
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,79,42,0.12)", transform: "translateY(-2px)" }}
        >
          <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">Progreso del mes</p>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative w-[120px] h-[120px] flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" strokeWidth="9" className="stroke-ink-400" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${(monthProgress / 100) * (2 * Math.PI * 50)} ${2 * Math.PI * 50}`}
                  className="stroke-ember"
                  style={{ filter: "drop-shadow(0 0 12px rgba(255,79,42,0.55))" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[32px] leading-none font-semibold tabular-nums text-ember">{monthProgress}%</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[52px] leading-none font-semibold tracking-tight text-white tabular-nums">
                {monthWorkouts.length}
                <span className="ml-1 text-xl font-medium text-slate-500">/{monthGoal}</span>
              </p>
              <p className="mt-3 text-sm text-slate-400 leading-snug">
                Sesiones anotadas en {monthName}. El anillo crece cada vez que registrás un entrenamiento.
              </p>
            </div>
          </div>
        </section>

        <section
          className="rounded-[28px] bg-ink-200/85 backdrop-blur-xl border border-white/10 px-5 py-6"
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,79,42,0.12)", transform: "translateY(-2px)" }}
        >
          <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">Volumen total</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[56px] leading-none font-semibold tracking-tight text-white tabular-nums">
                {formatVolume(monthVolume)}
              </p>
              <p className="mt-2 text-sm text-slate-500">kg volumen</p>
            </div>
            <svg viewBox="0 0 168 64" className="w-[168px] h-16 flex-shrink-0 overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4F2A" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF4F2A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={spark.area} fill="url(#volFill)" />
              <path
                d={spark.line}
                fill="none"
                stroke="#FF4F2A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 8px rgba(255,79,42,0.55))" }}
              />
            </svg>
          </div>
        </section>
      </div>

      <Calendar
        selectedDate={selectedDate}
        onDateSelect={onSelectDate}
        workouts={list}
        trainedDates={[...trainedSet]}
      />
    </div>
  )
}
