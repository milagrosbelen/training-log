import { slugExercise } from "../utils/exerciseImages"

export const MUSCLE_LABELS = {
  pecho: "Pecho",
  hombros: "Hombros",
  triceps: "Tríceps",
  biceps: "Bíceps",
  espalda: "Espalda",
  abdominales: "Abdominales",
  cuadriceps: "Cuádriceps",
  gluteos: "Glúteos",
  isquios: "Isquios",
  aductor: "Aductor",
}

const MUSCLE_FROM_LABEL = Object.fromEntries(
  Object.entries(MUSCLE_LABELS).flatMap(([key, label]) => [
    [label.toLowerCase(), key],
    [key, key],
  ])
)

const BACK_MUSCLES = new Set(["espalda", "gluteos", "isquios"])

const CATALOG = {
  "press-de-banca": {
    type: "compuesto",
    primary: "pecho",
    secondary: ["triceps", "hombros"],
    cues: ["Escápulas juntas", "Barra al pecho medio", "Codos ~45°"],
  },
  "press-inclinado": {
    type: "compuesto",
    primary: "pecho",
    secondary: ["hombros", "triceps"],
    cues: ["Banco a 30–45°", "Escápulas apoyadas", "Recorrido controlado"],
  },
  flexiones: {
    type: "compuesto",
    primary: "pecho",
    secondary: ["triceps", "hombros"],
    cues: ["Cuerpo en línea", "Codos cerca del torso", "Pecho al piso"],
  },
  "cruce-de-polea": {
    type: "aislamiento",
    primary: "pecho",
    secondary: ["hombros"],
    cues: ["Pecho abierto", "Cruce al centro", "Sin encoger hombros"],
  },
  fondos: {
    type: "compuesto",
    primary: "pecho",
    secondary: ["triceps", "hombros"],
    cues: ["Torso levemente inclinado", "Codos a 45°", "Bajada controlada"],
  },
  sentadilla: {
    type: "compuesto",
    primary: "cuadriceps",
    secondary: ["gluteos", "isquios"],
    cues: ["Pies al ancho de hombros", "Rodillas al rastro de los pies", "Pecho arriba"],
  },
  "sentadilla-smith": {
    type: "compuesto",
    primary: "cuadriceps",
    secondary: ["gluteos"],
    cues: ["Barra guiada", "Pies un poco adelante", "Bajada controlada"],
  },
  hack: {
    type: "compuesto",
    primary: "cuadriceps",
    secondary: ["gluteos"],
    cues: ["Espalda pegada", "Talones apoyados", "No bloquees rodillas"],
  },
  prensa: {
    type: "compuesto",
    primary: "cuadriceps",
    secondary: ["gluteos"],
    cues: ["Espalda pegada al respaldo", "No bloquees rodillas", "Rango completo"],
  },
  "sillon-de-cuadriceps": {
    type: "aislamiento",
    primary: "cuadriceps",
    secondary: [],
    cues: ["Cadera fija", "Extensión sin impulso", "Bajada lenta"],
  },
  "sentadilla-sumo": {
    type: "compuesto",
    primary: "aductor",
    secondary: ["gluteos", "cuadriceps"],
    cues: ["Pies abiertos", "Rodillas hacia afuera", "Torso erguido"],
  },
  "maquina-de-aductor": {
    type: "aislamiento",
    primary: "aductor",
    secondary: [],
    cues: ["Cadera quieta", "Cierre controlado", "Sin rebotar"],
  },
  "sentadilla-lateral": {
    type: "compuesto",
    primary: "aductor",
    secondary: ["gluteos", "cuadriceps"],
    cues: ["Peso en el talón", "Rodilla alineada", "Pecho adelante"],
  },
  "hip-thrust": {
    type: "compuesto",
    primary: "gluteos",
    secondary: ["isquios"],
    cues: ["Mentón metido", "Empujá con talones", "Pausa arriba"],
  },
  "subidas-al-cajon": {
    type: "compuesto",
    primary: "gluteos",
    secondary: ["cuadriceps"],
    cues: ["Paso completo al cajón", "Rodilla estable", "Subí sin impulso"],
  },
  "bulgaras-caminando-con-mancuernas": {
    type: "compuesto",
    primary: "gluteos",
    secondary: ["cuadriceps"],
    cues: ["Paso largo", "Torso erguido", "Rodilla alineada"],
  },
  "peso-muerto": {
    type: "compuesto",
    primary: "gluteos",
    secondary: ["isquios", "espalda"],
    cues: ["Barra cerca de las piernas", "Espalda neutra", "Cadera hacia atrás"],
  },
  "patada-de-gluteos": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: [],
    cues: ["Cadera cuadrada", "Pierna extendida", "Sin arquear lumbar"],
  },
  "patada-lateral": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: ["aductor"],
    cues: ["Torso quieto", "Pie flexionado", "Rango controlado"],
  },
  "abduccion-con-banda": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: [],
    cues: ["Rodillas hacia afuera", "Tensión constante", "Sin mover la lumbar"],
  },
  "sillon-de-isquios": {
    type: "aislamiento",
    primary: "isquios",
    secondary: ["gluteos"],
    cues: ["Cadera pegada", "Curl sin impulso", "Bajada lenta"],
  },
  "camilla-de-isquios": {
    type: "aislamiento",
    primary: "isquios",
    secondary: ["gluteos"],
    cues: ["Cadera pegada a la camilla", "Talones al glúteo", "Bajada lenta"],
  },
  "calentamiento-dia-1-piernas": {
    type: "aislamiento",
    primary: "cuadriceps",
    secondary: ["isquios", "gluteos"],
    cues: ["Movimiento controlado", "Sin rebotar", "Rango amplio"],
  },
  "movilidad-de-piernas": {
    type: "aislamiento",
    primary: "cuadriceps",
    secondary: ["isquios", "gluteos"],
    cues: ["Movimiento controlado", "Sin rebotar", "Rango amplio"],
  },
  "movilidad-para-el-dia-de-gluteos": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: [],
    cues: ["Banda tensa", "Pasos cortos", "Rodillas hacia afuera"],
  },
  dominadas: {
    type: "compuesto",
    primary: "espalda",
    secondary: ["biceps", "hombros"],
    cues: ["Escápulas abajo", "Pecho a la barra", "Sin balanceo"],
  },
  "jalon-al-pecho": {
    type: "compuesto",
    primary: "espalda",
    secondary: ["biceps"],
    cues: ["Pecho alto", "Codos hacia abajo", "Sin encoger trapecios"],
  },
  "remo-sentado": {
    type: "compuesto",
    primary: "espalda",
    secondary: ["biceps"],
    cues: ["Torso estable", "Codos pegados", "Apretá al final"],
  },
  "pull-over": {
    type: "aislamiento",
    primary: "espalda",
    secondary: ["pecho"],
    cues: ["Codos semi-flexionados", "Estirón amplio", "Sin arquear lumbar"],
  },
  "press-militar": {
    type: "compuesto",
    primary: "hombros",
    secondary: ["triceps"],
    cues: ["Core firme", "Barra cerca de la cara", "No abras demasiado"],
  },
  "vuelos-laterales": {
    type: "aislamiento",
    primary: "hombros",
    secondary: [],
    cues: ["Codos altos", "Sin impulso", "Bajada controlada"],
  },
  "extension-de-triceps": {
    type: "aislamiento",
    primary: "triceps",
    secondary: [],
    cues: ["Codos fijos", "Solo mueve el antebrazo", "Extensión completa"],
  },
  "banco-scott": {
    type: "aislamiento",
    primary: "biceps",
    secondary: [],
    cues: ["Axilas al banco", "Sin balancear", "Estirón abajo"],
  },
  "barra-w": {
    type: "aislamiento",
    primary: "biceps",
    secondary: [],
    cues: ["Codos pegados", "Muñecas firmes", "Subida sin impulso"],
  },
  martillo: {
    type: "aislamiento",
    primary: "biceps",
    secondary: [],
    cues: ["Agarre neutro", "Codos quietos", "Control en la bajada"],
  },
  "crunch-normal": {
    type: "aislamiento",
    primary: "abdominales",
    secondary: [],
    cues: ["Mentón separado", "Enrollá el torso", "Sin tirar del cuello"],
  },
  "elevacion-de-piernas": {
    type: "aislamiento",
    primary: "abdominales",
    secondary: [],
    cues: ["Lumbar pegada", "Piernas controladas", "Sin balanceo"],
  },
  plancha: {
    type: "aislamiento",
    primary: "abdominales",
    secondary: ["hombros"],
    cues: ["Cuerpo en línea", "Glúteos activos", "Sin hundir cadera"],
  },
  "movilidad-con-banda-para-torso": {
    type: "aislamiento",
    primary: "abdominales",
    secondary: ["espalda"],
    cues: ["Cadera quieta", "Rotá desde el torso", "Sin rebotar"],
  },
}

