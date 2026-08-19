import { useEffect, useMemo, useState } from "react"
import { ImagePlus, Plus, Save, Trash2 } from "lucide-react"
import BrandLogo from "../components/BrandLogo"
import { getAlumnas } from "../services/alumnaService"
import { createMilagrosYogaExercise } from "../services/milagrosYogaService"
import { usesPoseLadder } from "../utils/trainingType"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.45)"
const fieldClass = "w-full h-12 rounded-2xl bg-[#141414] border border-white/10 px-4 text-sm text-white outline-none focus:border-[#FF5C00]"

const emptyStage = () => ({ title: "", description: "" })

export default function AdminMilagrosYoga() {
  const [alumnas, setAlumnas] = useState([])
  const [form, setForm] = useState({ name: "", description: "", image: null, stages: [emptyStage()] })
  const [preview, setPreview] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    getAlumnas()
      .then((items) => setAlumnas(Array.isArray(items) ? items : []))
      .catch(() => setError("No se pudo cargar el perfil de Milagros."))
  }, [])

  const milagros = useMemo(() => alumnas.find((alumna) => usesPoseLadder(alumna)), [alumnas])

  const updateStage = (index, key, value) => {
    setForm((current) => ({
      ...current,
      stages: current.stages.map((stage, stageIndex) => (
        stageIndex === index ? { ...stage, [key]: value } : stage
      )),
    }))
  }

  const handleImage = (event) => {
    const image = event.target.files?.[0] ?? null
    setError("")
    if (!image) return
    if (image.size > 10 * 1024 * 1024) {
      event.target.value = ""
      setError("La imagen debe pesar menos de 10 MB.")
      return
    }
    setForm((current) => ({ ...current, image }))
    setPreview(URL.createObjectURL(image))
  }

  const resetForm = () => {
    setForm({ name: "", description: "", image: null, stages: [emptyStage()] })
    setPreview("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!milagros) {
      setError("No se encontró el perfil de Milagros.")
      return
    }
    const stages = form.stages.filter((stage) => stage.title.trim())
    if (!stages.length) {
      setError("Agregá al menos una etapa.")
      return
    }
    setSaving(true)
    setError("")
    setMessage("")
    try {
      await createMilagrosYogaExercise({
        userId: milagros.id,
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image,
        stages: stages.map((stage) => ({
          title: stage.title.trim(),
          description: stage.description.trim(),
        })),
      })
      resetForm()
      setMessage("Pose guardada para Milagros.")
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudo guardar la pose.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-8 pt-7">
      <div className="flex items-center justify-between">
        <BrandLogo size="wide" className="-ml-2" />
        <p className="text-[11px] font-semibold tracking-[0.28em] text-white uppercase">Yoga</p>
      </div>

      <div>
        <h1 className="font-display font-black italic tracking-tight text-[44px] leading-none text-white">
          Biblioteca
        </h1>
        <p className="mt-2 text-sm text-slate-400">Progresiones individuales de Milagros.</p>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm" style={{ color: BLAZE }}>{message}</p> : null}

      {!milagros ? (
        <section className="rounded-[24px] bg-black p-5 border border-white/10 text-sm text-slate-400">
          No se encontró una cuenta identificada como Milagros.
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="rounded-[24px] bg-black p-5 border" style={{ borderColor: "rgba(255,92,0,0.55)" }}>
            <p className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ color: BLAZE }}>
              Nueva pose · {milagros.name}
            </p>
            <div className="mt-4 space-y-3">
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nombre de la pose"
                className={fieldClass}
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Descripción breve"
                rows={3}
                className="w-full rounded-2xl bg-[#141414] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-[#FF5C00] resize-none"
              />
            </div>
          </section>

          <section className="rounded-[24px] bg-black p-5 border border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ color: BLAZE }}>Imagen</p>
                <p className="mt-1 text-xs text-slate-500">JPG, PNG o WebP · máximo 10 MB</p>
              </div>
              <label className="flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold cursor-pointer" style={{ backgroundColor: BLAZE, color: "#080809" }}>
                <ImagePlus className="h-4 w-4" />
                Elegir foto
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" />
              </label>
            </div>
            {preview ? <img src={preview} alt="Vista previa de la pose" className="mt-4 h-48 w-full rounded-2xl object-cover" /> : null}
          </section>

          <section className="rounded-[24px] bg-black p-5 border border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ color: BLAZE }}>Etapas</p>
                <p className="mt-1 text-xs text-slate-500">Se guardan en este orden.</p>
              </div>
              <button type="button" onClick={() => setForm((current) => ({ ...current, stages: [...current.stages, emptyStage()] }))} className="flex h-9 items-center gap-1.5 rounded-full border border-white/20 px-3 text-xs font-semibold text-white">
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {form.stages.map((stage, index) => (
                <div key={index} className="rounded-2xl border border-white/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold" style={{ color: BLAZE }}>Etapa {index + 1}</p>
                    {form.stages.length > 1 ? <button type="button" onClick={() => setForm((current) => ({ ...current, stages: current.stages.filter((_, stageIndex) => stageIndex !== index) }))} aria-label={`Eliminar etapa ${index + 1}`} className="text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button> : null}
                  </div>
                  <input required value={stage.title} onChange={(event) => updateStage(index, "title", event.target.value)} placeholder="Título de la etapa" className={`${fieldClass} mt-3`} />
                  <textarea value={stage.description} onChange={(event) => updateStage(index, "description", event.target.value)} placeholder="Qué tiene que lograr" rows={2} className="mt-2 w-full rounded-2xl bg-[#141414] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-[#FF5C00] resize-none" />
                </div>
              ))}
            </div>
          </section>

          <button disabled={saving} type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-black italic disabled:opacity-50" style={{ backgroundColor: BLAZE, color: "#080809", boxShadow: `0 0 20px ${BLAZE_GLOW}` }}>
            <Save className="h-5 w-5" />
            {saving ? "Guardando..." : "Guardar pose"}
          </button>
        </form>
      )}
    </div>
  )
}