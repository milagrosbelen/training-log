import { useState, useEffect } from "react"
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react"
import { getDateParts } from "../utils/dateUtils"
import { getRandomQuote, progressQuotes } from "../utils/motivationalQuotes"
import { getFocus, updateFocus } from "../services/profileService"

const MOTIVATORS = {
  high: ["Estás en la zona. Seguí así.", "Cada día suma. Este mes lo demostraste.", "Tu esfuerzo se nota."],
  mid: ["Vas bien. Un día más y subís.", "La constancia paga. Seguí.", "Cada entrenamiento te acerca."],
  low: ["El primer paso es el más importante.", "Hoy puede ser ese día.", "Pequeños pasos, grandes cambios."],
}

function getMotivator(percentage) {
  const arr = percentage >= 60 ? MOTIVATORS.high : percentage >= 20 ? MOTIVATORS.mid : MOTIVATORS.low
  return arr[Math.floor(Math.random() * arr.length)]
}

function MonthlySummary({ workouts, month, year, onMonthPrev, onMonthNext, canGoNext = false }) {
  const [userFocus, setUserFocus] = useState("")
  const [isEditingFocus, setIsEditingFocus] = useState(false)
  const [focusDraft, setFocusDraft] = useState("")
  const [savingFocus, setSavingFocus] = useState(false)

  useEffect(() => {
    getFocus().then((f) => setUserFocus(f ?? "")).catch(() => {})
  }, [])

  const handleStartEditFocus = () => {
    setFocusDraft(userFocus)
    setIsEditingFocus(true)
  }

  const handleSaveFocus = async () => {
    const trimmed = focusDraft.trim()
    if (!trimmed) return
    setSavingFocus(true)
    try {
      await updateFocus(trimmed)
      setUserFocus(trimmed)
      setIsEditingFocus(false)
    } catch {
      // Error silencioso; el estado local no se actualiza
    } finally {
      setSavingFocus(false)
    }
  }

  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  const monthWorkouts = workouts.filter((workout) => {
    const { year: workoutYear, month: workoutMonth } = getDateParts(workout.date)
    return workoutMonth === month && workoutYear === year
  })

  const totalDays = new Date(year, month + 1, 0).getDate()
  const daysWithWorkout = monthWorkouts.length
  const trainingPercentage = Math.round((daysWithWorkout / totalDays) * 100)

  const muscleGroups = {
    pecho: ["press", "banca", "pecho"],
    piernas: ["sentadilla", "pierna", "cuádriceps", "gemelo", "glúteo"],
    espalda: ["remo", "dominada", "espalda", "jalón"],
    hombros: ["press militar", "hombro", "elevación"],
    brazos: ["curl", "tríceps", "bíceps", "brazo"],
    core: ["abdominal", "core", "plancha"],
  }

  const muscleCount = {}
  monthWorkouts.forEach((workout) => {
    ;(workout.exercises || []).forEach((exercise) => {
      const name = String(exercise?.name || "").toLowerCase()
      Object.keys(muscleGroups).forEach((muscle) => {
        if (muscleGroups[muscle].some((k) => name.includes(k))) {
          muscleCount[muscle] = (muscleCount[muscle] || 0) + 1
        }
      })
    })
  })

  const mainFocus = Object.keys(muscleCount).length > 0
    ? Object.entries(muscleCount)
        .sort((a, b) => b[1] - a[1])[0][0]
        .replace(/^./, (c) => c.toUpperCase())
    : "—"

  const getRating = () => {
    if (trainingPercentage >= 80) return { text: "Excelente", stars: 5, value: 5 }
    if (trainingPercentage >= 60) return { text: "Muy Bueno", stars: 4, value: 4 }
    if (trainingPercentage >= 40) return { text: "Bueno", stars: 3, value: 3 }
    if (trainingPercentage >= 20) return { text: "Regular", stars: 2, value: 2 }
    return { text: "¡Buen Inicio!", stars: 1, value: 1 }
  }

  const rating = getRating()
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDash = Math.max(0, (trainingPercentage / 100) * circumference)

  const hasWorkouts = daysWithWorkout > 0
  const showNav = typeof onMonthPrev === "function"

  return (
    <div className="space-y-8">
      {/* 0. Navegación mensual (solo si hay handlers) */}
      {showNav && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onMonthPrev?.()}
            className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-[#2AF447] hover:bg-[#2C2C40] transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-white tabular-nums">
            {MONTHS[month]} {year}
          </h2>
          <button
            type="button"
            onClick={() => onMonthNext?.()}
            disabled={!canGoNext}
            className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-[#2AF447] hover:bg-[#2C2C40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* 1. Header superior */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em]">
          Progreso Mensual
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {MONTHS[month]} en<br />
          <span className="text-[#2AF447] [text-shadow:0_0_20px_rgba(42,244,71,0.3)]">Movimiento</span>
        </h1>
        <div className="flex flex-wrap items-baseline gap-2 pt-2">
          <span className="text-4xl sm:text-5xl font-bold text-[#2AF447] tabular-nums [text-shadow:0_0_24px_rgba(42,244,71,0.35)]">
            {daysWithWorkout}
          </span>
          <span className="text-lg sm:text-xl text-slate-200 font-medium">
            día{daysWithWorkout !== 1 ? "s" : ""} entrenado{daysWithWorkout !== 1 ? "s" : ""}
          </span>
        </div>
        {hasWorkouts && (
          <p className="text-sm text-slate-400 pt-1">
            {getRandomQuote(progressQuotes)}
          </p>
        )}
        {!hasWorkouts && (
          <p className="text-sm text-slate-500 pt-1">
            No registraste entrenamientos este mes.
          </p>
        )}
      </div>

      {/* 2. Tarjeta Días de Entrenamiento */}
      <div className="bg-[#2C2C40] rounded-2xl p-6 sm:p-7 border border-[#3d3d52] shadow-xl shadow-black/20">
        <h3 className="text-base font-semibold text-white mb-1">
          Días de Entrenamiento
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          {trainingPercentage >= 80 ? "Meta cumplida. Siguiente nivel." : getMotivator(trainingPercentage)}
        </p>
        <div className="flex justify-center">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                strokeWidth="8"
                className="stroke-[#4a4a60]"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} 314`}
                className="stroke-[#2AF447] transition-all duration-700 ease-out"
                style={{ filter: "drop-shadow(0 0 12px rgba(42,244,71,0.45))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {trainingPercentage}%
              </span>
              <span className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wider">
                {daysWithWorkout}/{totalDays} días
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tarjeta Calificación del Mes */}
      <div className="bg-[#2C2C40] rounded-2xl p-6 sm:p-7 border border-[#3d3d52] shadow-xl shadow-black/20">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
          Calificación del Mes
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-white">{rating.text}</p>
            <div className="flex gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${
                    i < rating.stars
                      ? "text-[#2AF447] fill-[#2AF447] drop-shadow-[0_0_8px_rgba(42,244,71,0.5)]"
                      : "text-slate-500 fill-slate-600/30"
                  }`}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#2AF447]/15 border-2 border-[#2AF447] flex items-center justify-center shadow-[0_0_12px_rgba(42,244,71,0.25)]">
            <span className="text-sm font-bold text-[#2AF447] tabular-nums">{rating.value}/5</span>
          </div>
        </div>
      </div>

      {/* 4. Tarjeta Meta del Mes */}
      <div className="bg-[#2C2C40] rounded-2xl p-6 sm:p-7 border border-[#3d3d52] shadow-xl shadow-black/20 transition-all duration-300">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
          Meta del Mes
        </p>

        {isEditingFocus ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={focusDraft}
              onChange={(e) => setFocusDraft(e.target.value)}
              placeholder="Define tu foco..."
              autoFocus
              className="flex-1 px-4 py-3 rounded-xl bg-[#1B1B2C] border border-[#3d3d52] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2AF447]/50 focus:border-[#2AF447]/50 transition-all duration-200"
            />
            <button
              type="button"
              onClick={handleSaveFocus}
              disabled={!focusDraft.trim() || savingFocus}
              className="px-5 py-3 rounded-xl bg-[#2AF447] text-[#0d0d14] font-semibold text-sm shadow-[0_0_20px_rgba(42,244,71,0.3)] hover:bg-[#3dff5c] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2AF447] transition-all duration-200 flex-shrink-0"
            >
              {savingFocus ? "Guardando..." : "OK"}
            </button>
          </div>
        ) : userFocus ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-base sm:text-lg font-medium text-white flex-1">
              {userFocus}
            </p>
            <button
              type="button"
              onClick={handleStartEditFocus}
              className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-[#2AF447] hover:bg-[#2AF447]/10 transition-all duration-200"
              aria-label="Editar foco"
            >
              <Pencil className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-base sm:text-lg font-medium text-white">
              Define tu meta este mes
            </p>
            <button
              type="button"
              onClick={handleStartEditFocus}
              className="px-5 py-2.5 rounded-xl bg-[#2AF447] text-[#0d0d14] font-semibold text-sm shadow-[0_0_20px_rgba(42,244,71,0.3)] hover:bg-[#3dff5c] hover:shadow-[0_0_24px_rgba(42,244,71,0.4)] transition-all duration-200 flex-shrink-0 self-start sm:self-center"
            >
              Definir foco
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MonthlySummary
