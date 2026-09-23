import type { Config } from 'tailwindcss'

/**
 * Motyw "papercraft diorama" — paleta wzięta z hero (public/diorama/island.webp).
 * Jeden wygląd dla obu trybów; przełącznik developer/founder zmienia tylko akcent
 * przez zmienną CSS `--accent` (globals.css), więc klasy `accent` działają w obu.
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        night: '#0b0806', // tło strony (pustka wokół wyspy)
        cocoa: {
          900: '#140d09', // najciemniejsza powierzchnia
          800: '#1d140e', // karta
          700: '#2c1911', // karta podniesiona / skała
          600: '#3d2819', // hover
          500: '#5a3e28', // linie, obramowania
        },
        paper: {
          DEFAULT: '#f1e4cf', // tekst główny (krem)
          muted: '#a88a6c', // tekst drugorzędny (kraft)
          dim: '#7a634d', // metadane
        },
        kraft: '#c9a882',
        ink: '#2a1a10', // atrament na kremowym papierze (notatki, list)
        cream: '#efe2c7', // jasny papier
        terracotta: '#b8663f',
        ember: '#e8843a', // pomarańczowa poświata krawędzi
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        // aliasy dla starego kodu — wskazują na nowy motyw
        developer: { bg: '#0b0806', text: '#f1e4cf', accent: '#00ff88', secondary: '#1d140e' },
        founder: { bg: '#0b0806', text: '#f1e4cf', accent: '#ff6b35', secondary: '#1d140e' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-display)', 'Georgia', 'serif'], // tekst też szeryfem (bez Inter)
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        paper: '0 1px 0 rgba(232,132,58,0.35) inset, 0 20px 50px -20px rgba(0,0,0,0.7)',
        glow: '0 0 24px rgb(var(--accent-rgb) / 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        float: 'float 7s ease-in-out infinite',
        'cable-flow': 'cableFlow 6s linear infinite',
        'lights-on': 'lights-on 0.7s linear both',
        'cable-pulse': 'cable-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        cableFlow: { to: { strokeDashoffset: '-200' } },
      },
    },
  },
  plugins: [],
}

export default config
