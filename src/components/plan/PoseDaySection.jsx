import { useEffect, useMemo, useState } from "react"
import { getPoseProgress, updatePoseProgress } from "../../services/poseService"
import { getPoseImage, poseStatusMeta } from "../../data/poseProgressions"
import {
  customPoseId,
  matchCatalogPoseByName,
  pickDailyPosePractice,
  todayISODate,
  upsertPoseEntry,
} from "../../utils/poseLadder"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.4)"

export default function PoseDaySection({ mode = "practice" }) {
  const [saved, setSaved] = useState({})
  const [newName, setNewName] = useState("")
  const [message, setMessage] = useState("")

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
    } catch {
      setSaved(saved)
    }
  }

  const practice = useMemo(() => pickDailyPosePractice(saved), [saved])

  const mark = async (card, status, extra = {}) => {
    const next = upsertPoseEntry(saved, card.id, {
      status: status || card.status || "aprendiendo",
      name: card.title || card.name,
      spanish: card.spanish || "",
      source: extra.source || card.source || (mode === "class" ? "clase" : "practica"),
      last_practiced: extra.practiced === false ? saved[card.id]?.last_practiced || "" : todayISODate(),
    })
    await persist(next)
    setMessage(extra.note || "")
  }

  const addFromClass = async (status) => {
    const name = newName.trim()
    if (!name) {
      setMessage("Escribí la pose que dio la profe.")
      return
    }
    const catalog = matchCatalogPoseByName(name)
    const id = catalog?.id || customPoseId(name)
    await persist(upsertPoseEntry(saved, id, {
      status,
      name: catalog?.title || name,
      spanish: catalog?.spanish || "",
      source: "clase",
      last_practiced: todayISODate(),
    }))
    setNewName("")
    setMessage(`${catalog?.title || name} quedó como ${poseStatusMeta(status)?.label}.`)
  }

  if (mode === "class") {
    return (
      <section className="mt-8">
        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
          Clase de yoga
        </p>
        <h2 className="mt-2 font-display font-black italic tracking-tight text-[28px] leading-tight text-white">
          ¿Qué dio la profe hoy?
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Anotá las nuevas. Las que ya te salen se practican los otros días.
        </p>
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nombre de la pose"
          className="mt-4 w-full h-12 rounded-2xl bg-black border px-4 text-sm text-white outline-none"
          style={{ borderColor: "rgba(255,92,0,0.45)" }}
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => addFromClass("vi")}
            className="h-11 rounded-full text-[13px] font-semibold text-white border border-white/20"
          >
            La vi en clase
          </button>
          <button
            type="button"
            onClick={() => addFromClass("aprendiendo")}
            className="h-11 rounded-full text-[13px] font-semibold"
            style={{ backgroundColor: BLAZE, color: "#080809" }}
          >
            La estoy aprendiendo
          </button>
        </div>
        {message ? <p className="mt-3 text-[12px] italic" style={{ color: BLAZE }}>{message}</p> : null}
      </section>
    )
  }

  return (
    <section className="mt-8">
      <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
        Práctica de poses
      </p>
      <h2 className="mt-2 font-display font-black italic tracking-tight text-[28px] leading-tight text-white">
        Mantener + 1 reto
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Las que ya te salen y hace rato no tocás, y una que está más cerca de salirte.
      </p>

      {practice.challenge ? (
        <PosePracticeCard
          card={practice.challenge}
          role="Reto"
          onDidIt={() => mark(practice.challenge, practice.challenge.status || "aprendiendo", { note: "Reto hecho hoy." })}
        />
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Anotá una pose nueva el martes o jueves para tener un reto.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {practice.maintain.length ? practice.maintain.map((card) => (
          <PosePracticeCard
            key={card.id}
            card={card}
            role="Mantener"
            onDidIt={() => mark(card, card.status, { source: "practica", note: `${card.title} hecha hoy.` })}
          />
        )) : (
          <p className="text-sm text-slate-500">
            Cuando una pose te salga, entra acá para no olvidarla.
          </p>
        )}
      </div>
      {message ? <p className="mt-3 text-[12px] italic" style={{ color: BLAZE }}>{message}</p> : null}
    </section>
  )
}

function PosePracticeCard({ card, role, onDidIt }) {
  const meta = poseStatusMeta(card.status)
  return (
    <article
      className="overflow-hidden rounded-[24px] border"
      style={{ borderColor: role === "Reto" ? "rgba(255,92,0,0.7)" : "rgba(255,255,255,0.12)" }}
    >
      <div className="relative h-[132px]">
        {card.image ? (
          <img src={getPoseImage(card.image)} alt="" className="absolute inset-0 h-full w-full object-cover brightness-[0.7]" />
        ) : (
          <div className="absolute inset-0 bg-[#141414]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
        <span
          className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: BLAZE, color: "#080809", boxShadow: `0 0 12px ${BLAZE_GLOW}` }}
        >
          {role}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-display font-black italic text-[22px] leading-tight text-white">{card.title}</p>
          <p className="mt-1 text-[12px] text-white/80">
            {meta?.label || "Todavía sin marcar"}
            {card.lastPracticed ? ` · última ${formatPracticed(card.lastPracticed)}` : ""}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDidIt}
        className="w-full h-11 text-[13px] font-semibold"
        style={{ color: BLAZE }}
      >
        Hoy la hice
      </button>
    </article>
  )
}

function formatPracticed(dateStr) {
  const [year, month, day] = String(dateStr).split("-")
  if (!year || !month || !day) return dateStr
  return `${day}/${month}`
}
