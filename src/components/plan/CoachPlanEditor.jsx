import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, ChevronUp, Headphones, Trash2, X } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { ToastHost } from "../Toast"
import ConfirmDialog from "../ConfirmDialog"
import ExercisePhoto from "../ExercisePhoto"
import MuscleMap from "./MuscleMap"
import { resolveExerciseMeta, suggestedMuscleLabel } from "../../data/exerciseCatalog"
import {
  WEEKDAYS,
  SESSION_TITLES,
  MUSCLE_OPTIONS,
  EXERCISE_SUGGESTIONS,
  OBJECTIVE_OPTIONS,
  DAYS_PER_WEEK_OPTIONS,
  emptyExercise,
  emptyPlanForm,
  firstName,
  parseObjectives,
  joinObjectives,
} from "../../utils/planUtils"
import {
  getClients,
  peekClients,
  peekClientPlan,
  getClientPlan,
  saveClientPlan,
  deleteClientPlan,
} from "../../services/planService"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.45)"

function initialOf(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "A"
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function sessionForDay(sessions, weekday) {
  return sessions.find((session) => session.weekday === weekday) || null
}

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

function formFromPlan(plan) {
  if (!plan) return emptyPlanForm()
  return {
    week_current: plan.week_current || 1,
    week_total: plan.week_total || 8,
    days_per_week: plan.days_per_week || plan.sessions?.length || 3,
    objectives: parseObjectives(plan.objective),
    sessions: Array.isArray(plan.sessions) ? plan.sessions : [],
  }
}

export default function CoachPlanEditor() {
  const [searchParams] = useSearchParams()
  const cachedClients = peekClients() || []
  const initialId = searchParams.get("alumna") || (cachedClients[0] ? String(cachedClients[0].id) : "")
  const [clients, setClients] = useState(cachedClients)
  const [selectedUserId, setSelectedUserId] = useState(initialId)
  const [form, setForm] = useState(() => formFromPlan(initialId ? peekClientPlan(initialId) : undefined))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState(null)
  const [pendingRemoveDay, setPendingRemoveDay] = useState(null)
  const [pendingDeletePlan, setPendingDeletePlan] = useState(false)
  const [activeWeekday, setActiveWeekday] = useState(() => {
    const sessions = formFromPlan(initialId ? peekClientPlan(initialId) : undefined).sessions
    return sessions[0] ? sessions[0].weekday : 0
  })

  const [openObjectives, setOpenObjectives] = useState(false)
  const objectiveRef = useRef(null)

  const selectedClient = useMemo(
    () => clients.find((client) => String(client.id) === String(selectedUserId)) || null,
    [clients, selectedUserId]
  )

  useEffect(() => {
    getClients()
      .then((list) => {
        const next = Array.isArray(list) ? list : []
        setClients(next)
        const fromQuery = searchParams.get("alumna")
        setSelectedUserId((current) => {
          if (fromQuery && next.some((client) => String(client.id) === fromQuery)) return fromQuery
          if (current && next.some((client) => String(client.id) === String(current))) return current
          return next[0] ? String(next[0].id) : ""
        })
      })
      .catch((err) => {
        setError(err.response?.data?.message ?? "No se pudieron cargar las alumnas.")
      })
  }, [searchParams])

  useEffect(() => {
    if (!selectedUserId) {
      setForm(emptyPlanForm())
      return
    }
    const cached = peekClientPlan(selectedUserId)
    if (cached !== undefined) {
      const next = formFromPlan(cached)
      setForm(next)
      setActiveWeekday(next.sessions[0]?.weekday ?? 0)
    }
    getClientPlan(selectedUserId)
      .then((plan) => {
        const next = formFromPlan(plan)
        setForm(next)
        setActiveWeekday(next.sessions[0]?.weekday ?? 0)
      })
      .catch((err) => {
        setError(err.response?.data?.message ?? "No se pudo cargar el plan.")
      })
  }, [selectedUserId])

  useEffect(() => {
    if (!openObjectives) return
    const onPointer = (event) => {
      if (!objectiveRef.current?.contains(event.target)) setOpenObjectives(false)
    }
    document.addEventListener("mousedown", onPointer)
    return () => document.removeEventListener("mousedown", onPointer)
  }, [openObjectives])

  const selectedObjectives = form.objectives || []

  const toggleObjective = (item) => {
    setForm((prev) => {
      const current = parseObjectives(prev.objectives)
      if (current.includes(item)) {
        return { ...prev, objectives: current.filter((value) => value !== item) }
      }
      if (current.length >= 3) {
        setToast({ message: "Podés elegir hasta 3 objetivos.", type: "error" })
        return prev
      }
      return { ...prev, objectives: [...current, item] }
    })
  }

  const removeObjective = (item) => {
    setForm((prev) => ({
      ...prev,
      objectives: parseObjectives(prev.objectives).filter((value) => value !== item),
    }))
  }

  const moveExercise = (weekday, index, direction) => {
    updateSession(weekday, (current) => {
      const next = [...(current.exercises || [])]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return { ...current, exercises: next }
    })
  }

  const updateSession = (weekday, updater) => {
    setForm((prev) => {
      const current = sessionForDay(prev.sessions, weekday)
      if (!current) return prev
      return {
        ...prev,
        sessions: prev.sessions.map((session) =>
          session.weekday === weekday ? updater(session) : session
        ),
      }
    })
  }

  const addDay = (weekday) => {
    setForm((prev) => {
      if (sessionForDay(prev.sessions, weekday)) return prev
      const nextNumber = prev.sessions.length + 1
      return {
        ...prev,
        sessions: [
          ...prev.sessions,
          {
            weekday,
            day_number: nextNumber,
            title: SESSION_TITLES[Math.min(nextNumber - 1, SESSION_TITLES.length - 1)],
            exercises: [emptyExercise()],
          },
        ].sort((a, b) => a.weekday - b.weekday),
      }
    })
    setActiveWeekday(weekday)
  }

  const removeDay = (weekday) => {
    setForm((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((session) => session.weekday !== weekday),
    }))
  }

  const addNextDay = () => {
    const limit = Number(form.days_per_week) || 3
    if (form.sessions.length >= limit) {
      setToast({
        message: `El plan es de ${limit} días. Si querés otro, subí la cantidad de días.`,
        type: "error",
      })
      return
    }
    const used = new Set(form.sessions.map((session) => session.weekday))
    const next = WEEKDAYS.find((day) => !used.has(day.key))
    if (!next) {
      setToast({ message: "Ya están los 7 días de la semana.", type: "error" })
      return
    }
    addDay(next.key)
  }

  const handleSave = async () => {
    if (!selectedUserId) return
    if (!parseObjectives(form.objectives).length) {
      setToast({ message: "Elegí al menos un objetivo.", type: "error" })
      return
    }

    const daysPerWeek = Number(form.days_per_week) || 3
    const sessions = form.sessions
      .map((session) => ({
        ...session,
        title: session.title.trim(),
        exercises: (session.exercises || [])
          .filter((exercise) => String(exercise.name || "").trim())
          .map((exercise) => ({
            ...exercise,
            name: String(exercise.name).trim(),
            reps: String(exercise.reps ?? "").trim(),
          })),
      }))
      .filter((session) => session.title)

    if (!sessions.length) {
      setToast({ message: "Agregá al menos un día con título y ejercicios.", type: "error" })
      return
    }

    if (sessions.length > daysPerWeek) {
      setToast({
        message: `Hay más sesiones que días. El plan es de ${daysPerWeek} días.`,
        type: "error",
      })
      return
    }

    if (sessions.length < daysPerWeek) {
      setToast({
        message: `Faltan días. Cargá ${daysPerWeek} sesiones, una por cada día que va a ir.`,
        type: "error",
      })
      return
    }

    setSaving(true)
    setError("")
    try {
      await saveClientPlan(selectedUserId, {
        week_current: Number(form.week_current) || 1,
        week_total: Number(form.week_total) || 8,
        days_per_week: daysPerWeek,
        objective: joinObjectives(form.objectives),
        sessions,
      })
      setClients((prev) =>
        prev.map((client) =>
          String(client.id) === String(selectedUserId) ? { ...client, has_plan: true } : client
        )
      )
      setToast({ message: "Plan guardado. La alumna ya lo puede ver.", type: "success" })
    } catch (err) {
      setToast({
        message: err.response?.data?.message ?? "No se pudo guardar el plan.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUserId || !selectedClient?.has_plan) return
    setPendingDeletePlan(true)
  }

  const confirmDeletePlan = async () => {
    if (!selectedUserId || !selectedClient?.has_plan) return
    setPendingDeletePlan(false)
    setSaving(true)
    try {
      await deleteClientPlan(selectedUserId)
      setForm(emptyPlanForm())
      setClients((prev) =>
        prev.map((client) =>
          String(client.id) === String(selectedUserId) ? { ...client, has_plan: false } : client
        )
      )
      setToast({ message: "Plan eliminado.", type: "success" })
    } catch (err) {
      setToast({
        message: err.response?.data?.message ?? "No se pudo eliminar el plan.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  const pendingSession = form.sessions.find((session) => session.weekday === pendingRemoveDay)
  const pendingDayLabel = pendingSession?.title || DAY_NAMES[pendingRemoveDay] || ""
  const activeSession = sessionForDay(form.sessions, activeWeekday)
  const namedExercises = (activeSession?.exercises || []).filter((ex) => String(ex.name || "").trim()).length

  const handleWeekdayTap = (weekday) => {
    const existing = sessionForDay(form.sessions, weekday)
    if (existing) {
      setActiveWeekday(weekday)
      return
    }
    const limit = Number(form.days_per_week) || 3
    if (form.sessions.length >= limit) {
      setToast({
        message: `El plan es de ${limit} días. Si querés otro, subí la cantidad de días.`,
        type: "error",
      })
      return
    }
    addDay(weekday)
  }

  return (
    <div className="font-sans pb-8 pt-7">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
          Vista de coach
        </p>
        <h1 className="font-display font-black italic tracking-tight text-[40px] leading-none text-white mt-2">
          Cargar plan
        </h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          Armá la semana. Ella la ve al instante.
        </p>

        {error ? (
          <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm">
            {error}
          </div>
        ) : null}

        {!clients.length ? (
          <section
            className="mt-8 rounded-[28px] bg-black border px-5 py-10 text-center"
            style={{ borderColor: "rgba(255,92,0,0.4)" }}
          >
            <Headphones className="w-8 h-8 mx-auto" style={{ color: BLAZE }} />
            <p className="mt-4 text-white">Todavía no hay alumnas.</p>
            <p className="mt-2 text-sm text-slate-500">
              Creá una alumna en el panel y después asignale el plan.
            </p>
          </section>
        ) : (
          <>
            <div className="mt-6 flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {clients.map((client) => {
                const selected = String(client.id) === String(selectedUserId)
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedUserId(String(client.id))}
                    className="flex flex-col items-center min-w-[72px] bg-transparent"
                  >
                    <span
                      className="h-14 w-14 rounded-full flex items-center justify-center text-sm font-black"
                      style={
                        selected
                          ? { backgroundColor: "#1a1a1a", color: BLAZE, border: `3px solid ${BLAZE}`, boxShadow: `0 0 16px ${BLAZE_GLOW}` }
                          : { backgroundColor: "#1a1a1a", color: "#8d8d8d", border: "2px solid #3a3a3a" }
                      }
                    >
                      {initialOf(client.name)}
                    </span>
                    <span
                      className="mt-2 text-[12px] font-semibold truncate max-w-[80px]"
                      style={{ color: selected ? BLAZE : "#8d8d8d" }}
                    >
                      {firstName(client.name)}
                    </span>
                    {selected ? (
                      <span className="mt-0.5 text-[10px] font-medium" style={{ color: BLAZE }}>
                        {client.has_plan ? "● con plan" : "sin plan"}
                      </span>
                    ) : (
                      <span className="mt-0.5 text-[10px] text-transparent">.</span>
                    )}
                  </button>
                )
              })}
            </div>

            <p className="mt-6 text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: BLAZE }}>
              Días
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DAYS_PER_WEEK_OPTIONS.map((days) => {
                const active = Number(form.days_per_week) === days
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, days_per_week: days }))}
                    className="h-11 min-w-[48px] px-4 rounded-2xl text-sm font-bold"
                    style={
                      active
                        ? { backgroundColor: BLAZE, color: "#fff" }
                        : { backgroundColor: "transparent", color: "#cfcfcf", border: "1px solid rgba(255,255,255,0.15)" }
                    }
                  >
                    {days}
                  </button>
                )
              })}
            </div>

            <p className="mt-6 text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: BLAZE }}>
              Objetivo
            </p>
            <div ref={objectiveRef} className="relative mt-3">
              <button
                type="button"
                onClick={() => setOpenObjectives((open) => !open)}
                className="w-full min-h-12 rounded-2xl bg-black border border-white/10 px-3 py-2 text-left flex items-center gap-2"
              >
                <div className="flex-1 flex flex-wrap gap-1.5 min-h-[28px] items-center">
                  {selectedObjectives.length === 0 ? (
                    <span className="text-sm text-slate-500 px-1">Elegí hasta 3 objetivos</span>
                  ) : (
                    selectedObjectives.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                        style={{ backgroundColor: "rgba(255,92,0,0.16)", color: BLAZE }}
                      >
                        {item}
                        <span
                          role="button"
                          tabIndex={0}
                          className="inline-flex"
                          onClick={(event) => {
                            event.stopPropagation()
                            removeObjective(item)
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              event.stopPropagation()
                              removeObjective(item)
                            }
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </span>
                      </span>
                    ))
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openObjectives ? "rotate-180" : ""}`}
                />
              </button>
              {openObjectives ? (
                <div className="absolute z-20 mt-2 w-full rounded-2xl bg-[#111] border border-white/10 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
                  <p className="px-2 pb-2 text-[11px] text-slate-500">
                    {selectedObjectives.length}/3 seleccionados
                  </p>
                  {OBJECTIVE_OPTIONS.map((item) => {
                    const active = selectedObjectives.includes(item)
                    const locked = !active && selectedObjectives.length >= 3
                    return (
                      <button
                        key={item}
                        type="button"
                        disabled={locked}
                        onClick={() => toggleObjective(item)}
                        className="w-full h-10 px-3 rounded-xl text-left text-sm flex items-center justify-between disabled:opacity-35"
                        style={active ? { backgroundColor: "rgba(255,92,0,0.16)", color: BLAZE } : { color: "#f4f4f5" }}
                      >
                        <span>{item}</span>
                        {active ? <Check className="w-4 h-4" strokeWidth={2.6} /> : null}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-between px-0.5">
              {WEEKDAYS.map((day) => {
                const session = sessionForDay(form.sessions, day.key)
                const isActive = activeWeekday === day.key && Boolean(session)
                const hasSession = Boolean(session)
                const shortTitle = String(session?.title || "").split(" ")[0]
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => handleWeekdayTap(day.key)}
                    className="flex flex-col items-center min-w-[36px] bg-transparent"
                  >
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold border-2"
                      style={
                        isActive
                          ? { backgroundColor: BLAZE, color: "#080809", borderColor: BLAZE, boxShadow: `0 0 14px ${BLAZE_GLOW}` }
                          : hasSession
                            ? { backgroundColor: "transparent", color: "#fff", borderColor: BLAZE }
                            : { backgroundColor: "transparent", color: "#8d8d8d", borderColor: "#3a3a3a" }
                      }
                    >
                      {day.label}
                    </span>
                    <span
                      className="mt-1 text-[9px] font-semibold max-w-[44px] truncate"
                      style={{ color: hasSession ? BLAZE : "transparent" }}
                    >
                      {shortTitle || "."}
                    </span>
                  </button>
                )
              })}
            </div>

            {form.sessions.length > Number(form.days_per_week) ? (
              <p className="mt-2 text-[12px]" style={{ color: BLAZE }}>
                Hay días de más. Quitá {form.sessions.length - Number(form.days_per_week)} para coincidir con el plan.
              </p>
            ) : null}

            {activeSession ? (
              <section
                className="mt-4 rounded-[28px] bg-black p-4 border"
                style={{ borderColor: "rgba(255,92,0,0.7)", boxShadow: `0 0 28px ${BLAZE_GLOW}` }}
              >
                <h2 className="font-display font-black italic tracking-tight text-[26px] leading-tight text-white">
                  Día {activeSession.day_number} · {activeSession.title || DAY_NAMES[activeSession.weekday]}
                </h2>
                <p className="mt-1 text-[13px] font-medium" style={{ color: BLAZE }}>
                  {namedExercises} {namedExercises === 1 ? "ejercicio" : "ejercicios"}
                </p>
                <input
                  list="session-titles"
                  value={activeSession.title}
                  onChange={(e) =>
                    updateSession(activeSession.weekday, (current) => ({ ...current, title: e.target.value }))
                  }
                  placeholder="Título del día · Empuje, Tirón, Piernas..."
                  className="mt-3 w-full h-11 rounded-xl bg-black border border-white/10 px-3 text-[#f4f4f5]"
                />

                <div className="mt-3 space-y-3">
                  {activeSession.exercises.map((exercise, index) => {
                    const filled = Boolean(String(exercise.name || "").trim())
                    const meta = resolveExerciseMeta(exercise)
                    const hasMuscle = Boolean(String(exercise.muscle || "").trim())
                    return (
                      <div key={`${activeSession.weekday}-${index}`} className="rounded-2xl bg-black border border-white/10 overflow-hidden">
                        <div className="flex items-center gap-3 p-2.5">
                          <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-[#1a1a1a]">
                            {filled ? (
                              <ExercisePhoto
                                name={exercise.name}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : hasMuscle ? (
                              <MuscleMap
                                primary={meta.primary}
                                view={meta.preferredView}
                                className="h-full w-full"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <input
                              list="exercise-names"
                              value={exercise.name}
                              onChange={(e) => {
                                const nextName = e.target.value
                                const suggested = suggestedMuscleLabel(nextName)
                                updateSession(activeSession.weekday, (current) => ({
                                  ...current,
                                  exercises: current.exercises.map((item, i) =>
                                    i === index
                                      ? { ...item, name: nextName, muscle: suggested || item.muscle }
                                      : item
                                  ),
                                }))
                              }}
                              placeholder="Nombre del ejercicio"
                              className="w-full bg-transparent border-0 outline-none text-[15px] font-black italic text-white placeholder:text-slate-500 placeholder:not-italic placeholder:font-normal"
                            />
                            <p className="text-[12px] text-slate-400">
                              {exercise.sets || 0}x{exercise.reps || "—"}
                              {exercise.rest_seconds ? ` · ${exercise.rest_seconds}s` : ""}
                            </p>
                          </div>
                          {filled ? (
                            <span
                              className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: BLAZE }}
                            >
                              <Check className="w-4 h-4 text-black" strokeWidth={2.6} />
                            </span>
                          ) : (
                            <span className="h-7 w-7 rounded-full border border-white/20 shrink-0" />
                          )}
                          <div className="flex flex-col shrink-0">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveExercise(activeSession.weekday, index, -1)}
                              className="h-6 w-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-25"
                              aria-label="Subir ejercicio"
                            >
                              <ChevronUp className="w-4 h-4" strokeWidth={2.4} />
                            </button>
                            <button
                              type="button"
                              disabled={index === activeSession.exercises.length - 1}
                              onClick={() => moveExercise(activeSession.weekday, index, 1)}
                              className="h-6 w-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-25"
                              aria-label="Bajar ejercicio"
                            >
                              <ChevronDown className="w-4 h-4" strokeWidth={2.4} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateSession(activeSession.weekday, (current) => ({
                                ...current,
                                exercises: current.exercises.filter((_, i) => i !== index),
                              }))
                            }
                            className="text-slate-500 hover:text-red-400"
                            aria-label="Quitar ejercicio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="px-2.5 pb-2.5 grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            min={1}
                            value={exercise.sets}
                            onChange={(e) =>
                              updateSession(activeSession.weekday, (current) => ({
                                ...current,
                                exercises: current.exercises.map((item, i) =>
                                  i === index ? { ...item, sets: Number(e.target.value) || 1 } : item
                                ),
                              }))
                            }
                            className="h-9 rounded-xl bg-black border border-white/10 px-2 text-sm text-[#f4f4f5]"
                            aria-label="Series"
                          />
                          <input
                            value={exercise.reps}
                            onChange={(e) =>
                              updateSession(activeSession.weekday, (current) => ({
                                ...current,
                                exercises: current.exercises.map((item, i) =>
                                  i === index ? { ...item, reps: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="8-10"
                            className="h-9 rounded-xl bg-black border border-white/10 px-2 text-sm text-[#f4f4f5]"
                            aria-label="Reps"
                          />
                          <input
                            type="number"
                            min={0}
                            value={exercise.rest_seconds}
                            onChange={(e) =>
                              updateSession(activeSession.weekday, (current) => ({
                                ...current,
                                exercises: current.exercises.map((item, i) =>
                                  i === index ? { ...item, rest_seconds: Number(e.target.value) || 0 } : item
                                ),
                              }))
                            }
                            className="h-9 rounded-xl bg-black border border-white/10 px-2 text-sm text-[#f4f4f5]"
                            aria-label="Descanso"
                          />
                        </div>
                        <div className="px-2.5 pb-2.5 grid grid-cols-[1fr_110px_52px] gap-2 items-center">
                          <input
                            value={exercise.tip}
                            onChange={(e) =>
                              updateSession(activeSession.weekday, (current) => ({
                                ...current,
                                exercises: current.exercises.map((item, i) =>
                                  i === index ? { ...item, tip: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="Consigna / tip del coach"
                            className="h-9 rounded-xl bg-black border border-white/10 px-3 text-sm text-[#f4f4f5]"
                          />
                          <input
                            list="muscle-options"
                            value={exercise.muscle}
                            onChange={(e) =>
                              updateSession(activeSession.weekday, (current) => ({
                                ...current,
                                exercises: current.exercises.map((item, i) =>
                                  i === index ? { ...item, muscle: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="Músculo"
                            className="h-9 rounded-xl bg-black border border-white/10 px-2 text-sm text-[#f4f4f5]"
                          />
                          <div className="h-9 w-[52px] rounded-xl overflow-hidden bg-[#1a1a1a]">
                            {hasMuscle ? (
                              <MuscleMap
                                primary={meta.primary}
                                view={meta.preferredView}
                                className="h-full w-full"
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateSession(activeSession.weekday, (current) => ({
                      ...current,
                      exercises: [...current.exercises, emptyExercise()],
                    }))
                  }
                  className="mt-3 w-full h-11 rounded-2xl text-sm font-semibold border border-dashed"
                  style={{ borderColor: BLAZE, color: BLAZE }}
                >
                  + Agregar ejercicio
                </button>
                <button
                  type="button"
                  onClick={() => setPendingRemoveDay(activeSession.weekday)}
                  className="mt-2 w-full h-10 text-sm text-slate-500 hover:text-red-400"
                >
                  Quitar día
                </button>
              </section>
            ) : (
              <section
                className="mt-4 rounded-[28px] bg-black p-5 text-center border"
                style={{ borderColor: "rgba(255,92,0,0.35)" }}
              >
                <p className="font-black italic text-white">Elegí un día de la semana</p>
                <p className="mt-2 text-sm text-slate-500">
                  Tocá un círculo para cargar esa sesión.
                </p>
                {form.sessions.length < Number(form.days_per_week) ? (
                  <button
                    type="button"
                    onClick={addNextDay}
                    className="mt-4 w-full h-11 rounded-full text-sm font-black italic text-white"
                    style={{ backgroundColor: BLAZE }}
                  >
                    Agregar día {form.sessions.length + 1} de {form.days_per_week}
                  </button>
                ) : null}
              </section>
            )}

            <datalist id="session-titles">
              {SESSION_TITLES.map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
            <datalist id="exercise-names">
              {EXERCISE_SUGGESTIONS.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <datalist id="muscle-options">
              {MUSCLE_OPTIONS.map((muscle) => (
                <option key={muscle} value={muscle} />
              ))}
            </datalist>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full h-14 rounded-full text-white text-[16px] font-black italic uppercase tracking-wide disabled:opacity-60"
              style={{ backgroundColor: BLAZE, boxShadow: `0 0 28px ${BLAZE_GLOW}` }}
            >
              {saving ? "Guardando..." : "Guardar plan"}
            </button>
            <p className="mt-2 text-center text-[12px] text-slate-500">
              {selectedClient
                ? `${firstName(selectedClient.name)} ya lo va a ver en su app.`
                : "La alumna ya lo va a ver en su app."}
            </p>
            {selectedClient?.has_plan ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="mt-3 w-full h-11 text-sm text-slate-500 hover:text-red-400"
              >
                Eliminar plan
              </button>
            ) : null}
          </>
        )}
      </div>

      <ToastHost toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog
        open={pendingRemoveDay != null}
        title={`¿Quitar el día ${pendingDayLabel || ""}?`}
        body="El día se queda hasta que confirmes. Si lo quitás, se pierde lo que cargaste en esa sesión."
        cancelLabel="Dejarlo"
        confirmLabel="Quitar"
        tone="danger"
        onCancel={() => setPendingRemoveDay(null)}
        onConfirm={() => {
          removeDay(pendingRemoveDay)
          setPendingRemoveDay(null)
        }}
      />
      <ConfirmDialog
        open={pendingDeletePlan}
        title={`¿Eliminar el plan de ${firstName(selectedClient?.name)}?`}
        body="Esta acción saca el plan de la alumna. No se puede deshacer."
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        tone="danger"
        onCancel={() => setPendingDeletePlan(false)}
        onConfirm={confirmDeletePlan}
      />
    </div>
  )
}
