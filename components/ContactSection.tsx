'use client'

import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useRef, useState, useEffect } from 'react'
import { FaEnvelope, FaLinkedin, FaGithub, FaTwitter, FaUserTie, FaRocket, FaComments } from 'react-icons/fa'
import type { IconType } from 'react-icons'

export default function ContactSection() {
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    type: 'general' as 'developer' | 'founder' | 'general',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    <section id="contact" className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={isMobile ? {} : { duration: 0.5 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-mono">
            <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
              {'$ ping '}
            </span>
            caspercooks.tech
          </h2>
          <p className={`max-w-2xl mx-auto font-mono text-sm sm:text-base px-4 ${theme === 'founder' ? 'text-gray-300' : 'text-gray-400'}`}>
            {'// Looking for a developer? Interested in ventures?'}
            <br />
            {'// Or just want to say hi? Let\'s connect.'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={isMobile ? {} : { duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Contact Type Selector */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                  I'm interested in...
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(['developer', 'founder', 'general'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`
                        px-2 py-2 sm:px-4 sm:py-3 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm
                        ${formData.type === type
                          ? theme === 'developer'
                            ? 'bg-developer-accent text-developer-bg'
                            : 'bg-founder-accent text-white'
                          : theme === 'founder'
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-developer-secondary text-gray-400 hover:bg-gray-700'}
                      `}
                    >
                      <span className="flex items-center justify-center gap-1">
                        {type === 'developer' ? <><FaUserTie /> Dev</> : type === 'founder' ? <><FaRocket /> CEO</> : <><FaComments /> General</>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`
                    w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base
                    focus:outline-none focus:ring-2
                    ${theme === 'founder'
                      ? 'bg-gray-800 border-2 border-gray-600 focus:border-founder-accent focus:ring-founder-accent/20 text-white'
                      : 'bg-developer-secondary border-2 border-gray-700 focus:border-developer-accent focus:ring-developer-accent/20 text-white'}
                  `}
                  placeholder="John Doe"
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`
                    w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base
                    focus:outline-none focus:ring-2
                    ${theme === 'founder'
                      ? 'bg-gray-800 border-2 border-gray-600 focus:border-founder-accent focus:ring-founder-accent/20 text-white'
                      : 'bg-developer-secondary border-2 border-gray-700 focus:border-developer-accent focus:ring-developer-accent/20 text-white'}
                  `}
                  placeholder="john@example.com"
                />
              </div>

              {/* Message Input */}
              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`
                    w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-all duration-300 resize-none text-sm sm:text-base
                    focus:outline-none focus:ring-2
                    ${theme === 'founder'
                      ? 'bg-gray-800 border-2 border-gray-600 focus:border-founder-accent focus:ring-founder-accent/20 text-white'
                      : 'bg-developer-secondary border-2 border-gray-700 focus:border-developer-accent focus:ring-developer-accent/20 text-white'}
                  `}
                  placeholder="Tell me about your project or inquiry..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500 text-red-500"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || submitted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-sm sm:text-base transition-all duration-300
                  ${theme === 'developer'
                    ? 'bg-developer-accent text-developer-bg hover:bg-developer-accent/90'
                    : 'bg-founder-accent text-white hover:bg-founder-accent/90'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : submitted ? (
                  <span className="flex items-center justify-center gap-2">
                    ✓ Message Sent!
                  </span>
                ) : (
                  'Send Message'
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={isMobile ? {} : { duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className={`
              p-6 sm:p-8 rounded-2xl
              ${theme === 'founder'
                ? 'bg-gray-900/40 border-2 border-founder-accent'
                : 'bg-developer-secondary border-2 border-developer-accent/20'}
            `}>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Get In Touch</h3>

              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <motion.a
                    key={method.label}
                    href={method.link}
                    initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={isMobile ? {} : { delay: 0.5 + index * 0.1 }}
                    whileHover={isMobile ? {} : { x: 5 }}
                    className={`
                      flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all duration-300
                      ${theme === 'founder'
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-700/50'}
                    `}
                  >
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0
                      ${theme === 'developer' ? 'bg-developer-accent/20' : 'bg-founder-accent/20'}
                    `}>
                      <method.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-gray-500">{method.label}</div>
                      <div className="font-medium text-sm sm:text-base truncate">{method.value}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className={`
              p-6 sm:p-8 rounded-2xl
              ${theme === 'founder'
                ? 'bg-gradient-to-br from-founder-accent to-orange-500 text-white'
                : 'bg-gradient-to-br from-developer-accent to-cyan-500 text-developer-bg'}
            `}>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Looking for a Developer?</h3>
              <p className="mb-3 sm:mb-4 opacity-90 text-sm sm:text-base">
                I'm currently open to new opportunities and projects. Whether it's Web2, Web3,
                or something entirely new, let's discuss how I can help bring your vision to life.
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-black/20 rounded-full text-xs sm:text-sm">Full-Stack</span>
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-black/20 rounded-full text-xs sm:text-sm">Web3</span>
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-black/20 rounded-full text-xs sm:text-sm">Tech Lead</span>
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-black/20 rounded-full text-xs sm:text-sm">Architecture</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
