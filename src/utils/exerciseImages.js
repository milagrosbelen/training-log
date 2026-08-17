import { ROUTINES } from "../data/routines"
import { POSE_IMAGE_FILES } from "../data/poseProgressions"

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
  "abs-completo-con-disco",
  "abs-para-oblicuos-con-pelota",
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
  "curl-biceps-banco-inclinado",
  "patada-de-gluteos-lateral-en-polea",
  "movilidad-con-banda-para-torso",
  "movilidad-de-piernas",
  "movilidad-dinamica",
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

const POSE_ALIASES = {
  "perro-boca-abajo-con-una-pierna": "perro-con-una-pierna",
  "perro-con-una-pierna": "perro-con-una-pierna",
  "eka-pada-adho-mukha-svanasana": "perro-con-una-pierna",
  "adho-mukha-svanasana": "perro-boca-abajo",
  "perro-boca-abajo": "perro-boca-abajo",
  bakasana: "cuervo",
  cuervo: "cuervo",
  kakasana: "cuervo-brazos-rectos",
  "cuervo-con-cabeza": "cuervo-con-cabeza",
  "cuervo-con-apoyo-de-cabeza": "cuervo-con-cabeza",
  "bajar-normal": "cuervo-con-cabeza",
  "bajar-piernas-juntas": "tripode-encogida",
  "tripode-encogida": "tripode-encogida",
  sirsasana: "invertida-de-cabeza",
  "salamba-sirsasana": "invertida-de-cabeza",
  "invertida-de-cabeza": "invertida-de-cabeza",
  "sirsasana-ii": "tripode-completa",
  "adho-mukha-vrksasana": "parada-de-manos",
  "parada-de-manos": "parada-de-manos",
  handstand: "parada-de-manos",
  chaturanga: "flexion-pike",
  "chaturanga-dandasana": "flexion-pike",
  "flexion-pike": "flexion-pike",
  "pike-push-up": "flexion-pike",
  hanumanasana: "split-frontal",
  mono: "split-frontal",
  "split-frontal": "split-frontal",
  "apertura-de-piernas": "split-frontal",
  "eka-pada-koundinyasana-ii": "split-volador",
  "eka-pada-koundinyasana": "split-volador",
  "koundinyasana-ii": "split-volador",
  koundinyasana: "split-volador",
  "split-volador": "split-volador",
  "split-volando": "split-volador",
}

const POSE_FILES = new Set(POSE_IMAGE_FILES)

const HOME_IMAGE_FILES = new Set(["burpees", "saltos-en-soga", "baile"])

const HOME_ALIASES = {
  burpee: "burpees",
  "saltos-de-soga": "saltos-en-soga",
  soga: "saltos-en-soga",
  "jumping-rope": "saltos-en-soga",
  comba: "saltos-en-soga",
  skipping: "saltos-en-soga",
  danza: "baile",
  zumba: "baile",
  coreo: "baile",
  coreografia: "baile",
  "crear-una-coreo": "baile",
  "crear-coreo": "baile",
}

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
  "movilidad-de-gluteos": "calentamiento-con-banda-movilidad",
  "movilidad-gluteos": "calentamiento-con-banda-movilidad",
  "movilidad-con-banda-de-piernas": "calentamiento-con-banda-movilidad",
  "movilidad-para-el-dia-de-gluteos": "calentamiento-con-banda-movilidad",
  "calentamiento-con-banda-en-las-piernas": "calentamiento-con-banda-movilidad",
  "calentamiento-con-banda-piernas": "calentamiento-con-banda-movilidad",
  "calentamiento-banda-piernas": "calentamiento-con-banda-movilidad",
  "abs-completo": "abs-completo-con-disco",
  "abs-con-disco": "abs-completo-con-disco",
  "abdominales-con-disco": "abs-completo-con-disco",
  "crunch-con-disco": "abs-completo-con-disco",
  "oblicuos-con-pelota": "abs-para-oblicuos-con-pelota",
  "abs-oblicuos": "abs-para-oblicuos-con-pelota",
  "abs-con-pelota": "abs-para-oblicuos-con-pelota",
  "oblicuos": "abs-para-oblicuos-con-pelota",
  "curl-en-banco-inclinado": "curl-biceps-banco-inclinado",
  "curl-de-biceps-en-banco-inclinado": "curl-biceps-banco-inclinado",
  "curl-de-biceps-banco-inclinado": "curl-biceps-banco-inclinado",
  "curl-inclinado": "curl-biceps-banco-inclinado",
  "curl-biceps-inclinado": "curl-biceps-banco-inclinado",
  "biceps-banco-inclinado": "curl-biceps-banco-inclinado",
  "pullover": "pull-over",
  "pull-over-en-polea": "pull-over",
  "pullover-en-polea": "pull-over",
  "fondos-en-banco": "fondos",
  "fondos-en-el-banco": "fondos",
  "fondo-en-banco": "fondos",
  "maquina-de-abduccion": "maquina-de-abductor",
  "maquina-abduccion": "maquina-de-abductor",
  "abduccion-maquina": "maquina-de-abductor",
  "patada-lateral": "patada-de-gluteos-lateral-en-polea",
  "patada-lateral-en-polea": "patada-de-gluteos-lateral-en-polea",
  "patada-de-gluteos-lateral": "patada-de-gluteos-lateral-en-polea",
  "movilidad-dinamica-sin-banda": "movilidad-dinamica",
  "movilidad-dinamica-sin-bandas": "movilidad-dinamica",
}

