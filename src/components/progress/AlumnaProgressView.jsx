import { useEffect, useMemo, useState } from "react"
import { getStoredUser } from "../../services/authService"
import { getMyPlan, peekPlan } from "../../services/planService"
import { getWorkouts, peekWorkouts } from "../../services/workoutService"
import { buildProgressStory, formatKg } from "../../utils/progressStory"
import { isHomeTraining, usesPoseLadder } from "../../utils/trainingType"
import BrandLogo from "../BrandLogo"
import MilagrosYogaProgressSection from "./MilagrosYogaProgressSection"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.55)"
const CARD =
  "rounded-[22px] bg-black px-3 py-4 text-center border"
const CARD_BORDER = { borderColor: "rgba(255,92,0,0.55)", boxShadow: "0 0 18px rgba(255,92,0,0.12)" }

function WeekRing({ done, total, pct }) {
  const size = 108
  const stroke = 8
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
          stroke={BLAZE}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${BLAZE_GLOW})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[18px] font-black italic text-white leading-none">
          {done}/{total}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/80">esta semana</p>
      </div>
    </div>
  )
}

function liftMotivation(chart, lift) {
  if (!lift || !chart?.points?.length) {
    return "Cuando repitas un ejercicio con peso, acá vas a ver cómo subís."
  }
  if (!(lift.delta > 0)) {
    return "Seguí anotando. El gráfico se construye con cada sesión."
  }
  const first = chart.points[0]
  const last = chart.points[chart.points.length - 1]
  let weeks = Math.max(1, chart.points.length - 1)
  if (first?.date && last?.date) {
    const days = Math.max(1, Math.round((new Date(last.date) - new Date(first.date)) / 86400000))
    weeks = Math.max(1, Math.round(days / 7) || 1)
  }
  const kg = formatKg(lift.delta)
  if (weeks <= 1) return `Subiste ${kg} kg. Eso no es suerte.`
  return `Subiste ${kg} kg en ${weeks} ${weeks === 1 ? "semana" : "semanas"}. Eso no es suerte.`
}

