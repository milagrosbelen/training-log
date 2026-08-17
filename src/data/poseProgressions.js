export const POSE_STATUSES = [
  { id: "sale", label: "Me sale" },
  { id: "bien", label: "Me sale bien" },
]

export const POSE_FAMILIES = [
  {
    id: "bakasana",
    name: "Bakasana",
    spanish: "Cuervo",
    zone: "Equilibrio",
    levels: [
      { id: "bakasana", name: "Clásico", image: "cuervo", startUnlocked: true },
      { id: "bakasana-bajar-normal", name: "Bajar normal", image: "cuervo-con-cabeza", startUnlocked: true },
      { id: "bakasana-piernas-juntas", name: "Bajar piernas juntas", image: "tripode-encogida", startUnlocked: true },
      { id: "kakasana", name: "Kakasana", image: "cuervo-brazos-rectos", startUnlocked: false },
    ],
  },
  {
    id: "sirsasana",
    name: "Sirsasana",
    spanish: "Invertida de cabeza",
    zone: "Equilibrio",
    levels: [
      { id: "salamba-sirsasana", name: "Salamba Sirsasana", image: "invertida-de-cabeza", startUnlocked: true },
      { id: "sirsasana-ii", name: "Sirsasana II", image: "tripode-completa", startUnlocked: false },
    ],
  },
  {
    id: "adho-mukha-vrksasana",
    name: "Adho Mukha Vrksasana",
    spanish: "Parada de manos",
    zone: "Fuerza",
    levels: [
      { id: "adho-mukha-vrksasana", name: "Parada de manos", image: "parada-de-manos", startUnlocked: true },
      { id: "adho-mukha-vrksasana-flexion", name: "Con flexión", image: "flexion-invertida", startUnlocked: false },
    ],
  },
  {
    id: "eka-pada-adho-mukha-svanasana",
    name: "Eka Pada Adho Mukha Svanasana",
    spanish: "Perro boca abajo a una pierna",
    zone: "Movilidad",
    levels: [
      { id: "eka-pada-adho-mukha-svanasana", name: "A una pierna", image: "perro-con-una-pierna", startUnlocked: true },
    ],
  },
  {
    id: "adho-mukha-svanasana",
    name: "Adho Mukha Svanasana",
    spanish: "Perro boca abajo",
    zone: "Movilidad",
    levels: [
      { id: "adho-mukha-svanasana", name: "Perro boca abajo", image: "perro-boca-abajo", startUnlocked: true },
    ],
  },
  {
    id: "chaturanga",
    name: "Chaturanga Dandasana",
    spanish: "Chaturanga",
    zone: "Fuerza",
    levels: [
      { id: "chaturanga", name: "Chaturanga", image: "flexion-pike", startUnlocked: true },
    ],
  },
  {
    id: "hanumanasana",
    name: "Hanumanasana",
    spanish: "Mono · apertura de piernas",
    zone: "Movilidad",
    levels: [
      { id: "hanumanasana", name: "Hanumanasana", image: "split-frontal", startUnlocked: true },
    ],
  },
  {
    id: "koundinyasana",
    name: "Eka Pada Koundinyasana II",
    spanish: "Koundinyasana II",
    zone: "Equilibrio",
    levels: [
      { id: "koundinyasana-ii", name: "Koundinyasana II", image: "split-volador", startUnlocked: true },
    ],
  },
]

export const POSE_NAMES = POSE_FAMILIES.map((family) => family.name)

export const POSE_PLAN_NAMES = [
  "Bakasana",
  "Sirsasana",
  "Adho Mukha Vrksasana",
  "Eka Pada Adho Mukha Svanasana",
  "Adho Mukha Svanasana",
  "Chaturanga Dandasana",
  "Hanumanasana",
  "Eka Pada Koundinyasana II",
]

export const POSE_IMAGE_FILES = [
  ...new Set(POSE_FAMILIES.flatMap((family) => family.levels.map((level) => level.image))),
]

export function getPoseImage(image) {
  if (!image) return ""
  return `/poses/${image}.png`
}

export function resolvePoseLevels(family, saved = {}) {
  return family.levels.map((level, index) => {
    const stored = saved[level.id]
    const previous = family.levels[index - 1]
    const previousBien = index === 0 || saved[previous.id] === "bien"
    const open = Boolean(stored) || level.startUnlocked || previousBien
    if (!open) {
      return { ...level, status: "locked", open: false }
    }
    const status = stored === "sale" || stored === "bien" ? stored : "open"
    return { ...level, status, open: true }
  })
}
