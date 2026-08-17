import { getAlumnas } from "./alumnaService"
import { getClients, getMyPlan } from "./planService"
import { getProfileSummary } from "./profileService"
import { getWorkouts } from "./workoutService"
import { hydrateAlumnaSession, hydrateCoachSession } from "./sessionService"

export function prefetchAlumnaData() {
  hydrateAlumnaSession({ skipLoading: true }).catch(() => {
    getWorkouts({ skipLoading: true }).catch(() => {})
    getMyPlan({ skipLoading: true }).catch(() => {})
    getProfileSummary({ skipLoading: true }).catch(() => {})
  })
}

export function prefetchCoachData() {
  hydrateCoachSession({ skipLoading: true }).catch(() => {
    getAlumnas({ skipLoading: true }).catch(() => {})
    getClients({ skipLoading: true }).catch(() => {})
  })
}
