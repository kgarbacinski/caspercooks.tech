'use client'

import { motion } from 'framer-motion'

interface SteamAnimationProps {
  theme: 'developer' | 'founder'
}

export default function SteamAnimation({ theme }: SteamAnimationProps) {
  // Generate multiple steam particles for smoother effect
  const steamParticles = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-full h-10 overflow-visible pointer-events-none">
      {steamParticles.map((i) => (
        <motion.div
          key={i}
          className={`absolute bottom-0 left-1/2 w-3 h-3 rounded-full blur-md
            ${theme === 'developer'
              ? 'bg-developer-accent'
              : 'bg-founder-accent'}
          `}
          style={{
            left: `${42 + i * 2}%`,
          }}
          animate={{
            y: [0, -35, -40],
            x: [
              0,
              (i % 2 === 0 ? 1 : -1) * (3 + i * 1.5),
              (i % 2 === 0 ? 1 : -1) * (6 + i * 2)
            ],
            opacity: [0, 0.7, 0.4, 0],
            scale: [0.3, 0.8, 1.2, 1.8],
          }}
          transition={{
            duration: 3.5 + i * 0.2,
            repeat: Infinity,
            delay: i * 0.25,
            ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for natural flow
            times: [0, 0.3, 0.7, 1], // Control keyframe timing
          }}
        />
      ))}
    </div>
  )
}
