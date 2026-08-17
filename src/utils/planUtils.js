import { ROUTINES } from "../data/routines"
import { MUSCLE_LABELS } from "../data/exerciseCatalog"

export const WEEKDAYS = [
  { key: 0, label: "L", name: "lunes" },
  { key: 1, label: "M", name: "martes" },
  { key: 2, label: "X", name: "miércoles" },
  { key: 3, label: "J", name: "jueves" },
  { key: 4, label: "V", name: "viernes" },
  { key: 5, label: "S", name: "sábado" },
  { key: 6, label: "D", name: "domingo" },
]

export const SESSION_TITLES = [
  "Empuje",
  "Tirón",
  "Piernas",
  "Full body",
  "Glúteos",
  "Core",
  "Tren superior",
  "Tren inferior",
]

export const MUSCLE_OPTIONS = Object.values(MUSCLE_LABELS)

export const EXERCISE_SUGGESTIONS = [
  ...new Set(Object.values(ROUTINES).flatMap((group) => Object.values(group).flat())),
]

export function todayWeekday() {
  return (new Date().getDay() + 6) % 7
}

export function firstName(name) {
  if (!name || !String(name).trim()) return ""
  return String(name).trim().split(/\s+/)[0]
}

export function emptyExercise() {
  return {
    name: "",
    sets: 4,
    reps: "8-10",
    rest_seconds: 60,
    tip: "",
    muscle: "",
  }
}

export const OBJECTIVE_OPTIONS = [
  "Bajar grasa",
  "Ganar músculo",
  "Fuerza",
  "Recomposición",
  "Glúteos y piernas",
  "Tren superior",
  "Mantener",
]

export const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6]

export function parseObjectives(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 3)
  }
  const raw = String(value || "").trim()
  if (!raw) return []
  return raw.split(/\s*[·,|]\s*/).map((item) => item.trim()).filter(Boolean).slice(0, 3)
}

export function joinObjectives(list) {
  return parseObjectives(list).join(" · ")
}

export function emptyPlanForm() {
  return {
    week_current: 1,
    week_total: 8,
    days_per_week: 3,
    objectives: [],
    sessions: [],
  }
}

export const REST_MINUTE_OPTIONS = [0, 1, 2, 3, 4, 5]

export function restMinutesFromSeconds(seconds) {
  const minutes = Math.round((Number(seconds) || 0) / 60)
  return Math.min(5, Math.max(0, minutes))
}

export function restSecondsFromMinutes(minutes) {
  const value = Math.min(5, Math.max(0, Number(minutes) || 0))
  return value * 60
}

export function formatRest(seconds) {
  const minutes = restMinutesFromSeconds(seconds)
  if (minutes <= 0) return "0 descanso"
  return minutes === 1 ? "1 min" : `${minutes} min`
}
