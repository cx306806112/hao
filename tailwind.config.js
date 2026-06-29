/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          elev: 'var(--bg-elev)',
          glass: 'var(--bg-glass)',
        },
        neon: {
          cyan: 'var(--neon-cyan)',
          magenta: 'var(--neon-magenta)',
          purple: 'var(--neon-purple)',
          yellow: 'var(--neon-yellow)',
          green: 'var(--neon-green)',
        },
        ink: {
          DEFAULT: 'var(--text-primary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        heading: ['Rajdhani', 'system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 12px var(--neon-cyan), 0 0 24px rgba(0,240,255,0.4)',
        'neon-magenta': '0 0 12px var(--neon-magenta), 0 0 24px rgba(255,42,109,0.4)',
        'neon-soft': '0 0 20px rgba(0,240,255,0.15), inset 0 0 12px rgba(0,240,255,0.05)',
      },
      backgroundImage: {
        'grid-perspective':
          'linear-gradient(rgba(0,240,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.12) 1px, transparent 1px)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '45%': { opacity: '1' },
          '46%': { opacity: '0.6' },
          '47%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.4' },
          '94%': { opacity: '1' },
        },
        'scan-move': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(-2%, -2%, 0)' },
        },
        'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px var(--neon-cyan))' },
          '50%': { filter: 'drop-shadow(0 0 12px var(--neon-cyan))' },
        },
      },
      animation: {
        flicker: 'flicker 4s linear infinite',
        'scan-move': 'scan-move 8s linear infinite',
        drift: 'drift 20s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