const KEYWORD_FILES = [
  { test: /camilla/, file: "camilla-de-isquios" },
  { test: /sillon.*isq|isq.*sillon|femoral/, file: "camilla-de-isquios" },
  { test: /bulgara|zancada.*camin|caminando.*mancuerna/, file: "bulgaras-caminando-con-mancuernas" },
  { test: /calentamiento.*banda|banda.*calentamiento|calentamiento.*pierna.*banda|banda.*pierna/, file: "calentamiento-con-banda-movilidad" },
  { test: /movilidad.*glute|glute.*movilidad|dia de glute/, file: "calentamiento-con-banda-movilidad" },
  { test: /calentamiento.*pierna|dia.?1.*pierna|pierna.*calentamiento/, file: "calentamiento-dia-1-piernas" },
  { test: /movilidad.*dinamica|dinamica/, file: "movilidad-dinamica" },
  { test: /movilidad.*pierna|estiramiento/, file: "movilidad-de-piernas" },
  { test: /torso.*banda|banda.*torso/, file: "movilidad-con-banda-para-torso" },
  { test: /smith/, file: "sentadilla-smith" },
  { test: /hack/, file: "hack" },
  { test: /curl.*inclin|inclin.*curl|biceps.*inclin|inclin.*biceps/, file: "curl-biceps-banco-inclinado" },
  { test: /maquina.*abduc|abduc.*maquina|abductor/, file: "maquina-de-abductor" },
  { test: /patada.*lateral.*polea|lateral.*polea|patada.*polea/, file: "patada-de-gluteos-lateral-en-polea" },
  { test: /patada.*lateral|lateral.*patada/, file: "patada-de-gluteos-lateral-en-polea" },
  { test: /patada/, file: "patada-de-gluteos" },
  { test: /abduccion|banda.*camin/, file: "abduccion-lateral-con-banda-caminando" },
  { test: /aductor/, file: "maquina-de-aductor" },
  { test: /prensa/, file: "prensa" },
  { test: /sillon.*cuad|cuad.*sillon|extension.*pierna/, file: "sillon-de-cuadriceps" },
  { test: /sumo/, file: "sentadilla-sumo" },
  { test: /sentadilla.*lateral|lateral.*sentadilla/, file: "sentadilla-lateral" },
  { test: /sentadilla/, file: "sentadilla" },
  { test: /hip.?thrust/, file: "hip-thrust" },
  { test: /cajon|step.?up/, file: "subidas-al-cajon" },
  { test: /peso.?muerto/, file: "peso-muerto" },
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
  { test: /oblicuo|pelota.*abs|abs.*pelota/, file: "abs-para-oblicuos-con-pelota" },
  { test: /disco.*abs|abs.*disco|abs.*completo|crunch.*disco/, file: "abs-completo-con-disco" },
  { test: /crunch/, file: "crunch-normal" },
  { test: /elevacion|leg.?raise/, file: "elevacion-de-piernas" },
  { test: /plancha/, file: "plancha" },
  { test: /cinta/, file: "cinta" },
]

export const EXERCISE_PHOTO_FALLBACK = "/home-hero-bench.png"
const IMAGE_VERSION = "3"

export function resolveExerciseImageFile(name) {
  const slug = slugExercise(name)
  if (!slug) return ""
  if (POSE_ALIASES[slug]) return POSE_ALIASES[slug]
  if (POSE_FILES.has(slug)) return slug
  if (HOME_ALIASES[slug]) return HOME_ALIASES[slug]
  if (HOME_IMAGE_FILES.has(slug)) return slug
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
  if (HOME_IMAGE_FILES.has(file) || Object.values(HOME_ALIASES).includes(file)) {
    return `/poses/${file}.png?v=home1`
  }
  if (POSE_FILES.has(file) || Object.values(POSE_ALIASES).includes(file)) {
    return `/poses/${file}.png`
  }
  return `/exercises/${file}.png?v=${IMAGE_VERSION}`
}
