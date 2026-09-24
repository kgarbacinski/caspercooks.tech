'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { FaEnvelope, FaLinkedin, FaGithub, FaUserTie, FaRocket, FaComments } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6' // ikona X zamiast starego ptaka
import { SectionHeader, EASE } from '@/components/ui/Section'
import { useTheme } from '@/contexts/ThemeContext'

/**
 * Kontakt = list i koperta. Formularz to kartka listowa (kremowy papier w linie),
 * typ zapytania wybiera się znaczkiem pocztowym. Po wysłaniu (POST /api/contact,
 * pola {name,email,message,type} — bez zmian) kartka składa się i wchodzi do koperty,
 * klapka się zamyka, woskowa pieczęć KG ją zamyka i koperta odlatuje. Teksty bez zmian.
 */

type ContactType = 'developer' | 'founder' | 'general'
const STAMPS: { type: ContactType; label: string; icon: typeof FaUserTie }[] = [
  { type: 'developer', label: 'Dev', icon: FaUserTie },
  { type: 'founder', label: 'CEO', icon: FaRocket },
  { type: 'general', label: 'General', icon: FaComments },
]

const field =
  'w-full bg-transparent border-0 border-b border-ink/25 focus:border-ink/70 focus:outline-none focus-visible:outline-none text-ink placeholder:text-ink/50 text-base py-2.5 transition-colors'
const label = 'block font-mono text-xs uppercase tracking-[0.2em] text-ink/75 mb-1'

const SEAL =
  'M50 3 C62 2 70 9 80 12 C91 16 97 27 96 39 C95 48 99 55 97 64 C94 77 85 84 76 90 C66 97 55 98 45 97 C33 96 24 91 16 83 C7 74 2 63 4 51 C5 42 1 34 5 26 C11 13 24 9 34 6 C40 4 45 3 50 3Z'

