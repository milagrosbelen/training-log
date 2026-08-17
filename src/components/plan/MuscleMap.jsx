const FRONT = {
  pecho: "/anatomy/anatomy-front-pecho.jpg",
  hombros: "/anatomy/anatomy-front-hombros.jpg",
  biceps: "/anatomy/anatomy-front-biceps.jpg",
  triceps: "/anatomy/anatomy-front-triceps.jpg",
  abdominales: "/anatomy/anatomy-front-abdominales.jpg",
  cuadriceps: "/anatomy/anatomy-front-cuadriceps.jpg",
  aductor: "/anatomy/anatomy-front-aductor.jpg",
  completo: "/anatomy/anatomy-front-completo.jpg",
}

const BACK = {
  espalda: "/anatomy/anatomy-back-espalda.jpg",
  hombros: "/anatomy/anatomy-back-hombros.jpg",
  triceps: "/anatomy/anatomy-back-triceps.jpg",
  gluteos: "/anatomy/anatomy-back-gluteos.jpg",
  isquios: "/anatomy/anatomy-back-isquios.jpg",
  completo: "/anatomy/anatomy-back-completo.jpg",
}

const FRONT_BASE = "/anatomy/anatomy-front.jpg"
const BACK_BASE = "/anatomy/anatomy-back.jpg"
const BACK_LEGS = "/anatomy/anatomy-back-legs.jpg"

const LOWER = new Set(["gluteos", "isquios", "cuadriceps", "aductor"])
const FULL_BODY = new Set(["completo"])

export function anatomySrc(primary, view) {
  if (view === "back") {
    if (BACK[primary]) return BACK[primary]
    if (LOWER.has(primary)) return BACK_LEGS
    return BACK_BASE
  }
  return FRONT[primary] || FRONT_BASE
}

export default function MuscleMap({ primary, view = "front", className = "" }) {
  const src = anatomySrc(primary, view)
  const fit = FULL_BODY.has(primary)
    ? "object-contain object-center"
    : LOWER.has(primary)
      ? "object-cover object-center"
      : "object-cover object-top"

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        key={src}
        src={src}
        alt=""
        className={`absolute inset-0 h-full w-full ${fit}`}
      />
      <div className={`absolute inset-0 ${FULL_BODY.has(primary) ? "bg-gradient-to-t from-black/55 via-transparent to-transparent" : "bg-gradient-to-t from-black via-black/25 to-transparent"}`} />
    </div>
  )
}
