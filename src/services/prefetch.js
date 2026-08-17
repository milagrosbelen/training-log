import { getAlumnas } from "./alumnaService"
import { getClients, getMyPlan } from "./planService"
import { getProfileSummary } from "./profileService"
import { getWorkouts } from "./workoutService"

export function prefetchAlumnaData() {
  getWorkouts({ skipLoading: true }).catch(() => {})
  getMyPlan({ skipLoading: true }).catch(() => {})
  getProfileSummary({ skipLoading: true }).catch(() => {})
}

export function prefetchCoachData() {
  getAlumnas({ skipLoading: true }).catch(() => {})
  getClients({ skipLoading: true }).catch(() => {})
}
