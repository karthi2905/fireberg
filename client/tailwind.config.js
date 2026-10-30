/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0C0A09',
          subtle: '#130F0C',
          deep: '#070605',
        },
        accent: {
          DEFAULT: '#F5760A',
          hover: '#E06800',
          active: '#CC5E00',
          subtle: 'rgba(245, 118, 10, 0.15)',
        },
        severity: {
          low: '#22C55E',
          medium: '#F59E0B',
          high: '#FB923C',
          critical: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.55), 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.35)',
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
