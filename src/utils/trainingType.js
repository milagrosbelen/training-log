export const TRAINING_GYM = "gym"
export const TRAINING_HOME = "home"

export const TRAINING_TYPES = [
  {
    id: TRAINING_GYM,
    label: "Gym",
    short: "Gym",
    description: "Pesas, máquinas y kilos.",
  },
  {
    id: TRAINING_HOME,
    label: "Peso corporal (mezcla)",
    short: "Casa",
    description: "Casa: aeróbico, yoga y calistenia, sin kilos.",
  },
]

export function normalizeTrainingType(value) {
  return value === TRAINING_HOME ? TRAINING_HOME : TRAINING_GYM
}

export function isHomeTraining(source) {
  if (!source) return false
  if (typeof source === "string") return source === TRAINING_HOME
  return normalizeTrainingType(source.training_type) === TRAINING_HOME
}

export function usesPoseLadder(user) {
  const username = String(user?.username || "").trim().toLowerCase()
  const email = String(user?.email || "").trim().toLowerCase()
  return username === "milagros" || email === "milagrospedrasa1@gmail.com"
}

export function trainingTypeMeta(source) {
  const id = normalizeTrainingType(typeof source === "string" ? source : source?.training_type)
  return TRAINING_TYPES.find((item) => item.id === id) || TRAINING_TYPES[0]
}
