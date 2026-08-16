import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Headphones, Plus, Trash2 } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { ToastHost } from "../Toast"
import ConfirmDialog from "../ConfirmDialog"
import ExercisePhoto from "../ExercisePhoto"
import { btnCreate, btnDanger } from "../AuthFrame"
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
} from "../../utils/planUtils"
import {
  getClients,
  peekClients,
  peekClientPlan,
  getClientPlan,
  saveClientPlan,
  deleteClientPlan,
} from "../../services/planService"

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
    objective: plan.objective || "",
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
  const [collapsedDays, setCollapsedDays] = useState({})

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
      setForm(formFromPlan(cached))
      setCollapsedDays({})
    }
    getClientPlan(selectedUserId)
      .then((plan) => {
        setForm(formFromPlan(plan))
        setCollapsedDays({})
      })
      .catch((err) => {
        setError(err.response?.data?.message ?? "No se pudo cargar el plan.")
      })
  }, [selectedUserId])

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
    setCollapsedDays((prev) => ({ ...prev, [weekday]: false }))
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

  const changeWeekday = (from, to) => {
    const weekday = Number(to)
    if (from === weekday) return
    if (sessionForDay(form.sessions, weekday)) {
      setToast({ message: "Ese día ya está en el plan.", type: "error" })
      return
    }
    setForm((prev) => ({
      ...prev,
      sessions: prev.sessions
        .map((session) => (session.weekday === from ? { ...session, weekday } : session))
        .sort((a, b) => a.weekday - b.weekday),
    }))
    setCollapsedDays((prev) => {
      const next = { ...prev }
      next[weekday] = prev[from]
      delete next[from]
      return next
    })
  }

  const toggleCollapse = (weekday) => {
    setCollapsedDays((prev) => ({ ...prev, [weekday]: !prev[weekday] }))
  }

  const handleSave = async () => {
    if (!selectedUserId) return
    if (!String(form.objective || "").trim()) {
      setToast({ message: "Indicá el objetivo del plan.", type: "error" })
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
        objective: String(form.objective).trim(),
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

  return (
    <div className="font-sans pb-8">
      <div>
        <p className="text-[13px] text-gold tracking-wide">Vista de coach</p>
        <h1 className="font-serif text-[36px] leading-none text-white mt-1">Cargar plan</h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Primero definí cuántos días va a ir y el objetivo. Después cargás cada día con los ejercicios de esa sesión.
        </p>

        {error ? (
          <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm">
            {error}
          </div>
        ) : null}

        {!clients.length ? (
          <section className="mt-8 rounded-[28px] bg-ink-200 border border-white/5 px-5 py-10 text-center">
            <Headphones className="w-8 h-8 text-gold mx-auto" />
            <p className="mt-4 text-[#cfcfcf]">Todavía no hay alumnas.</p>
            <p className="mt-2 text-sm text-slate-500">
              Creá una alumna en el panel y después asignale el plan.
            </p>
          </section>
        ) : (
          <>
            <label className="mt-6 block text-sm text-gold">Alumna</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-2 w-full h-12 rounded-2xl bg-ink border border-white/10 px-4 text-[#f4f4f5]"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} · @{client.username || "sin usuario"} {client.has_plan ? "· con plan" : "· sin plan"}
                </option>
              ))}
            </select>

            <p className="mt-8 text-[11px] font-medium tracking-[0.18em] uppercase text-slate-500">
              Cuántos días va a ir
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DAYS_PER_WEEK_OPTIONS.map((days) => {
                const active = Number(form.days_per_week) === days
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, days_per_week: days }))}
                    className={`h-11 min-w-[52px] px-4 rounded-full text-sm font-semibold ${
                      active
                        ? "bg-ember text-white"
                        : "border border-white/15 text-slate-300"
                    }`}
                  >
                    {days}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[12px] text-slate-500">
              {form.days_per_week} {Number(form.days_per_week) === 1 ? "día" : "días"} por semana. Después cargás una sesión por cada día.
            </p>

            <label className="mt-6 block text-sm text-gold">Objetivo</label>
            <input
              list="objective-options"
              value={form.objective}
              onChange={(e) => setForm((prev) => ({ ...prev, objective: e.target.value }))}
              placeholder="Ganar músculo, bajar grasa, fuerza..."
              className="mt-2 w-full h-12 rounded-2xl bg-ink border border-white/10 px-4 text-[#f4f4f5]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {OBJECTIVE_OPTIONS.map((item) => {
                const active = form.objective === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, objective: item }))}
                    className={`h-9 px-3 rounded-full text-[12px] font-medium ${
                      active
                        ? "bg-ember text-white"
                        : "border border-white/15 text-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="text-sm text-gold">
                Semana actual
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={form.week_current}
                  onChange={(e) => setForm((prev) => ({ ...prev, week_current: e.target.value }))}
                  className="mt-2 w-full h-12 rounded-2xl bg-ink border border-white/10 px-4 text-[#f4f4f5]"
                />
              </label>
              <label className="text-sm text-gold">
                Total de semanas
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={form.week_total}
                  onChange={(e) => setForm((prev) => ({ ...prev, week_total: e.target.value }))}
                  className="mt-2 w-full h-12 rounded-2xl bg-ink border border-white/10 px-4 text-[#f4f4f5]"
                />
              </label>
            </div>

            <div className="mt-8 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-slate-500">
                  Sesiones
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {form.sessions.length} de {form.days_per_week} días
                </h2>
                {form.sessions.length > Number(form.days_per_week) ? (
                  <p className="mt-1 text-[12px] text-ember">
                    Hay días de más. Quitá {form.sessions.length - Number(form.days_per_week)} para coincidir con el plan.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {form.sessions.map((session) => {
                const collapsed = Boolean(collapsedDays[session.weekday])
                return (
                  <section key={session.weekday} className="rounded-[24px] bg-ink border border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <select
                        value={session.weekday}
                        onChange={(e) => changeWeekday(session.weekday, e.target.value)}
                        className="h-10 w-[7.5rem] rounded-xl bg-ink border border-white/10 px-2 text-sm text-[#f4f4f5] shrink-0"
                        aria-label="Día de la semana"
                      >
                        {WEEKDAYS.map((day) => (
                          <option key={day.key} value={day.key}>
                            {DAY_NAMES[day.key]}
                          </option>
                        ))}
                      </select>
                      <p className="flex-1 min-w-0 text-base font-semibold text-white truncate">
                        {session.title || `Día ${session.day_number}`}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleCollapse(session.weekday)}
                        className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label={collapsed ? "Expandir día" : "Colapsar día"}
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>

                    {collapsed ? null : (
                      <div className="mt-4 space-y-3">
                        <input
                          list="session-titles"
                          value={session.title}
                          onChange={(e) =>
                            updateSession(session.weekday, (current) => ({ ...current, title: e.target.value }))
                          }
                          placeholder="Título del día · Empuje, Tirón, Piernas..."
                          className="w-full h-11 rounded-xl bg-ink border border-white/10 px-3 text-[#f4f4f5]"
                        />

                        {session.exercises.map((exercise, index) => (
                          <div key={index} className="rounded-2xl bg-ink border border-white/10 overflow-hidden">
                            <div className="relative h-36">
                              {exercise.name.trim() ? (
                                <ExercisePhoto
                                  name={exercise.name}
                                  className="absolute inset-0 h-full w-full object-cover object-center"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-ink-400" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
                                <span className="text-xs text-white/70">Ejercicio {index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSession(session.weekday, (current) => ({
                                      ...current,
                                      exercises: current.exercises.filter((_, i) => i !== index),
                                    }))
                                  }
                                  className="text-white/80 hover:text-[#FF4D4D]"
                                  aria-label="Quitar ejercicio"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="p-3 space-y-2">
                            <input
                              list="exercise-names"
                              value={exercise.name}
                              onChange={(e) =>
                                updateSession(session.weekday, (current) => ({
                                  ...current,
                                  exercises: current.exercises.map((item, i) =>
                                    i === index ? { ...item, name: e.target.value } : item
                                  ),
                                }))
                              }
                              placeholder="Nombre del ejercicio"
                              className="w-full h-10 rounded-xl bg-ink border border-white/10 px-3 text-sm text-[#f4f4f5]"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="number"
                                min={1}
                                value={exercise.sets}
                                onChange={(e) =>
                                  updateSession(session.weekday, (current) => ({
                                    ...current,
                                    exercises: current.exercises.map((item, i) =>
                                      i === index ? { ...item, sets: Number(e.target.value) || 1 } : item
                                    ),
                                  }))
                                }
                                className="h-10 rounded-xl bg-ink border border-white/10 px-2 text-sm text-[#f4f4f5]"
                                aria-label="Series"
                              />
                              <input
                                value={exercise.reps}
                                onChange={(e) =>
                                  updateSession(session.weekday, (current) => ({
                                    ...current,
                                    exercises: current.exercises.map((item, i) =>
                                      i === index ? { ...item, reps: e.target.value } : item
                                    ),
                                  }))
                                }
                                placeholder="8-10"
                                className="h-10 rounded-xl bg-ink border border-white/10 px-2 text-sm text-[#f4f4f5]"
                                aria-label="Reps"
                              />
                              <input
                                type="number"
                                min={0}
                                value={exercise.rest_seconds}
                                onChange={(e) =>
                                  updateSession(session.weekday, (current) => ({
                                    ...current,
                                    exercises: current.exercises.map((item, i) =>
                                      i === index ? { ...item, rest_seconds: Number(e.target.value) || 0 } : item
                                    ),
                                  }))
                                }
                                className="h-10 rounded-xl bg-ink border border-white/10 px-2 text-sm text-[#f4f4f5]"
                                aria-label="Descanso"
                              />
                            </div>
                            <div className="grid grid-cols-[1fr_110px] gap-2">
                              <input
                                value={exercise.tip}
                                onChange={(e) =>
                                  updateSession(session.weekday, (current) => ({
                                    ...current,
                                    exercises: current.exercises.map((item, i) =>
                                      i === index ? { ...item, tip: e.target.value } : item
                                    ),
                                  }))
                                }
                                placeholder="Consigna / tip del coach"
                                className="h-10 rounded-xl bg-ink border border-white/10 px-3 text-sm text-[#f4f4f5]"
                              />
                              <input
                                list="muscle-options"
                                value={exercise.muscle}
                                onChange={(e) =>
                                  updateSession(session.weekday, (current) => ({
                                    ...current,
                                    exercises: current.exercises.map((item, i) =>
                                      i === index ? { ...item, muscle: e.target.value } : item
                                    ),
                                  }))
                                }
                                placeholder="Músculo"
                                className="h-10 rounded-xl bg-ink border border-white/10 px-2 text-sm text-[#f4f4f5]"
                              />
                            </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            updateSession(session.weekday, (current) => ({
                              ...current,
                              exercises: [...current.exercises, emptyExercise()],
                            }))
                          }
                          className={`${btnCreate} w-full h-10 text-sm gap-2`}
                        >
                          <Plus className="w-4 h-4" />
                          Agregar ejercicio
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingRemoveDay(session.weekday)}
                          className={`${btnDanger} w-full h-10 text-sm`}
                        >
                          Quitar día
                        </button>
                      </div>
                    )}
                  </section>
                )
              })}
              {form.sessions.length < Number(form.days_per_week) ? (
                <button
                  type="button"
                  onClick={addNextDay}
                  className={`${btnCreate} w-full h-12 text-sm gap-2`}
                >
                  <Plus className="w-5 h-5" />
                  Agregar día {form.sessions.length + 1} de {form.days_per_week}
                </button>
              ) : (
                <p className="text-center text-[13px] text-slate-500">
                  Ya están los {form.days_per_week} días. En cada uno cargá los ejercicios de esa sesión.
                </p>
              )}
            </div>

            <datalist id="objective-options">
              {OBJECTIVE_OPTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
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
              className={`${btnCreate} mt-6 w-full h-12`}
            >
              {saving ? "Guardando..." : `Guardar plan${selectedClient ? ` de ${firstName(selectedClient.name)}` : ""}`}
            </button>
            {selectedClient?.has_plan ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className={`${btnDanger} mt-3 w-full h-11 text-sm`}
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
