'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaEnvelope, FaLinkedin, FaGithub, FaTwitter, FaUserTie, FaRocket, FaComments } from 'react-icons/fa'
import { Section } from '@/components/ui/Section'

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
}

const inputClass =
  'w-full px-4 py-3 bg-cocoa-900 border border-cocoa-500/60 focus:border-accent focus:outline-none text-paper placeholder:text-paper-dim text-sm sm:text-base transition-colors'
const labelClass = 'eyebrow block mb-2'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    type: 'general' as 'developer' | 'founder' | 'general',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setIsSubmitting(false)
      setSubmitted(true)

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', message: '', type: 'general' })
      }, 3000)
    } catch (err) {
      setIsSubmitting(false)
      setError(err instanceof Error ? err.message : 'Failed to send message')

      // Clear error after 5 seconds
      setTimeout(() => {
        setError('')
      }, 5000)
    }
  }

  const contactMethods = [
    {
      icon: FaEnvelope,
      label: 'Email',
      value: 'kacpergarbacinski@gmail.com',
      link: 'mailto:kacpergarbacinski@gmail.com',
    },
    {
      icon: FaLinkedin,
      label: 'LinkedIn',
      value: 'Connect with me',
      link: 'https://www.linkedin.com/in/kacper-garbacinski-3271b81a2/',
    },
    {
      icon: FaGithub,
      label: 'GitHub',
      value: 'Check my code',
      link: 'https://github.com/kgarbacinski',
    },
    {
      icon: FaTwitter,
      label: 'Twitter',
      value: 'Follow me',
      link: 'https://x.com/KGarbacinski',
    },
  ]

  return (
    <Section
      id="contact"
      index="06"
      eyebrow="caspercooks.tech"
      title="Looking for a developer? Interested in ventures?"
      lead="Or just want to say hi? Let's connect."
    >
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
        {/* Contact Form */}
        <motion.div {...reveal} transition={{ duration: 0.6, ease: 'easeOut' }} className="paper-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Contact Type Selector */}
            <div>
              <span className={labelClass}>I'm interested in...</span>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(['developer', 'founder', 'general'] as const).map((type) => {
                  const active = formData.type === type
                  return (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFormData({ ...formData, type })}
                      className={`
                        px-2 py-2.5 sm:px-4 sm:py-3 font-mono text-xs sm:text-sm border transition-colors
                        ${active
                          ? 'border-accent text-accent bg-accent/10'
                          : 'border-cocoa-500/60 bg-cocoa-900 text-paper-muted hover:border-accent/50 hover:text-paper'}
                      `}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        {type === 'developer' ? <><FaUserTie /> Dev</> : type === 'founder' ? <><FaRocket /> CEO</> : <><FaComments /> General</>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className={labelClass}>
                Your Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="John Doe"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Your Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="john@example.com"
              />
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className={labelClass}>
                Your Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`${inputClass} resize-none`}
                placeholder="Tell me about your project or inquiry..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="p-4 border border-terracotta/60 bg-terracotta/10 text-terracotta"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || submitted}
              className="btn-accent w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : submitted ? (
                <span className="flex items-center justify-center gap-2">✓ Message Sent!</span>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <div className="space-y-6 sm:space-y-8">
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="paper-card p-6 sm:p-8"
          >
            <h3 className="font-display text-2xl text-paper mb-4 sm:mb-6">Get In Touch</h3>

            <div className="divide-y divide-cocoa-500/40">
              {contactMethods.map((method) => (
                <a
                  key={method.label}
                  href={method.link}
                  className="group flex items-center gap-4 py-3 sm:py-4 transition-colors"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 border border-cocoa-500/60 bg-cocoa-900 flex items-center justify-center flex-shrink-0 text-paper-muted group-hover:text-accent group-hover:border-accent/50 transition-colors">
                    <method.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-paper-dim">{method.label}</div>
                    <div className="text-sm sm:text-base text-paper truncate group-hover:text-accent transition-colors">
                      {method.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Info */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="paper-card p-6 sm:p-8"
          >
            <h3 className="font-display text-2xl text-paper mb-3 sm:mb-4">Looking for a Developer?</h3>
            <p className="text-paper-muted mb-5 text-sm sm:text-base leading-relaxed">
              I'm currently open to new opportunities and projects. Whether it's Web2, Web3,
              or something entirely new, let's discuss how I can help bring your vision to life.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Full-Stack', 'Web3', 'Tech Lead', 'Architecture'].map((tag) => (
                <span key={tag} className="font-mono text-[11px] px-2 py-1 border border-cocoa-500/60 text-paper-muted">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
