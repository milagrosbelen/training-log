import { useEffect, useMemo, useState } from "react"
import { Check, ChevronDown, Wind } from "lucide-react"
import { getMilagrosYogaProgress, recordQuickYogaPractice } from "../../services/milagrosYogaService"

const BLAZE = "#FF5C00"

export default function QuickYogaDaySection() {
  const [poses, setPoses] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [newName, setNewName] = useState("")
  const [stage, setStage] = useState(0)
  const [breathing, setBreathing] = useState(false)
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const selectedPose = useMemo(
    () => poses.find((pose) => String(pose.id) === String(selectedId)) || null,
    [poses, selectedId]
  )

  const load = async () => {
    try {
      const items = await getMilagrosYogaProgress()
      setPoses(Array.isArray(items) ? items : [])
    } catch {
      setError("No se pudieron cargar las poses guardadas.")
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    setStage(0)
    setBreathing(false)
  }, [selectedId])

  const submit = async (event) => {
    event.preventDefault()
    if (!selectedId && !newName.trim()) {
      setError("Elegí una pose o escribí una nueva.")
      return
    }
    setSaving(true)
    setError("")
    setMessage("")
    try {
      await recordQuickYogaPractice({
        exercise_id: selectedId ? Number(selectedId) : undefined,
        name: selectedId ? undefined : newName.trim(),
        reached_stage: Number(stage),
        deep_breathing_done: breathing,
        notes: notes.trim(),
      })
      await load()
      setSelectedId("")
      setNewName("")
      setStage(0)
      setBreathing(false)
      setNotes("")
      setMessage("Práctica de hoy guardada.")
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudo guardar la práctica.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-8 rounded-[26px] border bg-black p-5" style={{ borderColor: "rgba(255,92,0,0.55)" }}>
      <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
        Yoga de hoy
      </p>
      <h2 className="mt-2 font-display font-black italic tracking-tight text-[28px] leading-tight text-white">
        Registrar lo que practicaste
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        No hace falta preparar una rutina. Elegí una pose, practicá y guardá cómo te fue hoy.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="relative">
          <select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setNewName("") }} className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#141414] px-3 pr-9 text-sm text-white outline-none focus:border-[#FF5C00]">
            <option value="">Elegir pose guardada...</option>
            {poses.map((pose) => <option key={pose.id} value={pose.id}>{pose.name}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-500" />
        </div>
        <input value={newName} onChange={(event) => { setNewName(event.target.value); setSelectedId("") }} placeholder="O escribí una pose nueva" className="h-12 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 text-sm text-white outline-none focus:border-[#FF5C00]" />

        {selectedPose ? (
          <div className="rounded-2xl border border-white/10 p-3">
            <p className="text-xs font-semibold text-slate-400">Progreso anterior: {selectedPose.reached_stage}/{selectedPose.stage_count} etapas</p>
            <div className="relative mt-2">
              <select value={stage} onChange={(event) => setStage(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#141414] px-3 pr-9 text-sm text-white">
                <option value={0}>No avancé hoy</option>
                {selectedPose.stages.map((item) => <option key={item.id} value={item.sort_order}>Llegué a etapa {item.sort_order}: {item.title}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-500" />
            </div>
          </div>
        ) : null}

        <label className="flex items-center gap-2 text-sm text-white">
          <input type="checkbox" checked={breathing} onChange={(event) => setBreathing(event.target.checked)} className="h-4 w-4 accent-[#FF5C00]" />
          <Wind className="h-4 w-4" style={{ color: BLAZE }} />
          Hice 3 respiraciones profundas
        </label>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Cómo te fue hoy" className="w-full resize-none rounded-2xl border border-white/10 bg-[#141414] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FF5C00]" />
        <button type="submit" disabled={saving} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black italic disabled:opacity-50" style={{ backgroundColor: BLAZE, color: "#080809" }}>
          <Check className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar práctica de hoy"}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      {message ? <p className="mt-3 text-sm" style={{ color: BLAZE }}>{message}</p> : null}
    </section>
  )
}
