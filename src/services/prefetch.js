import { getAlumnas } from "./alumnaService"
import { getClients, getMyPlan } from "./planService"
import { getProfileSummary } from "./profileService"
import { getWorkouts } from "./workoutService"

export function prefetchAlumnaData() {
  getWorkouts().catch(() => {})
  getMyPlan().catch(() => {})
  getProfileSummary().catch(() => {})
}

export function prefetchCoachData() {
  getAlumnas().catch(() => {})
  getClients().catch(() => {})
}
