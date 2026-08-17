import { useEffect, useMemo, useState } from "react"
import { Lock } from "lucide-react"
import { getPoseProgress, updatePoseProgress } from "../../services/poseService"
import {
  POSE_FAMILIES,
  POSE_STATUSES,
  getPoseImage,
  poseStatusMeta,
  resolvePoseLevels,
} from "../../data/poseProgressions"
import {
  customPoseId,
  findCatalogPose,
  listPoseCards,
  matchCatalogPoseByName,
  todayISODate,
  upsertPoseEntry,
} from "../../utils/poseLadder"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.45)"

export default function PoseProgressSection() {
  const [saved, setSaved] = useState({})
  const [hint, setHint] = useState("")
  const [newName, setNewName] = useState("")
  const [savingNew, setSavingNew] = useState(false)

  useEffect(() => {
    getPoseProgress()
      .then((progress) => setSaved(progress && typeof progress === "object" ? progress : {}))
      .catch(() => {})
  }, [])

  const persist = async (next) => {
    setSaved(next)
    try {
      const stored = await updatePoseProgress(next)
      setSaved(stored && typeof stored === "object" ? stored : next)
      return stored
    } catch {
      setSaved(saved)
      return null
    }
  }

  const families = useMemo(
    () => POSE_FAMILIES.map((family) => ({
      ...family,
      levels: resolvePoseLevels(family, saved),
    })),
    [saved]
  )

  const customCards = useMemo(
    () => listPoseCards(saved).filter((card) => card.custom),
    [saved]
  )

  const counts = useMemo(() => {
    const cards = listPoseCards(saved).filter((card) => card.status)
    return {
      reto: cards.filter((card) => poseStatusMeta(card.status)?.kind === "reto").length,
      sale: cards.filter((card) => card.status === "sale").length,
      domino: cards.filter((card) => card.status === "domino").length,
    }
  }, [saved])

  const setStatus = async (levelId, status, extra = {}) => {
    const catalog = findCatalogPose(levelId)
    const current = saved[levelId]?.status
    const nextStatus = current === status ? "" : status
    const next = upsertPoseEntry(saved, levelId, {
      status: nextStatus,
      name: extra.name || catalog?.title || saved[levelId]?.name || "",
      spanish: extra.spanish || catalog?.spanish || saved[levelId]?.spanish || "",
      source: extra.source || saved[levelId]?.source || "",
      last_practiced: saved[levelId]?.last_practiced || "",
    })
    setHint("")
    await persist(next)
  }

  const addFromClass = async (status) => {
    const name = newName.trim()
    if (!name) {
      setHint("Escribí el nombre de la pose que dio la profe.")
      return
    }
    setSavingNew(true)
    const catalog = matchCatalogPoseByName(name)
    const id = catalog?.id || customPoseId(name)
    const next = upsertPoseEntry(saved, id, {
      status,
      name: catalog?.title || name,
      spanish: catalog?.spanish || "",
      source: "clase",
      last_practiced: todayISODate(),
    })
    const stored = await persist(next)
    if (stored) {
      setNewName("")
      setHint(`${catalog?.title || name}: ${poseStatusMeta(status)?.label || "anotada"}.`)
    }
    setSavingNew(false)
  }

  return (
    <section className="mt-10">
      <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
        Escalera de poses
      </p>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        Cada pose tiene su nivel. Lo fácil y lo que ya cerraste se lee acá, no del día de la semana.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <SummaryChip value={counts.reto} label="en reto" />
        <SummaryChip value={counts.sale} label="me salen" />
        <SummaryChip value={counts.domino} label="las domino" />
      </div>
      {hint ? <p className="mt-3 text-[12px] italic" style={{ color: BLAZE }}>{hint}</p> : null}

      <div
        className="mt-5 rounded-[24px] border px-4 py-4"
        style={{ borderColor: "rgba(255,92,0,0.45)" }}
      >
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: BLAZE }}>
          De la clase
        </p>
        <p className="mt-1 text-[12px] text-slate-500">Martes o jueves, anotá lo nuevo que dio la profe.</p>
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Ej: Navasana, Bakasana..."
          className="mt-3 w-full h-11 rounded-2xl bg-black border border-white/15 px-3 text-sm text-white outline-none"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={savingNew}
            onClick={() => addFromClass("vi")}
            className="h-10 rounded-full text-[12px] font-semibold text-white border border-white/20"
          >
            La vi en clase
          </button>
          <button
            type="button"
            disabled={savingNew}
            onClick={() => addFromClass("aprendiendo")}
            className="h-10 rounded-full text-[12px] font-semibold"
            style={{ backgroundColor: BLAZE, color: "#080809" }}
          >
            La estoy aprendiendo
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {families.map((family) => (
          <PoseFamilyBlock
            key={family.id}
            family={family}
            onLocked={(index) => {
              const prev = family.levels[index - 1]
              setHint(prev ? `Primero llegá a “me sale” en ${prev.name}.` : "Esta pose todavía está bloqueada.")
            }}
            onStatus={setStatus}
          />
        ))}
        {customCards.length ? (
          <PoseFamilyBlock
            family={{
              id: "clase",
              name: "De clase",
              spanish: "Las que anotaste de la profe",
              zone: "Nuevas",
              levels: customCards.map((card) => ({
                id: card.id,
                name: card.title,
                image: "",
                status: card.status || "open",
                open: true,
              })),
            }}
            onLocked={() => {}}
            onStatus={(id, status) => setStatus(id, status, { source: "clase", name: saved[id]?.name })}
          />
        ) : null}
      </div>
    </section>
  )
}

