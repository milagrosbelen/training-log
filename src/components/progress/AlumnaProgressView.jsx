import { useEffect, useMemo, useState } from "react"
import { getStoredUser } from "../../services/authService"
import { getMyPlan, peekPlan } from "../../services/planService"
import { getWorkouts, peekWorkouts } from "../../services/workoutService"
import { buildProgressStory, formatKg } from "../../utils/progressStory"

function WeekRing({ done, total, pct }) {
  const size = 108
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct)

  return (
    <div className="relative w-[108px] h-[108px] shrink-0">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#FF4F2A"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[15px] font-semibold text-white leading-none">
          {done}/{total}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">esta semana</p>
      </div>
    </div>
  )
}

function WeightSparkline({ chart }) {
  if (!chart?.points?.length) {
    return (
      <p className="text-sm text-slate-500 leading-relaxed">
        Cuando repitas un ejercicio con peso, acá vas a ver cómo subís.
      </p>
    )
  }

  const values = chart.points.map((p) => p.weight)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const w = 320
  const h = 88
  const padX = 22
  const padY = 18
  const coords = chart.points.map((point, i) => {
    const x = padX + ((w - padX * 2) * i) / Math.max(chart.points.length - 1, 1)
    const y = h - padY - ((point.weight - min) / span) * (h - padY * 2)
    return { ...point, x, y }
  })
  const path = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <div>
      <p className="text-[13px] text-slate-400 mb-3">{chart.name}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[88px] overflow-visible">
        <path d={path} fill="none" stroke="#FF4F2A" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((point) => (
          <g key={`${point.date}-${point.weight}`}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="#FF4F2A" />
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fill="#f4f4f5"
              fontSize="11"
              fontFamily="Inter Tight, sans-serif"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

const pillClass = {
  ember: "border-ember/70 text-ember",
  gold: "border-gold/70 text-gold",
  muted: "border-white/20 text-slate-400",
}

export default function AlumnaProgressView({ workouts: workoutsProp }) {
  const [workouts, setWorkouts] = useState(() => workoutsProp || peekWorkouts() || [])
  const [plan, setPlan] = useState(() => peekPlan() ?? null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (workoutsProp) setWorkouts(workoutsProp)
  }, [workoutsProp])

  useEffect(() => {
    async function load() {
      try {
        const [planData, workoutData] = await Promise.all([
          getMyPlan(),
          workoutsProp ? Promise.resolve(workoutsProp) : getWorkouts(),
        ])
        setPlan(planData)
        setWorkouts(Array.isArray(workoutData) ? workoutData : [])
        setError("")
      } catch (err) {
        if (!(workoutsProp || peekWorkouts())?.length) {
          setError(err.response?.data?.message ?? "No se pudo cargar el progreso.")
        }
      }
    }
    load()
  }, [])

  const story = useMemo(
    () => buildProgressStory(workouts, plan, getStoredUser()?.name),
    [workouts, plan]
  )

  if (error && workouts.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-6 pb-24">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    )
  }

  const liftLabel = story.lift && story.lift.delta > 0
    ? `+${formatKg(story.lift.delta)} kg`
    : story.lift
      ? `${formatKg(story.lift.last)} kg`
      : "—"

  return (
    <div className="min-h-screen bg-ink text-white pb-28 font-sans">
      <div className="max-w-md mx-auto px-5 pt-7">
        <p className="text-center text-[11px] tracking-[0.32em] text-gold uppercase">MILOGIT</p>

        <p className="mt-8 text-[11px] font-medium tracking-[0.22em] text-gold uppercase">Tu historia</p>
        <h1 className="mt-1 font-serif text-[52px] leading-none text-white">Progreso</h1>
        <p className="mt-3 text-[13px] text-slate-400">
          {story.userName} · {story.weekLabel}
        </p>

        <section className="relative mt-7 overflow-hidden rounded-[28px] h-[188px] border border-white/5">
          <img
            src="/home-hero-bench.png"
            alt=""
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 h-full w-full object-cover brightness-[0.42]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
          <div className="relative h-full flex items-center justify-between px-5">
            <div>
              <p className="font-serif text-[64px] leading-none text-ember">{story.sessionsDone}</p>
              <p className="mt-1 text-[13px] text-white/90">sesiones hechas</p>
            </div>
            <WeekRing done={story.weekDone} total={story.daysPerWeek} pct={story.weekPct} />
          </div>
          <p className="absolute bottom-3 inset-x-0 text-center text-[11px] text-ember">
            {story.hasCoachNotes ? "Tu coach ya leyó tus notas" : "Tus notas llegan a tu coach"}
          </p>
        </section>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <article className="rounded-[22px] bg-ink-200 border border-white/5 px-3 py-4 text-center">
            <p className="font-serif text-[22px] leading-none text-ember">{liftLabel}</p>
            <p className="mt-2 text-[11px] text-slate-500 leading-tight">{story.lift?.name || "peso"}</p>
          </article>
          <article className="rounded-[22px] bg-ink-200 border border-white/5 px-3 py-4 text-center">
            <p className="font-serif text-[22px] leading-none text-gold">{story.mood}</p>
            <p className="mt-2 text-[11px] text-slate-500 leading-tight">cómo te sentiste</p>
          </article>
          <article className="rounded-[22px] bg-ink-200 border border-white/5 px-3 py-4 text-center">
            <p className="font-serif text-[22px] leading-none text-white">{story.commentsCount}</p>
            <p className="mt-2 text-[11px] text-slate-500 leading-tight">comentarios</p>
          </article>
        </div>

        <p className="mt-9 text-[11px] font-medium tracking-[0.22em] text-gold uppercase">Lo que vas dejando</p>
        {story.comments.length === 0 ? (
          <section className="mt-4 rounded-[28px] bg-ink-200 border border-white/5 px-5 py-8 text-center">
            <p className="font-serif text-2xl text-white">Todavía no hay notas</p>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              En la sesión guiada, al terminar un ejercicio, decí cómo te fue. Eso aparece acá.
            </p>
          </section>
        ) : (
          <ol className="relative mt-5 ml-1 space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-ember/70">
            {story.comments.map((item) => (
              <li key={item.id} className="relative pl-7">
                <span className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full bg-ember" />
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] text-white">
                    {item.day} · {item.title}
                  </p>
                  {item.feeling ? (
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] ${pillClass[item.tone]}`}>
                      {item.feeling}
                    </span>
                  ) : null}
                </div>
                {item.comment ? (
                  <p className="mt-1.5 font-serif italic text-[17px] leading-snug text-white/90">
                    “{item.comment}”
                  </p>
                ) : null}
                <p className="mt-1 text-[12px] text-slate-500">
                  {item.exercise}
                  {item.weight ? ` ${item.weight} kg` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}

        <p className="mt-10 text-[11px] font-medium tracking-[0.22em] text-gold uppercase">Cómo subís</p>
        <section className="mt-4 rounded-[28px] bg-ink-200 border border-white/5 px-4 py-5">
          <WeightSparkline chart={story.chart} />
        </section>
      </div>
    </div>
  )
}
