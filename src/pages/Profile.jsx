import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ChevronLeft, LogOut, Camera, X, Plus, Minus } from "lucide-react"
import { getProfileSummary, updateProfile } from "../services/profileService"
import { logout } from "../services/authService"
import { isAuthenticated } from "../services/authService"
import { Navigate } from "react-router-dom"
import { formatDateShort } from "../utils/dateUtils"
import Toast from "../components/Toast"

function getInitial(name) {
  if (!name || !String(name).trim()) return "?"
  const parts = String(name).trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0][0].toUpperCase()
}

function formatDuration(minutes) {
  if (!minutes || minutes < 0) return "0 min"
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m} min` : `${h}h`
}

function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editAvatarFile, setEditAvatarFile] = useState(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  const loadProfile = async () => {
    setError("")
    setLoading(true)
    try {
      const data = await getProfileSummary()
      setProfile(data)
      setEditName(data?.user?.name ?? "")
      setEditAvatarFile(null)
      setEditAvatarPreview(null)
    } catch (err) {
      setError(err.response?.data?.message ?? "Error al cargar el perfil.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch {
      navigate("/")
    }
  }

  const handleStartEdit = () => {
    setEditName(profile?.user?.name ?? "")
    setEditAvatarFile(null)
    setEditAvatarPreview(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditName(profile?.user?.name ?? "")
    setEditAvatarFile(null)
    setEditAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setToast({ message: "Seleccioná una imagen válida (JPG, PNG)", type: "error" })
      return
    }
    setEditAvatarFile(file)
    setEditAvatarPreview(URL.createObjectURL(file))
  }

  const handleRemoveAvatar = () => {
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
      setToast({ message: "Perfil actualizado correctamente", type: "success" })
    } catch (err) {
      setToast({
        message: err.response?.data?.message ?? "Error al guardar",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <ProfileHeader />
        <main className="flex-1 flex items-center justify-center pb-24 md:pb-0">
          <p className="text-slate-400">Cargando perfil...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <ProfileHeader />
        <main className="flex-1 flex items-center justify-center px-4 pb-24 md:pb-0">
          <p className="text-red-400 text-center">{error}</p>
        </main>
      </div>
    )
  }

  const { user, totalWorkouts, totalDuration, lastWorkout, mostFrequentType, focusAnalytics } = profile ?? {}
  const avatarUrl = isEditing && editAvatarPreview ? editAvatarPreview : user?.avatar_url
  const displayName = isEditing ? editName : user?.name

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <ProfileHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8 space-y-8">
        {/* Header: Avatar → Nombre → Email → Botón */}
        <section className="relative flex flex-col items-center text-center">
          <button
            type="button"
            onClick={handleLogout}
            className="absolute top-0 right-0 flex flex-col items-center gap-0.5 py-1 px-1 text-slate-500 hover:text-slate-400 transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            <span className="text-[10px] font-medium uppercase tracking-wider">cerrar</span>
          </button>

          <div
            className="w-[100px] h-[100px] rounded-full border-2 border-teal-500/60 flex items-center justify-center overflow-hidden bg-slate-800 flex-shrink-0"
            aria-hidden
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name ?? "Avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-teal-400">
                {getInitial(displayName)}
              </span>
            )}
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            {displayName || "—"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{user?.email ?? "—"}</p>

          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="mt-4 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
            >
              Modificar perfil
            </button>
          )}
        </section>

        {/* Sección editable */}
        {isEditing && (
          <section className="bg-slate-800/60 rounded-2xl p-4 sm:p-6 shadow-lg shadow-black/20 border border-slate-700/50 space-y-4">
            <h3 className="text-base font-semibold text-white">Editar perfil</h3>

            <div>
              <label htmlFor="edit-name" className="block text-sm text-slate-400 mb-2">
                Nombre
              </label>
              <input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Foto</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full border-2 border-slate-600 flex items-center justify-center overflow-hidden bg-slate-700/50 flex-shrink-0">
                  {editAvatarPreview ? (
                    <img
                      src={editAvatarPreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm px-3 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors"
                  >
                    Cambiar foto
                  </button>
                  {editAvatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-sm px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-black font-semibold transition-colors"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 disabled:opacity-60 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </section>
        )}

        {/* Foco Principal */}
        <FocusPrincipalSection focusAnalytics={focusAnalytics} />

        {/* Resumen – Acordeón colapsable */}
        <SummaryAccordion
          totalWorkouts={totalWorkouts ?? 0}
          totalDuration={totalDuration ?? 0}
          lastWorkout={lastWorkout}
          mostFrequentType={mostFrequentType ?? "—"}
          formatDuration={formatDuration}
          formatDateShort={formatDateShort}
        />

      </main>

      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}

function ProfileHeader() {
  return (
    <header className="hidden md:block bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver</span>
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Perfil</h1>
          <div className="w-16 sm:w-20" aria-hidden />
        </div>
      </div>
    </header>
  )
}

function FocusPrincipalSection({ focusAnalytics }) {
  if (!focusAnalytics) {
    return (
      <section>
        <h2 className="text-base font-semibold text-white mb-4">🎯 Foco Principal</h2>
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
          <p className="text-sm text-slate-400">
            Definí tu foco en{" "}
            <Link to="/progreso" className="text-teal-400 hover:text-teal-300">
              Progreso
            </Link>{" "}
            para ver tu avance.
          </p>
        </div>
      </section>
    )
  }

  const { focus, sufficient_data, message, sessions, progress_pct, weight_change, status } =
    focusAnalytics

  if (!sufficient_data) {
    return (
      <section>
        <h2 className="text-base font-semibold text-white mb-4">🎯 Foco Principal</h2>
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
          <p className="text-base font-medium text-white mb-1">{focus}</p>
          <p className="text-sm text-slate-400">{message ?? "Aún no hay datos suficientes para analizar tu foco."}</p>
        </div>
      </section>
    )
  }

  const statusConfig = {
    mejorando: { label: "Mejorando", icon: "📈", color: "text-teal-400" },
    estable: { label: "Estable", icon: "➖", color: "text-slate-400" },
    necesita_atencion: { label: "Necesita atención", icon: "📉", color: "text-amber-400" },
    en_progreso: { label: "En progreso", icon: "🎯", color: "text-teal-400" },
  }
  const sc = statusConfig[status] ?? statusConfig.en_progreso

  const formatProgress = (pct) => {
    if (pct == null) return null
    const sign = pct >= 0 ? "+" : ""
    return `${sign}${pct}%`
  }

  const formatWeightChange = (delta) => {
    if (delta == null) return null
    if (delta > 0) return `+${delta} kg`
    return `${delta} kg`
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-white mb-4">🎯 Foco Principal</h2>
      <div className="bg-slate-800/60 rounded-2xl p-5 sm:p-6 border border-slate-700/50 space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Foco actual
          </p>
          <p className="text-lg font-semibold text-white">{focus}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {progress_pct != null && (
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Progreso del mes</p>
              <p
                className={`text-base font-semibold ${
                  progress_pct >= 0 ? "text-teal-400" : "text-amber-400"
                }`}
              >
                {formatProgress(progress_pct)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Frecuencia</p>
            <p className="text-base font-semibold text-white">{sessions} sesiones</p>
          </div>
          {weight_change != null && (
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Peso promedio</p>
              <p
                className={`text-base font-semibold ${
                  weight_change >= 0 ? "text-teal-400" : "text-amber-400"
                }`}
              >
                {weight_change >= 0 ? "↑" : "↓"} {formatWeightChange(Math.abs(weight_change))}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Estado</p>
            <p className={`text-base font-medium ${sc.color}`}>
              {sc.icon} {sc.label}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SummaryAccordion({
  totalWorkouts,
  totalDuration,
  lastWorkout,
  mostFrequentType,
  formatDuration,
  formatDateShort,
}) {
  const [expandedId, setExpandedId] = useState(null)

  const items = [
    {
      id: "total",
      label: "Total de entrenamientos",
      value: String(totalWorkouts),
    },
    {
      id: "duration",
      label: "Duración acumulada",
      value: formatDuration(totalDuration),
    },
    {
      id: "last",
      label: "Último entrenamiento",
      value: lastWorkout ? formatDateShort(lastWorkout.date) : "—",
      sub: lastWorkout ? `${lastWorkout.type} · ${formatDuration(lastWorkout.duration)}` : null,
    },
    {
      id: "frequent",
      label: "Tipo más frecuente",
      value: mostFrequentType,
    },
  ]

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-white mb-6">Resumen</h2>

      <div className="divide-y divide-slate-700/40">
        {items.map(({ id, label, value, sub }) => {
          const isExpanded = expandedId === id
          return (
            <div key={id} className="py-4 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => handleToggle(id)}
                className="w-full flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-lg py-1 -my-1"
              >
                <span className="text-sm font-medium text-slate-300">{label}</span>
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {isExpanded ? (
                    <Minus className="w-4 h-4 text-teal-500" strokeWidth={2.5} />
                  ) : (
                    <Plus className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                  )}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pt-2 pb-1">
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {value}
                  </p>
                  {sub && (
                    <p className="text-sm text-slate-500 mt-1">{sub}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Profile
