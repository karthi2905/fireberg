/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--bg-canvas)',
          subtle: 'var(--bg-canvas-subtle)',
          panel: 'var(--bg-panel)',
          'panel-raised': 'var(--bg-panel-raised)',
        },
        accent: {
          DEFAULT: '#F5760A',
          hover: '#E06800',
          active: '#CC5E00',
          subtle: 'rgba(245, 118, 10, 0.15)',
        },
        severity: {
          low: 'var(--severity-low)',
          medium: 'var(--severity-medium)',
          high: 'var(--severity-high)',
          critical: 'var(--severity-critical)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
        'glass-lg': 'var(--shadow-glass-lg)',
        'glass-sm': 'var(--shadow-glass-sm)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
