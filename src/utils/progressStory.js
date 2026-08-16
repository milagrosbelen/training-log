import { dateToISOString, parseDateString } from "./dateUtils"

export const FEELINGS = ["Fácil", "Bien", "Pesado"]

const FEELING_STORY = {
  Pesado: "Fuerte",
  Bien: "Bien",
  Fácil: "Ligero",
}

function startOfWeek(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const weekday = d.getDay()
  d.setDate(d.getDate() + (weekday === 0 ? -6 : 1 - weekday))
  return d
}

export function formatKg(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return ""
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "")
}

export function parseSessionNote(notes) {
  const raw = String(notes || "").trim()
  if (!raw) return { feeling: "", comment: "" }
  for (const feeling of FEELINGS) {
    if (raw === feeling) return { feeling, comment: "" }
    const prefix = `${feeling}.`
    if (raw.startsWith(prefix)) {
      return { feeling, comment: raw.slice(prefix.length).trim() }
    }
  }
  return { feeling: "", comment: raw }
}

function dayLabel(dateStr) {
  const date = parseDateString(dateStr)
  if (!date) return ""
  const today = dateToISOString(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = dateToISOString(yesterdayDate)
  if (dateStr === today) return "Hoy"
  if (dateStr === yesterday) return "Ayer"
  const name = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(date)
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function feelingTone(feeling) {
  if (feeling === "Pesado") return "ember"
  if (feeling === "Bien") return "gold"
  return "muted"
}

export function buildProgressStory(workouts = [], plan = null, userName = "") {
  const list = (workouts || [])
    .filter((w) => w?.date)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))

  const weekStart = dateToISOString(startOfWeek())
  const weekDates = new Set(list.filter((w) => w.date >= weekStart).map((w) => w.date))
  const weekDone = weekDates.size
  const daysPerWeek = Number(plan?.days_per_week) || plan?.sessions?.length || 4
  const weekCurrent = Number(plan?.week_current) || 1

  const comments = []
  const feelingCount = { Fácil: 0, Bien: 0, Pesado: 0 }
  const weightsByExercise = new Map()

  for (const workout of list) {
    for (const exercise of workout.exercises || []) {
      const name = String(exercise.name || "").trim()
      const weight = Number(exercise.weight)
      const { feeling, comment } = parseSessionNote(exercise.notes)
      if (feeling && feelingCount[feeling] != null) feelingCount[feeling] += 1
      if (feeling || comment) {
        comments.push({
          id: `${workout.date}-${name}-${comments.length}`,
          date: workout.date,
          day: dayLabel(workout.date),
          title: workout.type || "Entrenamiento",
          exercise: name,
          weight: formatKg(weight),
          feeling,
          comment,
          tone: feelingTone(feeling),
        })
      }
      if (name && Number.isFinite(weight) && weight > 0) {
        if (!weightsByExercise.has(name)) weightsByExercise.set(name, [])
        weightsByExercise.get(name).push({ date: workout.date, weight })
      }
    }
  }

  let lift = null
  let chart = null
  for (const [name, points] of weightsByExercise.entries()) {
    const chronological = points
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .reduce((acc, point) => {
        const last = acc[acc.length - 1]
        if (last && last.date === point.date) {
          acc[acc.length - 1] = point
          return acc
        }
        acc.push(point)
        return acc
      }, [])
    if (chronological.length < 2) continue
    const first = chronological[0].weight
    const last = chronological[chronological.length - 1].weight
    const delta = last - first
    if (!lift || delta > lift.delta) {
      lift = { name, delta, last }
      chart = {
        name,
        points: chronological.slice(-6).map((p) => ({ ...p, label: `${formatKg(p.weight)} kg` })),
      }
    }
  }

  const topFeeling = Object.entries(feelingCount).sort((a, b) => b[1] - a[1])[0]
  const mood = topFeeling && topFeeling[1] > 0 ? FEELING_STORY[topFeeling[0]] : "—"

  return {
    userName: userName || "Alumna",
    weekLabel: plan ? `Semana ${weekCurrent} del plan` : "Todavía sin plan asignado",
    sessionsDone: list.length,
    weekDone,
    daysPerWeek,
    weekPct: daysPerWeek > 0 ? Math.min(weekDone / daysPerWeek, 1) : 0,
    lift,
    mood,
    commentsCount: comments.length,
    comments: comments.slice(0, 8),
    chart,
    hasCoachNotes: comments.length > 0,
  }
}
