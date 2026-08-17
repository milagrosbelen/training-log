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
  completo: "Completo",
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
    cues: ["Manos al borde del banco", "Codos atrás", "Bajada controlada"],
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
  "maquina-de-abduccion": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: [],
    cues: ["Espalda pegada", "Abrí las rodillas", "Sin rebotar"],
  },
  "maquina-de-abductor": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: [],
    cues: ["Espalda pegada", "Abrí las rodillas", "Sin rebotar"],
  },
  "patada-de-gluteos-lateral-en-polea": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: [],
    cues: ["Torso estable", "Pierna al costado", "Sin girar la cadera"],
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
  "movilidad-dinamica": {
    type: "aislamiento",
    primary: "cuadriceps",
    secondary: ["gluteos", "isquios"],
    cues: ["Sin bandas", "Rango amplio", "Movimiento controlado"],
  },
  "movilidad-para-el-dia-de-gluteos": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: [],
    cues: ["Banda tensa", "Pasos cortos", "Rodillas hacia afuera"],
  },
  "calentamiento-con-banda-en-las-piernas": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: [],
    cues: ["Banda sobre las rodillas", "Pasos cortos", "Rodillas hacia afuera"],
  },
  "calentamiento-con-banda-movilidad": {
    type: "aislamiento",
    primary: "gluteos",
    secondary: [],
    cues: ["Banda sobre las rodillas", "Pasos cortos", "Rodillas hacia afuera"],
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
    cues: ["Polea alta", "Brazos semi-extendidos", "Llevá la soga a la cadera"],
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
  "curl-en-banco-inclinado": {
    type: "aislamiento",
    primary: "biceps",
    secondary: [],
    cues: ["Espalda pegada al banco", "Brazos atrás", "Sin impulso"],
  },
  "curl-biceps-banco-inclinado": {
    type: "aislamiento",
    primary: "biceps",
    secondary: [],
    cues: ["Espalda pegada al banco", "Brazos atrás", "Sin impulso"],
  },
  "curl-de-biceps-en-banco-inclinado": {
    type: "aislamiento",
    primary: "biceps",
    secondary: [],
    cues: ["Espalda pegada al banco", "Brazos atrás", "Sin impulso"],
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
  "abs-completo-con-disco": {
    type: "aislamiento",
    primary: "abdominales",
    secondary: [],
    cues: ["Disco pegado al pecho", "Enrollá el torso", "Lumbar controlada"],
  },
  "abs-para-oblicuos-con-pelota": {
    type: "aislamiento",
    primary: "abdominales",
    secondary: [],
    cues: ["Rotá desde el torso", "Pelota estable", "Sin tirar del cuello"],
  },
  "movilidad-con-banda-para-torso": {
    type: "aislamiento",
    primary: "abdominales",
    secondary: ["espalda"],
    cues: ["Cadera quieta", "Rotá desde el torso", "Sin rebotar"],
  },
  cinta: {
    type: "compuesto",
    primary: "completo",
    secondary: [],
    cues: ["Postura erguida", "Paso natural", "Respirá constante"],
  },
}

const KEYWORD_RULES = [
  { test: /cinta|eliptica|cardio|full.?body|cuerpo.?completo|todo.?el.?cuerpo/, primary: "completo", secondary: [], type: "compuesto" },
  { test: /banca|press inclin|flexion|cruce|pec fly|aperturas/, primary: "pecho", secondary: ["triceps", "hombros"], type: "compuesto" },
  { test: /dominad|jalon|remo|pull ?over|espalda/, primary: "espalda", secondary: ["biceps"], type: "compuesto" },
  { test: /militar|vuelo|hombro|laterales/, primary: "hombros", secondary: ["triceps"], type: "aislamiento" },
  { test: /triceps|fondo|extension/, primary: "triceps", secondary: [], type: "aislamiento" },
  { test: /biceps|curl|scott|martillo|barra w/, primary: "biceps", secondary: [], type: "aislamiento" },
  { test: /sentadilla|prensa|cuadriceps|hack|smith/, primary: "cuadriceps", secondary: ["gluteos"], type: "compuesto" },
  { test: /calentamiento.*banda|banda.*pierna|movilidad.*glute|dia de glute/, primary: "gluteos", secondary: [], type: "aislamiento" },
  { test: /hip thrust|glute|patada|cajon|abduc|bulgara/, primary: "gluteos", secondary: ["isquios"], type: "compuesto" },
  { test: /camilla|sillon.*isq|isq.*sillon|femoral/, primary: "isquios", secondary: ["gluteos"], type: "aislamiento" },
  { test: /peso muerto/, primary: "isquios", secondary: ["gluteos", "espalda"], type: "compuesto" },
  { test: /aductor|sumo/, primary: "aductor", secondary: ["gluteos"], type: "compuesto" },
  { test: /calentamiento.*pierna|movilidad.*pierna/, primary: "cuadriceps", secondary: ["gluteos", "isquios"], type: "aislamiento" },
  { test: /crunch|plancha|abdomen|oblicuo/, primary: "abdominales", secondary: [], type: "aislamiento" },
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
  completo: ["Postura estable", "Movimiento controlado", "Respirá constante"],
}

const MUSCLE_ALIASES = {
  "cuerpo completo": "completo",
  "full body": "completo",
  fullbody: "completo",
  "todo el cuerpo": "completo",
  cardio: "completo",
}

function muscleKeyFromLabel(value) {
  const raw = String(value || "").trim().toLowerCase()
  if (!raw) return ""
  if (MUSCLE_FROM_LABEL[raw]) return MUSCLE_FROM_LABEL[raw]
  if (MUSCLE_ALIASES[raw]) return MUSCLE_ALIASES[raw]
  const slug = slugExercise(raw).replace(/-/g, "")
  return Object.keys(MUSCLE_LABELS).find((key) => key.replace(/-/g, "") === slug) || ""
}

export function suggestedMuscleLabel(name) {
  const inferred = CATALOG[slugExercise(name)] || fromKeywords(name)
  if (!inferred?.primary) return ""
  return MUSCLE_LABELS[inferred.primary] || ""
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

  const primary = assigned || inferred?.primary || "pecho"
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
