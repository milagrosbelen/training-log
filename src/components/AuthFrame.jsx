import BrandLogo from "./BrandLogo"

export default function AuthFrame({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <BrandLogo size="lg" className="mx-auto" />
        {title && (
          <h1 className="mt-6 font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-3 text-base text-slate-400 leading-relaxed">{subtitle}</p>
        )}
        <div className="mt-10 text-left">{children}</div>
        {footer && <div className="mt-10">{footer}</div>}
      </div>
    </div>
  )
}

export const fieldClass =
  "w-full h-14 px-5 rounded-2xl bg-ink border border-white/15 text-[#f4f4f5] text-lg placeholder:text-slate-400 caret-ember scheme-dark focus:outline-none focus:border-ember focus:ring-2 focus:ring-ember/40"

export const emberBtnStyle = { backgroundColor: "#FF4F2A" }

export const btnBase =
  "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:opacity-60"

export const btnCreate = `${btnBase} btn-create`
export const btnDanger = `${btnBase} btn-danger`
export const btnPin = `${btnBase} btn-pin`
export const btnGhost = `${btnBase} btn-ghost`

export const emberBtnClass = `${btnBase} btn-ember bg-ember text-white shadow-ember-sm`

export const primaryBtnClass =
  `${emberBtnClass} w-full h-14 text-[17px] shadow-ember`
