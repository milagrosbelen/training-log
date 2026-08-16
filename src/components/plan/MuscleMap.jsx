const FRONT = {
  pecho: "/anatomy/anatomy-front-pecho.jpg",
  hombros: "/anatomy/anatomy-front-hombros.jpg",
  biceps: "/anatomy/anatomy-front-biceps.jpg",
  triceps: "/anatomy/anatomy-front-triceps.jpg",
  abdominales: "/anatomy/anatomy-front-abdominales.jpg",
  cuadriceps: "/anatomy/anatomy-front-cuadriceps.jpg",
  aductor: "/anatomy/anatomy-front-aductor.jpg",
}

const BACK = {
  espalda: "/anatomy/anatomy-back-espalda.jpg",
  hombros: "/anatomy/anatomy-back-hombros.jpg",
  triceps: "/anatomy/anatomy-back-triceps.jpg",
  gluteos: "/anatomy/anatomy-back-gluteos.jpg",
  isquios: "/anatomy/anatomy-back-isquios.jpg",
}

const FRONT_BASE = "/anatomy/anatomy-front.jpg"
const BACK_BASE = "/anatomy/anatomy-back.jpg"
const BACK_LEGS = "/anatomy/anatomy-back-legs.jpg"

const LOWER = new Set(["gluteos", "isquios", "cuadriceps", "aductor"])

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
  const crop = LOWER.has(primary) ? "object-center" : "object-top"

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        key={src}
        src={src}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover ${crop}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
    </div>
  )
}
