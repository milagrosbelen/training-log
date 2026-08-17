export const HOME_ROUTINES = {
  Aeróbico: [
    "Burpees",
    "Saltos en soga",
    "Baile",
    "Flexiones",
    "Jumping jacks",
    "Mountain climbers",
    "Sentadillas",
    "Zancadas",
    "Skipping",
    "Plancha",
  ],
  "Yoga + calistenia": [
    "Adho Mukha Svanasana",
    "Eka Pada Adho Mukha Svanasana",
    "Bakasana",
    "Chaturanga Dandasana",
    "Sirsasana",
    "Adho Mukha Vrksasana",
    "Hanumanasana",
    "Eka Pada Koundinyasana II",
    "Plancha",
    "L-sit",
    "Fondos",
    "Flexiones",
  ],
  Mix: [
    "Burpees",
    "Saltos en soga",
    "Baile",
    "Flexiones",
    "Bakasana",
    "Adho Mukha Vrksasana",
    "Hanumanasana",
    "Plancha",
    "Core",
  ],
}

export const HOME_SESSION_TITLES = [
  "Aeróbico",
  "Yoga + calistenia",
  "Mix",
  "Baile",
  "Movilidad",
  "Fuerza",
  "Core",
]

export const HOME_OBJECTIVE_OPTIONS = [
  "Constancia",
  "Movilidad",
  "Equilibrio",
  "Fuerza",
  "Energía",
  "Flexibilidad",
]

export const HOME_ZONE_OPTIONS = [
  "Full body",
  "Core",
  "Piernas",
  "Brazos",
  "Equilibrio",
  "Movilidad",
]

export const HOME_EXERCISE_SUGGESTIONS = [
  ...new Set(Object.values(HOME_ROUTINES).flat()),
]
