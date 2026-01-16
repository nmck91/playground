/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./src/**/*.html", "./src/**/*.ts"],
  theme: {
    extend: {
      colors: {
        'dadai-navy': '#29388f',
        'dadai-cyan': '#18b6ff',
        'dadai-turquoise': '#31e1cc',
        'dadai-navy-light': '#3a4fa8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
