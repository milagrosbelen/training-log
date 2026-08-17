import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Activity, ChevronRight, Play } from "lucide-react"
import { slugExercise } from "../../utils/exerciseImages"
import { resolveExerciseMeta } from "../../data/exerciseCatalog"
import { formatRest } from "../../utils/planUtils"
import ExercisePhoto from "../ExercisePhoto"
import MuscleMap from "./MuscleMap"

function CueIcon({ index }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="4.2" r="1.5" />
        <path d="M8.2 8.2c1.2-1.2 6.4-1.2 7.6 0l1.7 6.2c.2.8-.4 1.5-1.2 1.5H7.7c-.8 0-1.4-.7-1.2-1.5L8.2 8.2Z" />
        <path d="M7.2 16.2 6 21M16.8 16.2 18 21" strokeLinecap="round" />
      </svg>
    )
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 11.5h18" strokeLinecap="round" />
        <path d="M6.5 9v5M17.5 9v5" strokeLinecap="round" />
        <path d="M8 16.5h8" strokeLinecap="round" />
        <path d="M10.5 16.5v2.2h3V16.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 5.5v7.2c0 2.4 1.4 4.3 3.6 4.8" strokeLinecap="round" />
      <path d="M8 12.8h5.2" strokeLinecap="round" />
      <path d="M13.4 16.8c1.3-.4 2.8-1.6 3.8-3.2" strokeLinecap="round" />
    </svg>
  )
}

function defaultReps(value) {
  const nums = String(value || "").match(/\d+/g)
  if (!nums?.length) return ""
  return nums[nums.length - 1]
}

const FEELINGS = ["Fácil", "Bien", "Pesado"]

function parseWeight(value) {
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function formatKg(value) {
  if (!value) return "—"
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "")
}

