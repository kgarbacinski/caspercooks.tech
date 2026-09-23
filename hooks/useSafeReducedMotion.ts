'use client'

import { useEffect, useState } from 'react'

/**
 * prefers-reduced-motion bez rozjazdu hydracji: pierwszy render (serwer i klient) zakłada
 * "false", prawdziwa wartość przychodzi po zamontowaniu. (useReducedMotion z framer-motion
 * czyta media query już w pierwszym renderze na kliencie → hydration mismatch.)
 */
export function useReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduce
}
