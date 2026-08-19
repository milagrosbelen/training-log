import { useEffect, useState } from "react"
import { Check, ChevronDown, Clock3, Wind } from "lucide-react"
import { apiErrorMessage } from "../../services/api"
import { getMilagrosYogaProgress, recordMilagrosYogaAttempt } from "../../services/milagrosYogaService"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.45)"

function imageUrl(value) {
  if (!value) return ""
  if (/^https?:\/\//.test(value)) return value
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl && /^https?:\/\//.test(apiUrl)) return `${apiUrl.replace(/\/api\/?$/, "")}${value}`
  return value
}

export default function MilagrosYogaProgressSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingId, setSavingId] = useState(null)
  const [forms, setForms] = useState({})

  const load = async () => {
    setError("")
    try {
      setItems(await getMilagrosYogaProgress())
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo cargar tu biblioteca de poses."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateForm = (id, key, value) => {
    setForms((current) => ({
      ...current,
      [id]: { reached_stage: 0, deep_breathing_done: false, notes: "", ...current[id], [key]: value },
    }))
  }

  const submitAttempt = async (exercise) => {
    const form = forms[exercise.id] || {}
    setSavingId(exercise.id)
    setError("")
    try {
      await recordMilagrosYogaAttempt({
        exercise_id: exercise.id,
        reached_stage: Number(form.reached_stage || 0),
        deep_breathing_done: Boolean(form.deep_breathing_done),
        notes: form.notes || "",
      })
      await load()
      setForms((current) => ({ ...current, [exercise.id]: { reached_stage: 0, deep_breathing_done: false, notes: "" } }))
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo guardar el registro."))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="mt-10">
      <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
        Biblioteca de poses
      </p>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        Tu avance se guarda por pose y conserva cada intento.
      </p>
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      {loading ? <p className="mt-5 text-sm text-slate-500">Cargando poses...</p> : null}
      {!loading && !items.length ? (
        <section className="mt-5 rounded-[24px] border bg-black px-5 py-7 text-center" style={{ borderColor: "rgba(255,92,0,0.45)" }}>
          <p className="font-display font-black italic text-2xl text-white">Sin poses todavía</p>
          <p className="mt-2 text-sm text-slate-500">Cuando tu coach agregue una, aparecerá acá.</p>
        </section>
      ) : null}
      <div className="mt-5 space-y-5">
        {items.map((exercise) => {
          const form = forms[exercise.id] || {}
          const statusLabel = exercise.mastered ? "DOMINADA" : exercise.reached_stage > 0 ? "EN PROGRESO" : "SIN REGISTROS TODAVÍA"
          return (
            <article key={exercise.id} className="overflow-hidden rounded-[24px] border bg-black" style={{ borderColor: exercise.mastered ? BLAZE : "rgba(255,92,0,0.45)", boxShadow: exercise.mastered ? `0 0 22px ${BLAZE_GLOW}` : "none" }}>
              {exercise.image_url ? <img src={imageUrl(exercise.image_url)} alt={exercise.name} className="h-48 w-full object-cover" /> : null}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-black italic text-[25px] leading-tight text-white">{exercise.name}</h3>
                    {exercise.description ? <p className="mt-2 text-sm leading-relaxed text-slate-400">{exercise.description}</p> : null}
                  </div>
                  <span className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide" style={{ borderColor: exercise.mastered ? BLAZE : "rgba(255,255,255,0.25)", color: exercise.mastered ? BLAZE : "#fff" }}>{statusLabel}</span>
                </div>

                <div className="mt-5 space-y-2">
                  {exercise.stages.map((stage) => {
                    const reached = stage.sort_order <= exercise.reached_stage
                    return (
                      <div key={stage.id} className="flex items-start gap-3 rounded-2xl border px-3 py-3" style={{ borderColor: reached ? "rgba(255,92,0,0.55)" : "rgba(255,255,255,0.1)" }}>
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]" style={{ borderColor: reached ? BLAZE : "rgba(255,255,255,0.25)", color: reached ? BLAZE : "#7A7A80" }}>{reached ? <Check className="h-3 w-3" /> : stage.sort_order}</span>
                        <div><p className="text-sm font-semibold text-white">{stage.title}</p>{stage.description ? <p className="mt-0.5 text-xs text-slate-500">{stage.description}</p> : null}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BLAZE }}>Registrar intento</p>
                  <label className="mt-3 block text-xs text-slate-400">Hasta qué etapa llegaste</label>
                  <div className="relative mt-1">
                    <select value={form.reached_stage ?? 0} onChange={(event) => updateForm(exercise.id, "reached_stage", event.target.value)} className="h-11 w-full appearance-none rounded-xl bg-[#141414] border border-white/10 px-3 pr-9 text-sm text-white outline-none focus:border-[#FF5C00]">
                      <option value="0">Todavía no pude avanzar</option>
                      {exercise.stages.map((stage) => <option key={stage.id} value={stage.sort_order}>Etapa {stage.sort_order}: {stage.title}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-500" />
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-white">
                    <input type="checkbox" checked={Boolean(form.deep_breathing_done)} onChange={(event) => updateForm(exercise.id, "deep_breathing_done", event.target.checked)} className="h-4 w-4 accent-[#FF5C00]" />
                    <Wind className="h-4 w-4" style={{ color: BLAZE }} />
                    Hice 3 respiraciones profundas
                  </label>
                  <textarea value={form.notes || ""} onChange={(event) => updateForm(exercise.id, "notes", event.target.value)} placeholder="Nota opcional" rows={2} className="mt-3 w-full resize-none rounded-xl bg-[#141414] border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF5C00]" />
                  <button type="button" disabled={savingId === exercise.id} onClick={() => submitAttempt(exercise)} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black italic disabled:opacity-50" style={{ backgroundColor: BLAZE, color: "#080809" }}>
                    <Clock3 className="h-4 w-4" /> {savingId === exercise.id ? "Guardando..." : "Guardar intento"}
                  </button>
                </div>

                <p className="mt-4 text-xs text-slate-500">Historial: {exercise.history?.length || 0} {exercise.history?.length === 1 ? "intento" : "intentos"}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}