function collectHistory(exerciseName, workouts) {
  const slug = slugExercise(exerciseName)
  if (!slug) return []
  const rows = []
  for (const workout of workouts || []) {
    for (const item of workout.exercises || []) {
      if (slugExercise(item.name) !== slug) continue
      rows.push({
        date: workout.date,
        weight: parseWeight(item.weight),
        reps: item.reps,
        sets: item.sets,
        notes: item.notes || "",
      })
    }
  }
  return rows.sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

export default function ExerciseDetail({
  exercise,
  workouts = [],
  guided = false,
  guidedLabel = "",
  saving = false,
  error = "",
  onClose,
  onUse,
  onComplete,
  completeLabel = "Hecho, siguiente",
  onHistory,
}) {
  const [showHistory, setShowHistory] = useState(false)
  const [mapView, setMapView] = useState(null)
  const [logWeight, setLogWeight] = useState("")
  const [logReps, setLogReps] = useState("")
  const [logSets, setLogSets] = useState("")
  const [logNote, setLogNote] = useState("")
  const [feeling, setFeeling] = useState("")
  const meta = resolveExerciseMeta(exercise)
  const view = mapView || meta.preferredView

  const history = useMemo(
    () => collectHistory(exercise.name, workouts),
    [exercise.name, workouts]
  )
  const last = history[0] || null
  const previous = history[1] || null
  const pr = history.reduce((max, row) => Math.max(max, row.weight), 0)
  const lastWeight = last?.weight || 0
  const prDelta = lastWeight && previous?.weight ? lastWeight - previous.weight : 0

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    setMapView(null)
    setShowHistory(false)
    setFeeling("")
    setLogNote("")
    setLogSets(exercise.sets ? String(exercise.sets) : "1")
    setLogReps(defaultReps(exercise.reps))
    const previousWeight = collectHistory(exercise.name, workouts)[0]?.weight
    setLogWeight(previousWeight ? String(previousWeight) : "")
  }, [exercise.name, exercise.sets, exercise.reps])

  const stats = [
    { value: exercise.sets || "—", label: "Series" },
    { value: exercise.reps || "—", label: "Repeticiones" },
    { value: lastWeight ? formatKg(lastWeight) : formatRest(exercise.rest_seconds), label: lastWeight ? "Kg" : "Descanso" },
  ]

  return (
    <div className="fixed inset-0 z-[70] bg-black text-white overflow-y-auto">
      <div className="max-w-md mx-auto min-h-full pb-8">
        <div className="relative h-[42vh] min-h-[280px]">
          <ExercisePhoto
            name={exercise.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/25" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {guidedLabel ? (
            <p className="absolute top-5 left-16 z-10 text-[12px] text-white/80">{guidedLabel}</p>
          ) : null}
        </div>

        <div className="px-5 -mt-16 relative">
          <span className="inline-flex items-center rounded-full bg-ember px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-white">
            {meta.typeLabel}
          </span>
          <h2 className="mt-3 font-display text-[34px] leading-none font-extrabold tracking-tight">{exercise.name}</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-ember px-3 py-1.5 text-[12px] font-medium text-white">
              {meta.primaryLabel}
            </span>
            {meta.secondaryLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/20 bg-black px-3 py-1.5 text-[12px] font-medium text-white"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 divide-x divide-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="px-2 first:pl-0 last:pr-0 text-center">
                <p className="text-[28px] leading-none font-semibold tabular-nums">{stat.value}</p>
                <p className="mt-2 text-[11px] tracking-[0.14em] uppercase text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {lastWeight ? (
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#161616] border border-white/5 px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-slate-300">
                <Activity className="w-4 h-4 text-ember" />
                Última vez {formatKg(lastWeight)} kg
              </p>
              {prDelta > 0 ? (
                <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-semibold text-black">
                  PR +{formatKg(prDelta)} kg
                </span>
              ) : pr ? (
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">
                  PR {formatKg(pr)} kg
                </span>
              ) : null}
            </div>
          ) : null}

          {exercise.tip ? (
            <p className="mt-5 text-sm text-gold leading-relaxed">{exercise.tip}</p>
          ) : null}

          <section className="mt-8">
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-slate-500">Técnica</p>
            <div className="mt-4 grid grid-cols-[1fr_168px] gap-3 items-start">
              <ul className="space-y-5 pt-1">
                {meta.cues.map((cue, index) => (
                  <li key={cue} className="flex items-center gap-3 text-[15px] text-white">
                    <span className="text-white">
                      <CueIcon index={index} />
                    </span>
                    {cue}
                  </li>
                ))}
              </ul>
              <div className="relative">
                <MuscleMap
                  primary={meta.primary}
                  view={view}
                  className="w-full h-[220px] rounded-[22px] bg-black"
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center rounded-full bg-black/70 p-0.5">
                  <button
                    type="button"
                    onClick={() => setMapView("front")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                      view === "front" ? "bg-ember text-white" : "text-slate-400"
                    }`}
                  >
                    Frente
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapView("back")}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                      view === "back" ? "bg-ember text-white" : "text-slate-400"
                    }`}
                  >
                    Espalda
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[12px] text-slate-500">
              {meta.primary === "completo"
                ? "En naranja, trabaja el cuerpo entero."
                : "En naranja, la zona que más trabaja. El resto queda de apoyo."}
            </p>
          </section>

          {showHistory ? (
            <section className="mt-6 rounded-2xl bg-[#121214] border border-white/5 p-4">
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-slate-500">Historial</p>
              {history.length ? (
                <ul className="mt-3 space-y-3">
                  {history.slice(0, 8).map((row, index) => (
                    <li key={`${row.date}-${index}`} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{row.date}</span>
                        <span className="text-white">
                          {row.sets || "—"} × {row.reps || "—"}
                          {row.weight ? ` · ${formatKg(row.weight)} kg` : ""}
                        </span>
                      </div>
                      {row.notes ? (
                        <p className="text-[12px] text-slate-500">{row.notes}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Todavía no hay registros de este ejercicio.</p>
              )}
            </section>
          ) : null}

          {guided ? (
            <section className="mt-8 rounded-2xl bg-[#121214] border border-white/5 p-4">
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-slate-500">
                Cómo te fue
              </p>
              {lastWeight ? (
                <p className="mt-2 text-sm text-slate-400">
                  Última vez {formatKg(lastWeight)} kg
                  {last?.notes ? ` · ${last.notes}` : ""}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Anotá el peso para medir el progreso la próxima vez.
                </p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wide text-slate-500">Kg</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    inputMode="decimal"
                    value={logWeight}
                    onChange={(e) => setLogWeight(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full h-12 rounded-xl bg-ink border border-white/10 px-3 text-lg font-semibold text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wide text-slate-500">Reps</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={logReps}
                    onChange={(e) => setLogReps(e.target.value)}
                    placeholder={defaultReps(exercise.reps) || "10"}
                    className="mt-1 w-full h-12 rounded-xl bg-ink border border-white/10 px-3 text-lg font-semibold text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wide text-slate-500">Series</span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={logSets}
                    onChange={(e) => setLogSets(e.target.value)}
                    className="mt-1 w-full h-12 rounded-xl bg-ink border border-white/10 px-3 text-lg font-semibold text-white"
                  />
                </label>
              </div>

              {lastWeight && parseWeight(logWeight) > 0 ? (
                <p className={`mt-2 text-[12px] ${
                  parseWeight(logWeight) > lastWeight ? "text-lime" : parseWeight(logWeight) < lastWeight ? "text-slate-500" : "text-slate-400"
                }`}>
                  {parseWeight(logWeight) > lastWeight
                    ? `+${formatKg(parseWeight(logWeight) - lastWeight)} kg vs la última vez`
                    : parseWeight(logWeight) < lastWeight
                      ? `${formatKg(parseWeight(logWeight) - lastWeight)} kg vs la última vez`
                      : "Mismo peso que la última vez"}
                </p>
              ) : null}

              <div className="mt-4 flex gap-2">
                {FEELINGS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFeeling(feeling === item ? "" : item)}
                    className={`flex-1 h-10 rounded-full text-[13px] font-medium ${
                      feeling === item
                        ? "bg-ember text-white"
                        : "border border-white/15 text-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <textarea
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Comentario: técnica, si te costó, cómo se sintió..."
                className="mt-3 w-full rounded-xl bg-ink border border-white/10 px-3 py-3 text-sm text-white placeholder:text-slate-500 resize-none"
              />
            </section>
          ) : null}

          <div className="mt-8 space-y-3">
            {guided ? (
              <button
                type="button"
                disabled={saving || !parseWeight(logWeight)}
                onClick={() => {
                  const noteParts = [feeling, logNote.trim()].filter(Boolean)
                  onComplete?.({
                    weight: parseWeight(logWeight),
                    reps: parseInt(logReps, 10) || defaultReps(exercise.reps) || null,
                    sets: parseInt(logSets, 10) || exercise.sets || 1,
                    notes: noteParts.join(". "),
                  })
                }}
                className="w-full h-12 rounded-2xl bg-ember text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {completeLabel}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onUse}
                className="w-full h-12 rounded-2xl bg-ember text-white font-medium flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Usar en el entrenamiento
              </button>
            )}
            {guided && !parseWeight(logWeight) ? (
              <p className="text-center text-[12px] text-slate-500">Anotá el peso para guardar el progreso.</p>
            ) : null}
            {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}
            <button
              type="button"
              onClick={() => {
                setShowHistory(true)
                onHistory?.()
              }}
              className="w-full h-12 rounded-2xl bg-black border border-white/20 text-white font-medium"
            >
              Ver historial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
