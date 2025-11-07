// in tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Add this line:
  darkMode: 'class',

  content: [
    // This tells Tailwind to scan all your pages and components
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}