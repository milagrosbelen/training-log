import { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Camera } from "lucide-react"
import { getProfileSummary, peekProfile, updateProfile } from "../services/profileService"
import { getStoredUser, isAuthenticated, logout } from "../services/authService"
import { getMyPlan, peekPlan } from "../services/planService"
import { dateToISOString } from "../utils/dateUtils"
import { parseObjectives } from "../utils/planUtils"
import { ToastHost } from "../components/Toast"
import BrandLogo from "../components/BrandLogo"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.45)"
const CARD_BORDER = { borderColor: "rgba(255,92,0,0.55)", boxShadow: "0 0 16px rgba(255,92,0,0.1)" }

function getInitial(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

function formatHours(minutes) {
  const value = Number(minutes) || 0
  if (value <= 0) return "0"
  if (value < 60) return `${value}m`
  const hours = Math.floor(value / 60)
  const rest = value % 60
  return rest ? `${hours}h ${rest}` : `${hours}h`
}

function lastWorkoutLabel(dateStr) {
  if (!dateStr) return "—"
  const key = String(dateStr).slice(0, 10)
  const today = dateToISOString(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (key === today) return "Hoy"
  if (key === dateToISOString(yesterday)) return "Ayer"
  const [year, month, day] = key.split("-").map(Number)
  if (!year || !month || !day) return "—"
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" }).format(new Date(year, month - 1, day))
}

function statusLabel(status) {
  if (status === "mejorando") return "mejorando"
  if (status === "estable") return "estable"
  if (status === "necesita_atencion") return "necesita atención"
  if (status === "en_progreso") return "en progreso"
  return ""
}

function emptyProfile(user) {
  return {
    user,
    totalWorkouts: 0,
    totalDuration: 0,
    lastWorkout: null,
    mostFrequentType: null,
    history: [],
    focusAnalytics: null,
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const storedUser = getStoredUser()
  const [profile, setProfile] = useState(() => peekProfile() || emptyProfile(storedUser))
  const [plan, setPlan] = useState(() => peekPlan() ?? null)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(storedUser?.name ?? "")
  const [editAvatarFile, setEditAvatarFile] = useState(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    getProfileSummary()
      .then((data) => {
        setProfile(data)
        setEditName(data?.user?.name ?? "")
        setError("")
      })
      .catch((err) => {
        setError(err.response?.data?.message ?? "Error al cargar el perfil.")
      })
    getMyPlan()
      .then((data) => setPlan(data))
      .catch(() => setPlan(null))
  }, [])

  const user = profile?.user
  const displayName = isEditing ? editName : user?.name
  const avatarUrl = isEditing && editAvatarPreview ? editAvatarPreview : user?.avatar_url
  const username = user?.username || storedUser?.username || ""
  const objectives = parseObjectives(plan?.objective)
  const sessions = profile?.totalWorkouts ?? 0
  const focusStatus = statusLabel(profile?.focusAnalytics?.status)

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate("/")
    }
  }

  const handleStartEdit = () => {
    setEditName(profile?.user?.name ?? "")
    setEditAvatarFile(null)
    setEditAvatarPreview(null)
    setIsEditing(true)
  }

  const handleAvatarClick = () => {
    if (!isEditing) handleStartEdit()
    window.setTimeout(() => fileInputRef.current?.click(), 0)
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setToast({ message: "Seleccioná una imagen válida (JPG, PNG)", type: "error" })
      return
    }
    setEditAvatarFile(file)
    setEditAvatarPreview(URL.createObjectURL(file))
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditName(profile?.user?.name ?? "")
    setEditAvatarFile(null)
    setEditAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSaveEdit = async () => {
    const name = String(editName ?? "").trim()
    if (!name) {
      setToast({ message: "El nombre es obligatorio", type: "error" })
      return
    }
    setSaving(true)
    try {
      const updatedUser = await updateProfile({ name, avatar: editAvatarFile || undefined })
      setProfile((prev) => (prev ? { ...prev, user: updatedUser ?? prev.user } : prev))
      setIsEditing(false)
      setEditAvatarFile(null)
      setEditAvatarPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setToast({ message: "Perfil actualizado.", type: "success" })
    } catch (err) {
      setToast({ message: err.response?.data?.message ?? "Error al guardar", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  if (error && !profile?.user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 pb-24">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      <div className="max-w-md mx-auto px-5 pt-7">
        <div className="flex items-center justify-between">
          <BrandLogo size="wide" className="-ml-2" />
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
            Tu cuenta
          </p>
        </div>

        <section className="mt-8 flex flex-col items-center text-center">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative h-[112px] w-[112px] rounded-full overflow-hidden bg-[#141414]"
            style={{ border: `3px solid ${BLAZE}`, boxShadow: `0 0 22px ${BLAZE_GLOW}` }}
            aria-label="Cambiar foto"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-black italic" style={{ color: BLAZE }}>
                {getInitial(displayName)}
              </span>
            )}
            <span
              className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: BLAZE }}
            >
              <Camera className="h-4 w-4" strokeWidth={2.2} />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />

          {isEditing ? (
            <input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              className="mt-5 w-full max-w-xs h-12 rounded-2xl bg-black border px-4 text-center text-xl font-black italic text-white"
              style={{ borderColor: "rgba(255,92,0,0.55)" }}
            />
          ) : (
            <h2 className="mt-5 font-display text-[32px] font-black italic tracking-tight leading-none text-white">
              {displayName || "—"}
            </h2>
          )}
          <p className="mt-2 text-sm text-slate-500">{username ? `@${username}` : user?.email || ""}</p>

          {isEditing ? (
            <div className="mt-4 flex w-full max-w-xs gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 h-11 rounded-full text-sm font-black italic text-white disabled:opacity-60"
                style={{ backgroundColor: BLAZE }}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 h-11 rounded-full text-sm font-semibold text-slate-400 border border-white/15"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="mt-4 h-10 px-5 rounded-full text-sm font-semibold border"
              style={{ borderColor: BLAZE, color: BLAZE }}
            >
              Modificar perfil
            </button>
          )}
        </section>

        <div className="mt-8 grid grid-cols-3 gap-2.5">
          <article className="rounded-[18px] bg-black px-2 py-4 text-center border" style={CARD_BORDER}>
            <p className="font-display font-black italic tracking-tight text-[28px] leading-none" style={{ color: BLAZE }}>
              {sessions}
            </p>
            <p className="mt-1.5 text-[11px] italic text-white/85">sesiones</p>
          </article>
          <article className="rounded-[18px] bg-black px-2 py-4 text-center border" style={CARD_BORDER}>
            <p className="font-display font-black italic tracking-tight text-[22px] leading-none text-white">
              {formatHours(profile?.totalDuration)}
            </p>
            <p className="mt-1.5 text-[11px] italic text-white/85">entrenadas</p>
          </article>
          <article className="rounded-[18px] bg-black px-2 py-4 text-center border" style={CARD_BORDER}>
            <p className="font-display font-black italic tracking-tight text-[22px] leading-none text-white">
              {lastWorkoutLabel(profile?.lastWorkout?.date)}
            </p>
            <p className="mt-1.5 text-[11px] italic text-white/85">último entreno</p>
          </article>
        </div>

        <p className="mt-8 text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
          Tu foco
        </p>
        <section
          className="mt-3 rounded-[24px] bg-black px-4 py-5 border"
          style={{ borderColor: "rgba(255,92,0,0.55)", boxShadow: "0 0 22px rgba(255,92,0,0.12)" }}
        >
          {objectives.length ? (
            <div className="flex flex-wrap gap-2">
              {objectives.map((item) => (
                <span
                  key={item}
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ backgroundColor: "rgba(255,92,0,0.16)", color: BLAZE }}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Todavía no hay objetivo en tu plan.</p>
          )}
          <p className="mt-3 text-[13px] text-slate-500">Lo que tu coach cargó en el plan.</p>
          <p className="mt-1 text-[13px] font-semibold" style={{ color: BLAZE }}>
            {sessions} {sessions === 1 ? "sesión" : "sesiones"}
            {focusStatus ? ` · ${focusStatus}` : ""}
          </p>
        </section>

        <p className="mt-8 text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
          Resumen
        </p>
        <div className="mt-3 space-y-2.5">
          <article className="rounded-[20px] bg-black border border-white/15 px-4 py-4 flex items-center justify-between gap-3">
            <p className="text-sm text-white/90">Total de entrenamientos</p>
            <p className="font-display font-black italic text-[28px] leading-none text-white">{sessions}</p>
          </article>
          <article className="rounded-[20px] bg-black border border-white/15 px-4 py-4 flex items-center justify-between gap-3">
            <p className="text-sm text-white/90">Tipo más frecuente</p>
            <p className="font-display font-black italic text-[22px] leading-none text-white text-right">
              {profile?.mostFrequentType || "—"}
            </p>
          </article>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-10 mb-4 w-full text-center text-sm text-slate-500 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

      <ToastHost toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