const KEYWORD_RULES = [
  { test: /banca|press inclin|flexion|cruce|pec fly|aperturas/, primary: "pecho", secondary: ["triceps", "hombros"], type: "compuesto" },
  { test: /dominad|jalon|remo|pull ?over|espalda/, primary: "espalda", secondary: ["biceps"], type: "compuesto" },
  { test: /militar|vuelo|hombro|laterales/, primary: "hombros", secondary: ["triceps"], type: "aislamiento" },
  { test: /triceps|fondo|extension/, primary: "triceps", secondary: [], type: "aislamiento" },
  { test: /biceps|curl|scott|martillo|barra w/, primary: "biceps", secondary: [], type: "aislamiento" },
  { test: /sentadilla|prensa|cuadriceps|hack|smith/, primary: "cuadriceps", secondary: ["gluteos"], type: "compuesto" },
  { test: /hip thrust|glute|patada|cajon|abduc|bulgara/, primary: "gluteos", secondary: ["isquios"], type: "compuesto" },
  { test: /camilla|sillon.*isq|isq.*sillon|femoral/, primary: "isquios", secondary: ["gluteos"], type: "aislamiento" },
  { test: /peso muerto/, primary: "isquios", secondary: ["gluteos", "espalda"], type: "compuesto" },
  { test: /aductor|sumo/, primary: "aductor", secondary: ["gluteos"], type: "compuesto" },
  { test: /crunch|plancha|abdomen|piernas|movilidad/, primary: "abdominales", secondary: [], type: "aislamiento" },
]

