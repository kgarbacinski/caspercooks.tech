'use client'

import { useEffect } from 'react'

/**
 * Ostatnia linia obrony: nieobsłużony wyjątek w stronie pokazuje papierową kartkę z przyciskiem
 * „spróbuj ponownie” zamiast gołego „Application error: a client-side exception has occurred”.
 * (Efekty — diorama, WebGL, animacje pokoi — mają własne granice i do tego miejsca nie dochodzą.)
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <main className="min-h-[100svh] grid place-items-center px-6 bg-night text-paper">
      <div className="paper-card max-w-md w-full p-8 text-center">
        <p className="eyebrow mb-3">$ something tore</p>
        <h1 className="font-display text-3xl mb-4">A paper fold went wrong.</h1>
        <p className="text-paper-muted mb-6">The page hit an unexpected error. Try again — it usually folds back fine.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn-accent">
            Try again
          </button>
          <button type="button" onClick={() => location.reload()} className="btn-ghost">
            Reload
          </button>
        </div>
      </div>
    </main>
  )
}
