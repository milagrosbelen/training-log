import { useEffect, useState } from "react"
import { subscribeLoading } from "../utils/loadingGate"
import LoadingScreen from "./LoadingScreen"

export default function LoadingOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => subscribeLoading(setVisible), [])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  if (!visible) return null
  return <LoadingScreen />
}