function SummaryChip({ value, label }) {
  return (
    <article
      className="rounded-[18px] border px-2 py-3 text-center"
      style={{ borderColor: "rgba(255,92,0,0.45)" }}
    >
      <p className="font-display font-black italic text-[22px] leading-none" style={{ color: BLAZE }}>{value}</p>
      <p className="mt-1 text-[10px] italic text-white/75">{label}</p>
    </article>
  )
}

function PoseFamilyBlock({ family, onLocked, onStatus }) {
  return (
    <article>
      <div className="flex items-baseline justify-between gap-3 px-0.5">
        <div>
          <h3 className="font-display font-black italic tracking-tight text-[22px] text-white">
            {family.name}
          </h3>
          {family.spanish ? (
            <p className="mt-0.5 text-[12px] text-slate-500">{family.spanish}</p>
          ) : null}
        </div>
        <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{family.zone}</span>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {family.levels.map((level, index) => {
          const locked = !level.open
          return (
            <div key={level.id} className="w-[168px] shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (locked) onLocked(index)
                }}
                className="relative w-full overflow-hidden rounded-[22px] h-[196px] border text-left"
                style={{
                  borderColor: locked ? "rgba(255,255,255,0.12)" : "rgba(255,92,0,0.55)",
                  boxShadow: locked ? "none" : `0 0 16px ${BLAZE_GLOW}`,
                }}
              >
                {level.image ? (
                  <img
                    src={getPoseImage(level.image)}
                    alt={level.name}
                    className={`absolute inset-0 h-full w-full object-cover ${locked ? "brightness-[0.28] grayscale" : "brightness-[0.78]"}`}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#141414]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                {locked ? (
                  <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Lock className="w-7 h-7" strokeWidth={2.2} />
                    <span className="mt-2 text-[11px] font-semibold tracking-[0.16em] uppercase">
                      Nivel {index + 1}
                    </span>
                  </span>
                ) : (
                  <span
                    className="absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: BLAZE, color: "#080809" }}
                  >
                    {poseStatusMeta(level.status)?.short || `Nivel ${index + 1}`}
                  </span>
                )}
                <p className="absolute bottom-3 left-3 right-3 font-display font-black italic text-[16px] leading-tight text-white">
                  {level.name}
                </p>
              </button>
              {locked ? (
                <p className="mt-2 text-[11px] text-slate-500 text-center">Bloqueado</p>
              ) : (
                <div className="mt-2 grid grid-cols-1 gap-1">
                  {POSE_STATUSES.map((item) => {
                    const active = level.status === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onStatus(level.id, item.id)}
                        className="h-7 rounded-full text-[10px] font-semibold px-2"
                        style={
                          active
                            ? { backgroundColor: BLAZE, color: "#080809" }
                            : { backgroundColor: "transparent", color: "#cfcfcf", border: "1px solid rgba(255,255,255,0.18)" }
                        }
                      >
                        {item.short}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}
