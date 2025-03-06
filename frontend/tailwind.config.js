/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path to match your project structure
  ],
  theme: {
    extend: {
      colors: {
        // Define your custom color palette
        primary: {
          DEFAULT: '#000000', // Black
        },
        secondary: {
          DEFAULT: '#FFFFFF', // White
        },
        accent: {
          DEFAULT: '#808080', // Gray
        },
      },
    },
  },
  plugins: [],
};