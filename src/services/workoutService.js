import { api } from "./api"
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

export async function getWorkouts() {
  const { data } = await api.get("/workouts")
  const list = data.data ?? []
  return list.map(apiToFrontend)
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
  return apiToFrontend(data.data)
}

export async function deleteWorkout(id) {
  await api.delete(`/workouts/${id}`)
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
