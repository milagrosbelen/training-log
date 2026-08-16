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

const KNOWN_FILES = new Set([
  "abduccion-lateral-con-banda-caminando",
  "banco-scott",
  "barra-w",
  "bulgaras-caminando-con-mancuernas",
  "calentamiento-con-banda-movilidad",
  "calentamiento-dia-1-piernas",
  "camilla-de-isquios",
  "cinta",
  "cruce-de-polea",
  "crunch-normal",
  "dominadas",
  "elevacion-de-piernas",
  "extension-de-triceps",
  "flexiones",
  "fondos",
  "hack",
  "hip-thrust",
  "jalon-al-pecho",
  "maquina-de-abductor",
  "maquina-de-aductor",
  "martillo",
  "movilidad-con-banda-para-torso",
  "movilidad-de-piernas",
  "movilidad-para-el-dia-de-gluteos",
  "patada-de-gluteos",
  "patada-lateral",
  "peso-muerto",
  "plancha",
  "prensa",
  "press-de-banca",
  "press-inclinado",
  "press-militar",
  "pull-over",
  "remo-sentado",
  "sentadilla",
  "sentadilla-lateral",
  "sentadilla-smith",
  "sentadilla-sumo",
  "sillon-de-cuadriceps",
  "sillon-de-isquios",
  "subidas-al-cajon",
  "vuelos-laterales",
])

const IMAGE_ALIASES = {
  "abduccion-con-banda": "abduccion-lateral-con-banda-caminando",
  "hack-squat": "hack",
  "prensa-hack": "hack",
  "sentadilla-en-smith": "sentadilla-smith",
  "sentadilla-en-el-smith": "sentadilla-smith",
  "movilidad-torso-con-banda": "movilidad-con-banda-para-torso",
  "movilidad-con-banda": "movilidad-con-banda-para-torso",
  "calentamiento-con-banda": "calentamiento-con-banda-movilidad",
  "calentamiento-dia-1": "calentamiento-dia-1-piernas",
  "calentamiento-de-piernas": "calentamiento-dia-1-piernas",
  "calentamiento-piernas": "calentamiento-dia-1-piernas",
  "sillon-de-isquios": "camilla-de-isquios",
  "femoral": "camilla-de-isquios",
  "curl-femoral": "camilla-de-isquios",
  "zancadas-caminando": "bulgaras-caminando-con-mancuernas",
  "zancadas-caminando-con-mancuernas": "bulgaras-caminando-con-mancuernas",
  "bulgaras": "bulgaras-caminando-con-mancuernas",
  "bulgaras-con-mancuernas": "bulgaras-caminando-con-mancuernas",
  "movilidad-piernas": "movilidad-de-piernas",
  "estiramiento-dinamico": "movilidad-de-piernas",
  "movilidad-de-gluteos": "movilidad-para-el-dia-de-gluteos",
  "movilidad-gluteos": "movilidad-para-el-dia-de-gluteos",
  "movilidad-con-banda-de-piernas": "movilidad-para-el-dia-de-gluteos",
}

const KEYWORD_FILES = [
  { test: /camilla/, file: "camilla-de-isquios" },
  { test: /sillon.*isq|isq.*sillon|femoral/, file: "camilla-de-isquios" },
  { test: /bulgara|zancada.*camin|caminando.*mancuerna/, file: "bulgaras-caminando-con-mancuernas" },
  { test: /movilidad.*glute|glute.*movilidad|banda.*pierna|dia de glute/, file: "movilidad-para-el-dia-de-gluteos" },
  { test: /calentamiento.*pierna|dia.?1.*pierna|pierna.*calentamiento/, file: "calentamiento-dia-1-piernas" },
  { test: /movilidad.*pierna|estiramiento|dinamico/, file: "movilidad-de-piernas" },
  { test: /torso.*banda|banda.*torso/, file: "movilidad-con-banda-para-torso" },
  { test: /smith/, file: "sentadilla-smith" },
  { test: /hack/, file: "hack" },
  { test: /calentamiento/, file: "calentamiento-con-banda-movilidad" },
  { test: /abduccion|banda.*camin/, file: "abduccion-lateral-con-banda-caminando" },
  { test: /aductor/, file: "maquina-de-aductor" },
  { test: /abductor/, file: "maquina-de-abductor" },
  { test: /prensa/, file: "prensa" },
  { test: /sillon.*cuad|cuad.*sillon|extension.*pierna/, file: "sillon-de-cuadriceps" },
  { test: /sumo/, file: "sentadilla-sumo" },
  { test: /sentadilla.*lateral|lateral.*sentadilla/, file: "sentadilla-lateral" },
  { test: /sentadilla/, file: "sentadilla" },
  { test: /hip.?thrust/, file: "hip-thrust" },
  { test: /cajon|step.?up/, file: "subidas-al-cajon" },
  { test: /peso.?muerto/, file: "peso-muerto" },
  { test: /patada.*lateral|lateral.*patada/, file: "patada-lateral" },
  { test: /patada/, file: "patada-de-gluteos" },
  { test: /dominad/, file: "dominadas" },
  { test: /jalon/, file: "jalon-al-pecho" },
  { test: /remo/, file: "remo-sentado" },
  { test: /pull.?over|pullover/, file: "pull-over" },
  { test: /inclinad/, file: "press-inclinado" },
  { test: /banca|bench/, file: "press-de-banca" },
  { test: /flexion/, file: "flexiones" },
  { test: /cruce|crossover/, file: "cruce-de-polea" },
  { test: /fondo/, file: "fondos" },
  { test: /militar/, file: "press-militar" },
  { test: /vuelo/, file: "vuelos-laterales" },
  { test: /triceps/, file: "extension-de-triceps" },
  { test: /scott|preacher/, file: "banco-scott" },
  { test: /barra.?w|ez/, file: "barra-w" },
  { test: /martillo/, file: "martillo" },
  { test: /crunch/, file: "crunch-normal" },
  { test: /elevacion|leg.?raise/, file: "elevacion-de-piernas" },
  { test: /plancha/, file: "plancha" },
  { test: /cinta/, file: "cinta" },
]

export const EXERCISE_PHOTO_FALLBACK = "/home-hero-bench.png"

export function resolveExerciseImageFile(name) {
  const slug = slugExercise(name)
  if (!slug) return ""
  if (IMAGE_ALIASES[slug]) return IMAGE_ALIASES[slug]
  if (KNOWN_FILES.has(slug)) return slug

  let best = ""
  for (const file of KNOWN_FILES) {
    if (slug.includes(file) && file.length > best.length) best = file
  }
  if (best) return best

  const haystack = slug.replace(/-/g, " ")
  return KEYWORD_FILES.find((item) => item.test.test(haystack))?.file || ""
}

export function getExerciseImage(name) {
  const file = resolveExerciseImageFile(name)
  if (!file) return EXERCISE_PHOTO_FALLBACK
  return `/exercises/${file}.png`
}
