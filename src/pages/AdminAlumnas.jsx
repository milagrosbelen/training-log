import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import { createAlumna, getAlumnas, peekAlumnas, updateAlumna } from "../services/alumnaService"
import { btnGhost, fieldClass } from "../components/AuthFrame"
import { ToastHost } from "../components/Toast"
import BrandLogo from "../components/BrandLogo"
import { TRAINING_GYM, TRAINING_TYPES, trainingTypeMeta } from "../utils/trainingType"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.45)"

function initialOf(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "A"
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function AdminAlumnas() {
  const [alumnas, setAlumnas] = useState(() => peekAlumnas() || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState(null)
  const [form, setForm] = useState({ name: "", username: "", pin: "", training_type: TRAINING_GYM })
  const [toast, setToast] = useState(null)
  const [pinTarget, setPinTarget] = useState(null)
  const [newPin, setNewPin] = useState("")
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  const load = async () => {
    setError("")
    try {
      const list = await getAlumnas()
      setAlumnas(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudieron cargar las alumnas.")
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return alumnas
    return alumnas.filter((alumna) => {
      const name = String(alumna.name || "").toLowerCase()
      const username = String(alumna.username || "").toLowerCase()
      return name.includes(q) || username.includes(q)
    })
  }, [alumnas, query])

  const withPlan = alumnas.filter((alumna) => alumna.has_plan).length
  const withoutPlan = alumnas.length - withPlan

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    const createdName = form.name.trim()
    try {
      const result = await createAlumna(form)
      setCredentials(result.credentials ?? null)
      setForm({ name: "", username: "", pin: "", training_type: TRAINING_GYM })
      setShowCreate(false)
      setToast({ message: `${createdName} ya está en el estudio.`, type: "success" })
      await load()
    } catch (err) {
      setError(
        err.response?.data?.errors?.username?.[0]
        ?? err.response?.data?.errors?.pin?.[0]
        ?? err.response?.data?.message
        ?? "No se pudo crear la alumna."
      )
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (alumna) => {
    try {
      await updateAlumna(alumna.id, { is_active: !alumna.is_active })
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudo actualizar.")
    }
  }

  const handleNewPin = async (e) => {
    e.preventDefault()
    if (!pinTarget) return
    const pin = newPin.replace(/\D/g, "").slice(0, 6)
    if (pin.length < 4) {
      setError("El PIN debe tener 4 a 6 números.")
      return
    }
    try {
      const result = await updateAlumna(pinTarget.id, { pin })
      setCredentials(result.credentials ?? { username: pinTarget.username, pin })
      setToast({ message: `Nuevo PIN listo para ${pinTarget.name}.`, type: "success" })
      setPinTarget(null)
      setNewPin("")
      await load()
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudo cambiar el PIN.")
    }
  }

  return (
    <div className="space-y-5 pb-8 pt-7">
      <div className="flex items-center justify-between">
        <BrandLogo size="wide" className="-ml-2" />
        <p className="text-[11px] font-semibold tracking-[0.28em] text-white uppercase">Panel</p>
      </div>

      <div>
        <h1 className="font-display font-black italic tracking-tight text-[48px] leading-none text-white">
          Alumnas
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Estudio · {alumnas.length} {alumnas.length === 1 ? "cuenta" : "cuentas"}
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { value: alumnas.length, label: "alumnas", accent: true },
          { value: withPlan, label: "con plan", accent: false },
          { value: withoutPlan, label: "sin plan", accent: true },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-[18px] bg-black px-3 py-4 text-center border"
            style={{ borderColor: "rgba(255,92,0,0.55)", boxShadow: "0 0 16px rgba(255,92,0,0.1)" }}
          >
            <p
              className="font-display font-black italic tracking-tight text-[28px] leading-none"
              style={{ color: stat.accent ? BLAZE : "#fff" }}
            >
              {stat.value}
            </p>
            <p className="mt-1.5 text-[12px] italic text-white/85">{stat.label}</p>
          </article>
        ))}
      </div>

      <label className="flex items-center gap-3 h-12 rounded-full bg-[#141414] border border-white/10 px-4">
        <Search className="w-4 h-4 shrink-0" style={{ color: BLAZE }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar alumna..."
          className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder:text-slate-500"
        />
      </label>

      {credentials && (
        <section
          className="rounded-[24px] bg-black p-5 border"
          style={{ borderColor: "rgba(255,92,0,0.7)", boxShadow: `0 0 24px ${BLAZE_GLOW}` }}
        >
          <p className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ color: BLAZE }}>
            Datos de acceso
          </p>
          <p className="mt-3 text-2xl font-black italic text-white">{credentials.username}</p>
          <p className="mt-1 text-3xl font-black tracking-[0.2em]" style={{ color: BLAZE }}>{credentials.pin}</p>
          <p className="mt-3 text-xs text-slate-400">Copialo ahora. El PIN no se vuelve a mostrar.</p>
        </section>
      )}

      {alumnas.length === 0 && (
        <p className="text-slate-500 text-sm leading-relaxed">
          Todavía no hay alumnas. Cargá la primera abajo.
        </p>
      )}

      {filtered.map((alumna) => {
        const needsPlan = !alumna.has_plan
        const typeMeta = trainingTypeMeta(alumna)
        return (
          <article
            key={alumna.id}
            className="rounded-[24px] bg-black p-5"
            style={
              needsPlan
                ? { border: "1.5px solid rgba(255,92,0,0.85)", boxShadow: `0 0 28px ${BLAZE_GLOW}` }
                : { border: "1px solid rgba(255,255,255,0.12)" }
            }
          >
            <div className="flex items-start gap-3">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0"
                style={{ backgroundColor: BLAZE, color: "#080809" }}
              >
                {initialOf(alumna.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black italic text-white truncate leading-tight">{alumna.name}</h3>
                <p className="text-sm text-slate-500">@{alumna.username}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span
                    className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ borderColor: BLAZE, color: BLAZE }}
                  >
                    {alumna.has_plan ? "Plan listo" : "Sin plan"}
                  </span>
                  <span className="rounded-full border border-white/40 px-2.5 py-0.5 text-[11px] font-semibold text-white/85">
                    {typeMeta.short}
                  </span>
                  {alumna.is_active ? (
                    <span className="rounded-full border border-white/40 px-2.5 py-0.5 text-[11px] font-semibold text-white/85">
                      Activa
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                      Inactiva
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              to={`/admin/plan?alumna=${alumna.id}`}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl text-[16px] font-black italic"
              style={{ backgroundColor: BLAZE, color: "#080809", boxShadow: `0 0 20px ${BLAZE_GLOW}` }}
            >
              {alumna.has_plan ? "Abrir plan" : "Crear plan"}
            </Link>
            <div className="mt-3 flex items-center justify-center gap-3 text-[13px] text-slate-500">
              <button
                type="button"
                className="hover:text-white transition-colors"
                onClick={() => {
                  setPinTarget(alumna)
                  setNewPin("")
                  setError("")
                }}
              >
                Nuevo PIN
              </button>
              <span className="text-white/20">|</span>
              <button
                type="button"
                className="hover:text-white transition-colors"
                onClick={() => handleToggle(alumna)}
              >
                {alumna.is_active ? "Desactivar" : "Activar"}
              </button>
            </div>
          </article>
        )
      })}

      {showCreate ? (
        <section
          className="rounded-[24px] bg-black p-5 border"
          style={{ borderColor: "rgba(255,92,0,0.55)" }}
        >
          <p className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ color: BLAZE }}>
            Nueva cuenta
          </p>
          <h2 className="mt-1 text-xl font-black italic text-white">Agregar alumna</h2>
          <form onSubmit={handleCreate} className="mt-5 space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nombre"
              required
              className={fieldClass}
            />
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
              placeholder="usuario"
              required
              className={fieldClass}
            />
            <input
              value={form.pin}
              onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
              placeholder="PIN (4 a 6 números)"
              inputMode="numeric"
              required
              className={fieldClass}
            />
            <div>
              <p className="mb-2 text-[11px] tracking-[0.18em] uppercase font-semibold text-slate-400">
                Tipo de entrenamiento
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TRAINING_TYPES.map((type) => {
                  const active = form.training_type === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, training_type: type.id }))}
                      className="rounded-2xl border px-3 py-3 text-left"
                      style={
                        active
                          ? { borderColor: BLAZE, backgroundColor: "rgba(255,92,0,0.12)", boxShadow: `0 0 16px ${BLAZE_GLOW}` }
                          : { borderColor: "rgba(255,255,255,0.12)", backgroundColor: "transparent" }
                      }
                    >
                      <p className="text-sm font-black italic text-white">{type.label}</p>
                      <p className="mt-1 text-[11px] leading-snug text-slate-400">{type.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-full text-white text-[15px] font-black italic uppercase disabled:opacity-60"
              style={{ backgroundColor: BLAZE, boxShadow: `0 0 22px ${BLAZE_GLOW}` }}
            >
              {saving ? "Creando..." : "Crear alumna"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="w-full h-10 text-sm text-slate-500"
            >
              Cancelar
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="w-full h-14 rounded-full text-white text-[16px] font-black italic uppercase tracking-wide flex items-center justify-center gap-2"
          style={{ backgroundColor: BLAZE, boxShadow: `0 0 28px ${BLAZE_GLOW}` }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.6} />
          Agregar alumna
        </button>
      )}

      {pinTarget && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Cerrar"
            onClick={() => setPinTarget(null)}
          />
          <form
            onSubmit={handleNewPin}
            className="relative w-full max-w-sm rounded-[28px] bg-black border p-6"
            style={{ borderColor: "rgba(255,92,0,0.45)" }}
          >
            <p className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ color: BLAZE }}>Nuevo PIN</p>
            <h2 className="mt-2 text-2xl font-black italic text-white">{pinTarget.name}</h2>
            <p className="mt-1 text-sm text-slate-400">@{pinTarget.username} · 4 a 6 números</p>
            <input
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••"
              inputMode="numeric"
              autoFocus
              className={`${fieldClass} mt-5 tracking-[0.35em]`}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setPinTarget(null)} className={`${btnGhost} h-12 text-sm`}>
                Cancelar
              </button>
              <button
                type="submit"
                className="h-12 rounded-full text-sm font-black italic text-white"
                style={{ backgroundColor: BLAZE }}
              >
                Guardar PIN
              </button>
            </div>
          </form>
        </div>
      )}

      <ToastHost toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
