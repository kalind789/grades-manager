/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // kept for any legacy references
        primary: '#020617',
        surface: '#0f172a',
        accent: '#6366f1',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(99,102,241,0.3)',
      },
    },
  },
  plugins: [],
};
