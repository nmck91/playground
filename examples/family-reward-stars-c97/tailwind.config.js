/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./src/**/*.html", "./src/**/*.ts"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#29388f',    // Deep Blue
          accent: '#18b6ff',     // Vivid Azure
          secondary: '#31e1cc',  // Turquoise
        }
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
