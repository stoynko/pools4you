/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        libertinus: ["Libertinus Serif", "serif"],
      },
    },
  },
  plugins: [],
}