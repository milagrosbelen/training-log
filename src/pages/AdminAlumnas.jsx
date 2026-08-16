import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardList, KeyRound, Plus, Power } from "lucide-react"
import { createAlumna, getAlumnas, updateAlumna } from "../services/alumnaService"
import { btnCreate, btnDanger, btnGhost, btnPin, fieldClass } from "../components/AuthFrame"
import { ToastHost } from "../components/Toast"

function initialOf(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "A"
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function AdminAlumnas() {
  const [alumnas, setAlumnas] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState(null)
  const [form, setForm] = useState({ name: "", username: "", pin: "" })
  const [toast, setToast] = useState(null)
  const [pinTarget, setPinTarget] = useState(null)
  const [newPin, setNewPin] = useState("")

  const load = async () => {
    setError("")
    try {
      const list = await getAlumnas()
      setAlumnas(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.response?.data?.message ?? "No se pudieron cargar las alumnas.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    const createdName = form.name.trim()
    try {
      const result = await createAlumna(form)
      setCredentials(result.credentials ?? null)
      setForm({ name: "", username: "", pin: "" })
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

  if (loading) {
    return <p className="text-slate-500 pt-8">Cargando alumnas...</p>
  }

  return (
    <div className="space-y-8 pb-8">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {credentials && (
        <section className="rounded-[24px] border border-[#FF4F2A]/40 bg-[#FF4F2A]/10 p-5">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#FF4F2A] font-semibold">Datos de acceso</p>
          <p className="mt-3 text-2xl font-semibold text-white">{credentials.username}</p>
          <p className="mt-1 text-3xl font-semibold tracking-[0.2em] text-[#FF4F2A]">{credentials.pin}</p>
          <p className="mt-3 text-xs text-slate-400">Copialo ahora. El PIN no se vuelve a mostrar.</p>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-slate-500">Estudio</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Alumnas</h2>
          </div>
          <p className="text-sm text-slate-500 tabular-nums">
            {alumnas.length} {alumnas.length === 1 ? "cuenta" : "cuentas"}
          </p>
        </div>

        {alumnas.length === 0 && (
          <p className="text-slate-500 text-sm leading-relaxed">
            Todavía no hay alumnas. Cargá la primera abajo.
          </p>
        )}

        {alumnas.map((alumna) => (
          <article
            key={alumna.id}
            className="rounded-[24px] bg-ink border border-white/10 p-5"
          >
            <div className="flex items-start gap-4">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-semibold shrink-0"
                style={{ backgroundColor: "rgba(255, 79, 42, 0.16)", color: "#FF4F2A" }}
              >
                {initialOf(alumna.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{alumna.name}</h3>
                    <p className="text-sm text-slate-500">@{alumna.username}</p>
                  </div>
                  <span
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      alumna.is_active ? "bg-[#00FF2A]" : "bg-slate-600"
                    }`}
                    title={alumna.is_active ? "Activa" : "Inactiva"}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {alumna.has_plan ? "Plan asignado" : "Sin plan"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link
                to={`/admin/plan?alumna=${alumna.id}`}
                className={`${btnCreate} h-10 text-sm gap-1.5`}
              >
                <ClipboardList className="w-4 h-4" />
                {alumna.has_plan ? "Editar plan" : "Crear plan"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setPinTarget(alumna)
                  setNewPin("")
                  setError("")
                }}
                className={`${btnPin} h-10 text-sm gap-1.5`}
              >
                <KeyRound className="w-4 h-4" />
                Nuevo PIN
              </button>
              <button
                type="button"
                onClick={() => handleToggle(alumna)}
                className={`${alumna.is_active ? btnDanger : btnCreate} col-span-2 h-10 text-sm gap-1.5`}
              >
                <Power className="w-4 h-4" />
                {alumna.is_active ? "Desactivar" : "Activar"}
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[24px] border border-white/10 bg-ink p-5">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-2xl bg-[#00FF2A]/15 text-[#00FF2A] flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </span>
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-slate-500">Nueva cuenta</p>
            <h2 className="text-lg font-semibold text-white">Agregar alumna</h2>
          </div>
        </div>
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
          <button
            type="submit"
            disabled={saving}
            className={`${btnCreate} w-full h-12 text-[15px]`}
          >
            {saving ? "Creando..." : "Crear alumna"}
          </button>
        </form>
      </section>

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
            className="relative w-full max-w-sm rounded-[28px] bg-[#080809] border border-white/10 p-6"
          >
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#FF4F2A] font-semibold">Nuevo PIN</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{pinTarget.name}</h2>
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
              <button type="submit" className={`${btnPin} h-12 text-sm`}>
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
