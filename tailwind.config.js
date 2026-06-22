/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E6',
        'cream-soft': '#FBF8F1',
        ink: '#1C1A17',
        wine: '#7A2E3A',
        'wine-deep': '#5E2129',
        gold: '#C8A24B',
        'gold-soft': '#E3CE93',
        sky: '#6FA8C7',
        sand: '#E8DFC9',
        moss: '#5B6B4E',
      },
      fontFamily: {
        display: ['"Shippori Mincho"', 'Georgia', 'serif'],
        body: ['"Zen Kaku Gothic New"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -8px rgba(28, 26, 23, 0.18)',
        lift: '0 12px 40px -12px rgba(28, 26, 23, 0.28)',
      },
    },
  },
  plugins: [],
}
