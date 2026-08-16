import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"

const SCROLL_THRESHOLD = 300

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial position
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Subir al inicio"
      className={`fixed z-40 flex items-center justify-center w-10 h-10 rounded-full bg-ember/90 hover:bg-ember text-white shadow-ember hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-ink right-4 bottom-20 md:bottom-8 ${
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
    </button>
  )
}
