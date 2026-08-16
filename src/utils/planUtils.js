import { ROUTINES } from "../data/routines"

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

export const MUSCLE_OPTIONS = [
  ...new Set(Object.values(ROUTINES).flatMap((group) => Object.keys(group))),
]

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
    rest_seconds: 90,
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

export function emptyPlanForm() {
  return {
    week_current: 1,
    week_total: 8,
    days_per_week: 3,
    objective: "",
    sessions: [],
  }
}

export function formatRest(seconds) {
  const value = Number(seconds) || 0
  if (value <= 0) return "sin descanso"
  return `${value}s descanso`
}