const DEFAULT_CUES = {
  pecho: ["Escápulas juntas", "Pecho alto", "Recorrido controlado"],
  hombros: ["Core firme", "Sin encoger trapecios", "Codos alineados"],
  triceps: ["Codos fijos", "Extensión completa", "Sin impulso"],
  biceps: ["Codos pegados", "Sin balancear", "Bajada lenta"],
  espalda: ["Escápulas abajo", "Pecho abierto", "Sin redondear lumbar"],
  abdominales: ["Lumbar estable", "Respirá en cada rep", "Sin tirar del cuello"],
  cuadriceps: ["Rodillas alineadas", "Peso en talones", "Torso estable"],
  gluteos: ["Empujá con talones", "Pausa arriba", "Sin arquear lumbar"],
  isquios: ["Cadera hacia atrás", "Espalda neutra", "Control en la bajada"],
  aductor: ["Rodillas hacia afuera", "Cadera quieta", "Rango controlado"],
}

function muscleKeyFromLabel(value) {
  const raw = String(value || "").trim().toLowerCase()
  if (!raw) return ""
  if (MUSCLE_FROM_LABEL[raw]) return MUSCLE_FROM_LABEL[raw]
  const slug = slugExercise(raw).replace(/-/g, "")
  return Object.keys(MUSCLE_LABELS).find((key) => key.replace(/-/g, "") === slug) || ""
}

function fromKeywords(name) {
  const haystack = slugExercise(name).replace(/-/g, " ")
  const rule = KEYWORD_RULES.find((item) => item.test.test(haystack))
  if (!rule) return null
  return {
    type: rule.type,
    primary: rule.primary,
    secondary: rule.secondary,
    cues: DEFAULT_CUES[rule.primary] || DEFAULT_CUES.pecho,
  }
}

export function resolveExerciseMeta(exercise) {
  const name = exercise?.name || ""
  const slug = slugExercise(name)
  const listed = CATALOG[slug]
  const inferred = listed || fromKeywords(name)
  const assigned = muscleKeyFromLabel(exercise?.muscle)

  const primary = inferred?.primary || assigned || "pecho"
  const secondary = (inferred?.secondary || []).filter((key) => key !== primary)
  const type = inferred?.type || "compuesto"

  return {
    name,
    type,
    typeLabel: type === "aislamiento" ? "Aislamiento" : "Compuesto",
    primary,
    primaryLabel: MUSCLE_LABELS[primary] || "Músculo",
    secondary,
    secondaryLabels: secondary.map((key) => MUSCLE_LABELS[key]).filter(Boolean),
    muscles: [primary, ...secondary],
    cues: inferred?.cues || DEFAULT_CUES[primary] || DEFAULT_CUES.pecho,
    preferredView: BACK_MUSCLES.has(primary) ? "back" : "front",
  }
}
