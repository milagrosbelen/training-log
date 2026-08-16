import { ROUTINES } from "../data/routines"

export function slugExercise(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export const EXERCISE_IMAGE_NAMES = [
  ...new Set(Object.values(ROUTINES).flatMap((group) => Object.values(group).flat())),
]

const IMAGE_ALIASES = {
  "abduccion-con-banda": "abduccion-lateral-con-banda-caminando",
  "maquina-de-aductor": "maquina-de-abductor",
}

export const EXERCISE_PHOTO_FALLBACK = "/home-hero-bench.png"

export function getExerciseImage(name) {
  const slug = slugExercise(name)
  if (!slug) return EXERCISE_PHOTO_FALLBACK
  const file = IMAGE_ALIASES[slug] || slug
  return `/exercises/${file}.png`
}
