import { api } from "./api"
import { hydrateAlumnas } from "./alumnaService"
import { hydratePlan, hydrateClients } from "./planService"
import { hydrateProfile } from "./profileService"
import { hydrateWorkouts } from "./workoutService"

let alumnaInflight = null
let coachInflight = null

export async function hydrateAlumnaSession({ skipLoading = true } = {}) {
  if (alumnaInflight) return alumnaInflight

  alumnaInflight = api.get("/session", { skipLoading })
    .then(({ data }) => {
      const payload = data?.data ?? data ?? {}
      hydrateWorkouts(payload.workouts)
      hydratePlan(payload.plan ?? null)
      hydrateProfile(payload.profile)
      return payload
    })
    .finally(() => {
      alumnaInflight = null
    })

  return alumnaInflight
}

export async function hydrateCoachSession({ skipLoading = true } = {}) {
  if (coachInflight) return coachInflight

  coachInflight = api.get("/coach-session", { skipLoading })
    .then(({ data }) => {
      const list = data?.data ?? []
      hydrateAlumnas(list)
      hydrateClients(list)
      return list
    })
    .finally(() => {
      coachInflight = null
    })

  return coachInflight
}