function WaxSeal({ className = '' }: { className?: string }) {
  // własne id gradientu: pieczęć jest i w przycisku, i na kopercie (bez duplikatów id w DOM)
  const gid = `wax-${useId().replace(/:/g, '')}`
  return (
    <div className={`relative ${className}`} style={{ containerType: 'size' }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_6px_8px_rgba(40,12,4,0.55)]" aria-hidden="true">
        <defs>
          <radialGradient id={gid} cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#c25a2e" />
            <stop offset="0.55" stopColor="#8a3316" />
            <stop offset="1" stopColor="#4f1a08" />
          </radialGradient>
        </defs>
        <path d={SEAL} fill={`url(#${gid})`} />
        <circle cx="50" cy="50" r="31" fill="none" stroke="#7a3014" strokeWidth="2.5" opacity="0.7" />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center font-display text-[#5e1f0a]"
        style={{ fontSize: '38cqw', lineHeight: 1, textShadow: '0 -1px 0 rgba(255,190,150,0.55), 0 1.5px 1px rgba(40,10,0,0.7)' }}
        aria-hidden="true"
      >
        KG
      </span>
    </div>
  )
}

export default function ContactSection() {
  const reduce = useReducedMotion()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({ name: '', email: '', message: '', type: 'general' as ContactType })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [scope, animate] = useAnimate()
  const [mailing, setMailing] = useState(false) // trwa animacja koperty

  // list → koperta → pieczęć → odlot
  const mailAway = async () => {
    if (reduce) return
    setMailing(true)
    await animate('.letter', { scaleY: 0.34, y: 140, opacity: 0.9 }, { duration: 0.55, ease: [0.6, 0, 0.3, 1] })
    await animate('.envelope', { opacity: 1, y: 0 }, { duration: 0.01 })
    await animate('.letter', { opacity: 0 }, { duration: 0.15 })
    await animate('.env-flap', { rotateX: 0 }, { duration: 0.4, ease: 'easeInOut' })
    await animate('.env-seal', { scale: [2.4, 0.9, 1], opacity: [0, 1, 1], rotate: [-25, 4, 0] }, { duration: 0.4, ease: 'easeOut' })
    await animate('.envelope', { x: ['0%', '-3%'], rotate: -3 }, { duration: 0.18 })
    await animate('.envelope', { x: '140%', y: -260, rotate: 18, opacity: 0 }, { duration: 0.75, ease: [0.5, 0, 0.9, 0.5] })
  }

  const resetStage = async () => {
    if (!reduce) {
      await animate('.envelope', { x: '0%', y: 40, rotate: 0, opacity: 0 }, { duration: 0 })
      await animate('.env-flap', { rotateX: 180 }, { duration: 0 })
      await animate('.env-seal', { opacity: 0 }, { duration: 0 })
      await animate('.letter', { scaleY: 1, y: 0, opacity: 1 }, { duration: 0.5, ease: EASE })
    }
    setMailing(false)
  }

  const busy = isSubmitting || submitted || mailing
  // edycja formularza chowa ewentualny błąd (zamiast znikania po 5 s, zanim ktoś go przeczyta)
  const update = (patch: Partial<typeof formData>) => {
    setFormData((f) => ({ ...f, ...patch }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return // przycisk ma aria-disabled (nie disabled), żeby nie gubić fokusu klawiatury
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      setIsSubmitting(false)
      setSubmitted(true)
      await mailAway()
      // formularz wraca po 3 s (jak wcześniej), już jako świeża kartka
      setTimeout(async () => {
        setSubmitted(false)
        setFormData({ name: '', email: '', message: '', type: 'general' })
        await resetStage()
      }, 3000)
    } catch (err) {
      setIsSubmitting(false)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  const btnState = isSubmitting ? 'sending' : submitted ? 'sent' : error ? 'error' : 'idle'
  const btnLabel = { idle: 'Send Message', sending: 'Sending...', sent: 'Message Sent!', error: 'Try again' }[btnState]

  const contactMethods = [
    { icon: FaEnvelope, label: 'Email', value: 'kacpergarbacinski@gmail.com', link: 'mailto:kacpergarbacinski@gmail.com' },
    { icon: FaLinkedin, label: 'LinkedIn', value: 'Connect with me', link: 'https://www.linkedin.com/in/kacper-garbacinski-3271b81a2/' },
    { icon: FaGithub, label: 'GitHub', value: 'Check my code', link: 'https://github.com/kgarbacinski' },
    { icon: FaXTwitter, label: 'Twitter', value: 'Follow me', link: 'https://x.com/KGarbacinski' },
  ]

  return (
    <section id="contact" className="relative py-16 sm:py-24 scroll-mt-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <SectionHeader
          index={theme === 'developer' ? '06' : '05'}
          eyebrow="caspercooks.tech"
          title="Looking for a developer? Interested in ventures?"
          lead="Or just want to say hi? Let's connect."
          className="mb-14 sm:mb-16"
        />

        {/* tablet (jedna kolumna): list i karty nie rozciągają się na całe 1000 px */}
        <div className="grid grid-cols-1 tab:max-w-2xl tab:mx-auto lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-start">
          {/* ——— list ——— */}
          <div ref={scope} className="relative" style={{ perspective: 1200 }}>
            {/* koperta (pojawia się po wysłaniu) */}
            <div className="envelope absolute inset-x-0 top-24 mx-auto w-[92%] aspect-[1.6] opacity-0 pointer-events-none" style={{ transform: 'translateY(40px)' }} aria-hidden="true">
              <div className="absolute inset-0 env-back" />
              <div className="absolute inset-0 env-front" />
              <div className="env-flap absolute inset-x-0 top-0 h-[58%] origin-top" style={{ transform: 'rotateX(180deg)', transformStyle: 'preserve-3d' }} />
              <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 w-16 h-16">
                <div className="env-seal w-full h-full opacity-0">
                  <WaxSeal className="w-full h-full" />
                </div>
              </div>
            </div>

            <motion.div
              className="letter relative"
              style={{ transformOrigin: '50% 0%' }}
              initial={reduce ? false : { opacity: 0, y: 40, rotateX: -20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <form onSubmit={handleSubmit} className="letter-paper p-5 [@media(min-width:400px)_and_(max-width:639px)]:p-6 sm:p-10" aria-describedby={error ? 'contact-error' : undefined}>
                {/* wąski telefon: adresat nad znaczkami (w jednym wierszu znaczki wypychały kartkę poza ekran) */}
                <div className="flex flex-col [@media(min-width:420px)]:flex-row items-start justify-between gap-4 [@media(min-width:420px)]:gap-6 mb-8">
                  <div className="font-mono text-xs leading-relaxed text-ink/60">
                    <div className="uppercase tracking-[0.2em] text-ink/45">to</div>
                    <div className="text-ink/80">Kacper Garbacinski</div>
                    <div>caspercooks.tech</div>
                  </div>
                  {/* znaczki = typ zapytania */}
                  <fieldset className="min-w-0">
                    <legend className={`${label} [@media(min-width:420px)]:text-right mb-2`}>I&apos;m interested in...</legend>
                    <div className="flex gap-2 sm:gap-3">
                      {STAMPS.map((s, i) => {
                        const active = formData.type === s.type
                        return (
                          <button
                            key={s.type}
                            type="button"
                            aria-pressed={active}
                            onClick={() => update({ type: s.type })}
                            className={`postage ${active ? 'postage-active' : ''}`}
                            style={{ rotate: `${[-4, 2, -1][i]}deg` }}
                          >
                            <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-mono text-xs uppercase tracking-normal">{s.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                </div>

                <p className="font-display italic text-2xl text-ink mb-6">Dear Kacper,</p>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="message" className={label}>
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => update({ message: e.target.value })}
                      className={`${field} resize-none lined`}
                      placeholder="Tell me about your project or inquiry..."
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className={label}>
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => update({ name: e.target.value })}
                        className={field}
                        placeholder="John Doe"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={label}>
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => update({ email: e.target.value })}
                        className={field}
                        placeholder="john@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      id="contact-error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="alert"
                      className="mt-6 px-4 py-3 border border-[#c42b1c]/60 bg-[#c42b1c]/[0.08] text-[#9e2215] text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <span className="font-display italic text-ink/60 text-lg">— yours,</span>
                  {/* pieczęć-przycisk: stan w data-state steruje wyglądem (globals.css → .seal-btn) */}
                  <button
                    type="submit"
                    aria-disabled={busy || undefined}
                    data-state={btnState}
                    aria-busy={isSubmitting || undefined}
                    className="seal-btn max-sm:flex-1 sm:min-w-[14.5rem]"
                  >
                    <span className="seal-btn__seal" aria-hidden="true">
                      <WaxSeal className="w-full h-full" />
                    </span>
                    <span>{btnLabel}</span>
                    <span className="seal-btn__arrow" aria-hidden="true">
                      {btnState === 'sent' ? '✓' : btnState === 'error' ? '↻' : '→'}
                    </span>
                  </button>
                </div>
                {/* stan wysyłki dla czytników ekranu (błąd ogłasza role="alert" wyżej) */}
                <p className="sr-only" role="status">
                  {isSubmitting ? 'Sending message…' : submitted ? 'Message sent.' : ''}
                </p>
              </form>
            </motion.div>

            {/* potwierdzenie po odlocie koperty */}
            <AnimatePresence>
              {submitted && mailing && (
                <motion.div
                  className="absolute inset-0 grid place-items-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 2.3 } }}
                  exit={{ opacity: 0 }}
                  role="status"
                >
                  <motion.div
                    className="text-center"
                    initial={{ scale: 1.6, rotate: -8, opacity: 0 }}
                    animate={{ scale: 1, rotate: -3, opacity: 1, transition: { delay: 2.3, type: 'spring', stiffness: 380, damping: 16 } }}
                  >
                    {/* pieczątka pocztowa na pocztówce (papierowe tło = kontrast) */}
                    <div className="letter-paper px-6 py-8 sm:px-16 sm:py-10 rotate-[2deg]">
                    <div className="relative inline-grid place-items-center w-60 h-60 sm:w-72 sm:h-72 rounded-full border-[5px] border-double border-[#b8461a]/85 text-[#b8461a]" style={{ filter: 'url(#ink)' }}>
                      <div className="absolute inset-4 rounded-full border border-dashed border-[#c2541f]/60" />
                      <div className="text-center px-6">
                        <div className="font-mono text-xs uppercase tracking-[0.14em] mb-2">caspercooks.tech · post</div>
                        <div className="font-display text-[24px] sm:text-[28px] leading-tight whitespace-nowrap">✓ Message Sent!</div>
                        <div className="font-mono text-xs uppercase tracking-[0.1em] mt-2 opacity-80">the envelope is on its way</div>
                      </div>
                    </div>
                    </div>
                    <svg width="0" height="0" className="absolute" aria-hidden="true">
                      <filter id="ink">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
                        <feDisplacementMap in="SourceGraphic" scale="3" />
                      </filter>
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ——— adresy i notka ——— */}
          <div className="space-y-8">
            <motion.div
              className="index-card px-5 [@media(min-width:400px)_and_(max-width:639px)]:px-6 pb-4 pt-5 sm:px-8"
              style={{ rotate: '-0.8deg' }}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            >
              <h3 className="font-display text-2xl text-ink h-[38px] mb-5">Get In Touch</h3>
              <div>
                {contactMethods.map((method) => (
                  <a key={method.label} href={method.link} className="group flex items-center gap-3 [@media(min-width:380px)]:gap-4 h-[54px]">
                    <span className="postmark">
                      <method.icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-xs uppercase tracking-[0.14em] text-ink/50">{method.label}</span>
                      <span className="block text-[clamp(0.8125rem,4.2vw,0.9375rem)] text-ink truncate group-hover:text-[#b8461a] transition-colors">{method.value}</span>
                    </span>
                    <span className="hidden [@media(min-width:380px)]:inline ml-auto text-ink/55 group-hover:text-[#b8461a] group-hover:translate-x-1 transition" aria-hidden="true">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="note-paper !p-5 [@media(min-width:400px)_and_(max-width:639px)]:!p-6 sm:!p-8"
              style={{ rotate: '1.2deg' }}
              initial={reduce ? false : { opacity: 0, y: 24, rotate: 6 }}
              whileInView={{ opacity: 1, y: 0, rotate: 1.2 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            >
              <span className="pin" aria-hidden="true" />
              <h3 className="font-display text-2xl text-ink mb-3">Looking for a Developer?</h3>
              <p className="text-ink/75 mb-5 text-[15px] leading-relaxed">
                I&apos;m currently open to new opportunities and projects. Whether it&apos;s Web2, Web3, or something entirely new, let&apos;s discuss how I can
                help bring your vision to life.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Full-Stack', 'Web3', 'Tech Lead', 'Architecture'].map((tag) => (
                  <span key={tag} className="font-mono text-xs px-2 py-1 border border-ink/25 text-ink/70">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
