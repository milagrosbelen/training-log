import { api } from "./api"

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
    })),
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
      .map((ex, i) => ({
        name: String(ex.name).trim(),
        weight: ex.weight !== "" && ex.weight != null ? Number(ex.weight) : null,
        reps: ex.reps !== "" && ex.reps != null ? Number(ex.reps) : null,
        sets: ex.sets ?? 1,
        order: i,
      })),
  }
  const { data } = await api.post("/workouts", payload)
  return apiToFrontend(data.data)
}

export async function deleteWorkout(id) {
  await api.delete(`/workouts/${id}`)
}
