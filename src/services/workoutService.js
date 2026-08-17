import { api, readStoredUserId } from "./api"
import { dateToISOString } from "../utils/dateUtils"
import { slugExercise } from "../utils/exerciseImages"

function normalizeDate(dateStr) {
  if (!dateStr) return ""
  if (typeof dateStr === "string" && dateStr.includes("T")) {
    return dateStr.split("T")[0]
  }
  return String(dateStr)
}

function apiToFrontend(workout) {
  if (!workout) return null
  return {
    ...workout,
    date: normalizeDate(workout.date),
    locked: true,
    exercises: (workout.exercises || []).map((ex) => ({
      id: ex.id,
      name: ex.name ?? "",
      weight: ex.weight ?? "",
      reps: ex.reps ?? "",
      sets: ex.sets ?? 1,
      notes: ex.notes ?? "",
    })),
  }
}

function toPayloadExercise(ex, i) {
  const series = Array.isArray(ex.series) ? ex.series : []
  const lastSet = series[series.length - 1]
  const weightSource = ex.weight !== "" && ex.weight != null ? ex.weight : lastSet?.weight
  const repsSource = ex.reps !== "" && ex.reps != null ? ex.reps : lastSet?.reps
  const sets = series.length > 0 ? series.length : (ex.sets ?? 1)

  return {
    name: String(ex.name || "").trim(),
    weight: weightSource !== "" && weightSource != null ? Number(weightSource) : null,
    reps: repsSource !== "" && repsSource != null ? parseInt(repsSource, 10) || null : null,
    sets,
    notes: ex.notes ? String(ex.notes).trim() : null,
    order: i,
  }
}

let workoutsCache = null
let workoutsCacheUserId = null
let workoutsCacheAt = 0
let workoutsInflight = null
const WORKOUTS_TTL = 3 * 60 * 1000
const WORKOUTS_STORAGE_PREFIX = "milogit_workouts_"

function workoutsStorageKey(userId) {
  return `${WORKOUTS_STORAGE_PREFIX}${userId}`
}

function readStoredWorkouts(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(workoutsStorageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeStoredWorkouts(userId, list) {
  if (!userId) return
  try {
    localStorage.setItem(workoutsStorageKey(userId), JSON.stringify(list))
  } catch {
    // Quota / private mode.
  }
}

export function hydrateWorkouts(workouts) {
  const list = (Array.isArray(workouts) ? workouts : []).map(apiToFrontend)
  const userId = readStoredUserId()
  workoutsCache = list
  workoutsCacheUserId = userId
  workoutsCacheAt = Date.now()
  writeStoredWorkouts(userId, list)
  return list
}

export function peekWorkouts() {
  const userId = readStoredUserId()
  if (!userId) return null
  if (workoutsCacheUserId === userId && Array.isArray(workoutsCache)) return workoutsCache
  const stored = readStoredWorkouts(userId)
  if (!stored) return null
  workoutsCache = stored
  workoutsCacheUserId = userId
  workoutsCacheAt = Date.now()
  return workoutsCache
}

export function clearWorkoutsCache() {
  const userId = readStoredUserId()
  workoutsCache = null
  workoutsCacheUserId = null
  workoutsCacheAt = 0
  workoutsInflight = null
  try {
    if (userId) localStorage.removeItem(workoutsStorageKey(userId))
  } catch {
    // ignore
  }
}

export async function getWorkouts({ skipLoading = false } = {}) {
  const cached = peekWorkouts()
  const hasCache = Array.isArray(cached)
  if (hasCache && Date.now() - workoutsCacheAt < WORKOUTS_TTL) {
    return cached
  }
  if (workoutsInflight) return hasCache ? cached : workoutsInflight

  workoutsInflight = api.get("/workouts", { skipLoading: skipLoading || hasCache })
    .then(({ data }) => hydrateWorkouts(data.data ?? []))
    .finally(() => {
      workoutsInflight = null
    })

  if (hasCache) {
    workoutsInflight.catch(() => {})
    return cached
  }

  return workoutsInflight
}

export async function getWorkoutByDate(date) {
  const { data } = await api.get(`/workouts/date/${date}`)
  return apiToFrontend(data.data)
}

export async function saveWorkout(workoutData) {
  const payload = {
    date: workoutData.date,
    type: workoutData.type || "Entrenamiento",
    duration: workoutData.duration ?? 0,
    exercises: (workoutData.exercises || [])
      .filter((ex) => ex.name && String(ex.name).trim())
      .map(toPayloadExercise),
  }
  const { data } = await api.post("/workouts", payload)
  const workout = apiToFrontend(data.data)
  if (workout) {
    const current = peekWorkouts() || []
    hydrateWorkouts([workout, ...current.filter((item) => item.date !== workout.date)])
  }
  return workout
}

export async function deleteWorkout(id) {
  await api.delete(`/workouts/${id}`)
  const current = peekWorkouts()
  if (Array.isArray(current)) {
    hydrateWorkouts(current.filter((item) => item.id !== id))
  }
}

export async function logSessionExercise({ exercise, weight, reps, sets, notes, sessionTitle, workouts = [] }) {
  const date = dateToISOString(new Date())
  const current = (workouts || []).find((workout) => normalizeDate(workout.date) === date)
  const list = [...(current?.exercises || [])]
  const slug = slugExercise(exercise.name)
  const nextRow = {
    name: exercise.name,
    weight,
    reps,
    sets,
    notes,
  }
  const index = list.findIndex((item) => slugExercise(item.name) === slug)
  if (index >= 0) list[index] = { ...list[index], ...nextRow }
  else list.push(nextRow)

  return saveWorkout({
    date,
    type: current?.type || sessionTitle || "Entrenamiento",
    duration: current?.duration || 0,
    exercises: list,
  })
}