function WeightSparkline({ chart }) {
  if (!chart?.points?.length) {
    return (
      <p className="text-sm text-slate-500 leading-relaxed italic">
        Cuando repitas un ejercicio con peso, acá vas a ver cómo subís.
      </p>
    )
  }

  const values = chart.points.map((p) => p.weight)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const w = 320
  const h = 108
  const padX = 28
  const padY = 22
  const coords = chart.points.map((point, i) => {
    const x = padX + ((w - padX * 2) * i) / Math.max(chart.points.length - 1, 1)
    const y = h - padY - ((point.weight - min) / span) * (h - padY * 2)
    return { ...point, x, y }
  })
  const path = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const last = coords[coords.length - 1]

  return (
    <div>
      <p className="text-[13px] text-white/80 mb-3 italic">{chart.name}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[108px] overflow-visible">
        <defs>
          <linearGradient id="progFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLAZE} stopOpacity="0.28" />
            <stop offset="100%" stopColor={BLAZE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {last ? (
          <line
            x1={last.x}
            y1={last.y}
            x2={last.x}
            y2={h - 4}
            stroke="rgba(255,255,255,0.22)"
            strokeDasharray="3 4"
          />
        ) : null}
        <path
          d={`${path} L ${last.x} ${h} L ${coords[0].x} ${h} Z`}
          fill="url(#progFill)"
        />
        <path
          d={path}
          fill="none"
          stroke={BLAZE}
          strokeWidth="2.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${BLAZE_GLOW})` }}
        />
        {coords.map((point) => (
          <g key={`${point.date}-${point.weight}`}>
            <circle cx={point.x} cy={point.y} r="5" fill={BLAZE} />
            <text
              x={point.x}
              y={point.y - 12}
              textAnchor="middle"
              fill={BLAZE}
              fontSize="11"
              fontFamily="Inter Tight, sans-serif"
              fontStyle="italic"
              fontWeight="700"
            >
              {formatKg(point.weight)}kg
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function AlumnaProgressView({ workouts: workoutsProp }) {
  const [workouts, setWorkouts] = useState(() => workoutsProp || peekWorkouts() || [])
  const [plan, setPlan] = useState(() => peekPlan() ?? null)

  useEffect(() => {
    if (workoutsProp) setWorkouts(Array.isArray(workoutsProp) ? workoutsProp : [])
  }, [workoutsProp])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [planResult, workoutResult] = await Promise.allSettled([
        getMyPlan(),
        workoutsProp ? Promise.resolve(workoutsProp) : getWorkouts(),
      ])
      if (cancelled) return

      if (planResult.status === "fulfilled") {
        setPlan(planResult.value ?? null)
      }

      if (workoutResult.status === "fulfilled") {
        setWorkouts(Array.isArray(workoutResult.value) ? workoutResult.value : [])
      } else {
        setWorkouts((current) => (
          current.length ? current : peekWorkouts() || []
        ))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [workoutsProp])

  const story = useMemo(
    () => buildProgressStory(workouts, plan, getStoredUser()?.name),
    [workouts, plan]
  )
  const home = isHomeTraining(getStoredUser()) || isHomeTraining(plan)
  const poseLadder = usesPoseLadder(getStoredUser())

  const liftLabel = story.lift && story.lift.delta > 0
    ? `+${formatKg(story.lift.delta)}KG`
    : story.lift
      ? `${formatKg(story.lift.last)}KG`
      : "—"

  return (
    <div className="min-h-screen bg-black text-white pb-28 font-sans">
      <div className="max-w-md mx-auto px-5 pt-7">
        <div className="flex items-center justify-between">
          <BrandLogo size="wide" className="-ml-2" />
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
            {home ? "Constancia" : "Tu historia"}
          </p>
        </div>

        <h1 className="mt-5 font-display font-black italic tracking-tight text-[52px] leading-none text-white uppercase">
          Progreso
        </h1>
        <p className="mt-3 text-[13px] text-slate-400">
          {home
            ? `${story.userName} · ${story.weekDone} de ${story.daysPerWeek} esta semana`
            : `${story.userName} · ${story.weekLabel}`}
        </p>

        <section
          className="relative mt-6 overflow-hidden rounded-[28px] h-[200px] border"
          style={{ borderColor: "rgba(255,92,0,0.55)", boxShadow: "0 0 28px rgba(255,92,0,0.18)" }}
        >
          <img
            src="/home-hero-sport.png"
            alt=""
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 h-full w-full object-cover object-[center_20%] brightness-[0.55]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, rgba(255,92,0,0.18) 100%)",
            }}
          />
          <div className="relative h-full flex items-center justify-between px-5 pb-4">
            <div>
              <p
                className="font-display font-black italic tracking-tight text-[72px] leading-none"
                style={{ color: BLAZE, textShadow: `0 0 24px ${BLAZE_GLOW}` }}
              >
                {story.sessionsDone}
              </p>
              <p className="mt-1 text-[15px] italic text-white">sesiones hechas</p>
            </div>
            <WeekRing done={story.weekDone} total={story.daysPerWeek} pct={story.weekPct} />
          </div>
          <p
            className="absolute bottom-3 inset-x-0 text-center text-[11px] font-semibold"
            style={{ color: BLAZE }}
          >
            {story.hasCoachNotes ? "Tu coach ya leyó tus notas" : "Tus notas llegan a tu coach"}
          </p>
        </section>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {home ? (
            <>
              <article className={CARD} style={CARD_BORDER}>
                <p className="font-display font-black italic tracking-tight text-[22px] leading-none" style={{ color: BLAZE }}>
                  {story.weekDone}/{story.daysPerWeek}
                </p>
                <p className="mt-2 text-[11px] italic text-white/80 leading-tight">esta semana</p>
              </article>
              <article className={CARD} style={CARD_BORDER}>
                <p className="font-display font-black italic tracking-tight text-[22px] leading-none text-white">
                  {story.monthDone}/{story.monthGoal}
                </p>
                <p className="mt-2 text-[11px] italic text-white/80 leading-tight">este mes</p>
              </article>
              <article className={CARD} style={CARD_BORDER}>
                <p className="font-display font-black italic tracking-tight text-[22px] leading-none text-white uppercase">
                  {story.mood}
                </p>
                <p className="mt-2 text-[11px] italic text-white/80 leading-tight">cómo te sentiste</p>
              </article>
            </>
          ) : (
            <>
              <article className={CARD} style={CARD_BORDER}>
                <p className="font-display font-black italic tracking-tight text-[22px] leading-none" style={{ color: BLAZE }}>
                  {liftLabel}
                </p>
                <p className="mt-2 text-[11px] italic text-white/80 leading-tight">{story.lift?.name || "peso"}</p>
              </article>
              <article className={CARD} style={CARD_BORDER}>
                <p className="font-display font-black italic tracking-tight text-[22px] leading-none text-white uppercase">
                  {story.mood}
                </p>
                <p className="mt-2 text-[11px] italic text-white/80 leading-tight">cómo te sentiste</p>
              </article>
              <article className={CARD} style={CARD_BORDER}>
                <p className="font-display font-black italic tracking-tight text-[22px] leading-none text-white">
                  {story.commentsCount}
                </p>
                <p className="mt-2 text-[11px] italic text-white/80 leading-tight">comentarios</p>
              </article>
            </>
          )}
        </div>

        {home ? (
          <section
            className="mt-4 rounded-[22px] bg-black border px-4 py-4"
            style={{ borderColor: "rgba(255,92,0,0.45)" }}
          >
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: BLAZE }}>
              Esta semana
            </p>
            <div className="mt-3 flex justify-between">
              {(story.weekDays || []).map((day) => (
                <div key={day.key} className="flex flex-col items-center min-w-[36px]">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold border-2"
                    style={
                      day.trained
                        ? { backgroundColor: BLAZE, color: "#080809", borderColor: BLAZE, boxShadow: `0 0 12px ${BLAZE_GLOW}` }
                        : day.hasSession
                          ? { backgroundColor: "transparent", color: "#fff", borderColor: BLAZE }
                          : { backgroundColor: "transparent", color: "#8d8d8d", borderColor: "#3a3a3a" }
                    }
                  >
                    {day.label}
                  </span>
                  <span className="mt-1 text-[10px] font-semibold" style={{ color: day.trained ? BLAZE : "transparent" }}>
                    {day.trained ? "Hecho" : "."}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[13px] italic text-white/80">
              {story.weekDone >= story.daysPerWeek
                ? "Semana completa. Eso es constancia."
                : `Faltan ${Math.max(story.daysPerWeek - story.weekDone, 0)} ${story.daysPerWeek - story.weekDone === 1 ? "día" : "días"} para cerrar la semana.`}
            </p>
          </section>
        ) : null}

        <p className="mt-9 text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
          Lo que vas dejando
        </p>
        {story.comments.length === 0 ? (
          <section
            className="mt-4 rounded-[28px] bg-black border px-5 py-8 text-center"
            style={{ borderColor: "rgba(255,92,0,0.45)" }}
          >
            <p className="font-display font-black italic tracking-tight text-2xl text-white">Todavía no hay notas</p>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              En la sesión guiada, al terminar un ejercicio, decí cómo te fue. Eso aparece acá.
            </p>
          </section>
        ) : (
          <ol className="relative mt-5 ml-1 space-y-6">
            <span
              className="absolute left-[5px] top-2 bottom-2 w-px"
              style={{ backgroundColor: BLAZE, boxShadow: `0 0 8px ${BLAZE_GLOW}` }}
            />
            {story.comments.map((item) => (
              <li key={item.id} className="relative pl-7">
                <span
                  className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full"
                  style={{ backgroundColor: BLAZE, boxShadow: `0 0 10px ${BLAZE_GLOW}` }}
                />
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] text-white">
                    {item.day} · {item.title}
                  </p>
                  {item.feeling ? (
                    <span
                      className="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ borderColor: BLAZE, color: BLAZE }}
                    >
                      {item.feeling}
                    </span>
                  ) : null}
                </div>
                {item.comment ? (
                  <p className="mt-1.5 font-display font-black italic tracking-tight text-[17px] leading-snug text-white">
                    “{item.comment}”
                  </p>
                ) : null}
                <p className="mt-1 text-[12px] italic text-slate-500">
                  {item.exercise}
                  {!home && item.weight ? ` ${item.weight} kg` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}

        {poseLadder ? (
          <MilagrosYogaProgressSection />
        ) : home ? null : (
          <>
            <p className="mt-10 text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
              Cómo subís
            </p>
            <section
              className="mt-4 rounded-[28px] bg-black border px-4 py-5"
              style={{ borderColor: "rgba(255,92,0,0.55)", boxShadow: "0 0 22px rgba(255,92,0,0.12)" }}
            >
              <WeightSparkline chart={story.chart} />
              {story.chart?.points?.length ? (
                <p className="mt-3 text-[13px] italic font-semibold" style={{ color: BLAZE }}>
                  {liftMotivation(story.chart, story.lift)}
                </p>
              ) : null}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
