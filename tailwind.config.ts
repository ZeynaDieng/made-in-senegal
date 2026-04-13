import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './data/**/*.{js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        gold: '#C5A059',
        cream: '#F9F9F7',
        night: '#050505',
        paper: '#FFFFFF',
        muted: '#666666',
        'gold-soft': '#E6D2A8',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        subtle: 'rgb(var(--subtle-rgb) / <alpha-value>)',
      },
      borderRadius: {
        wax: '0px',
        pill: '0px',
      },
      boxShadow: {
        lift: '0 24px 80px rgba(10, 10, 10, 0.12)',
        liftDark: '0 24px 80px rgba(0, 0, 0, 0.55)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
      },
      letterSpacing: {
        luxe: '0.35em',
        wide: '0.28em',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.87, 0, 0.13, 1)',
        soft: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(48px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal-right': {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slow-pan': {
          from: { transform: 'scale(1.06) translateX(-2%)' },
          to: { transform: 'scale(1.06) translateX(2%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'trust-marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'reveal-up': 'reveal-up 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal-right': 'reveal-right 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 1s ease-out forwards',
        'slide-up': 'slide-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slow-pan': 'slow-pan 22s linear infinite alternate',
        shimmer: 'shimmer 2.4s linear infinite',
        'trust-marquee': 'trust-marquee 42s linear infinite',
      },
      backgroundImage: {
        'lux-gradient':
          'linear-gradient(120deg, rgba(197,160,89,0.15), rgba(197,160,89,0.02), rgba(197,160,89,0.18))',
      },
    },
  },
  plugins: [],
} satisfies Config
