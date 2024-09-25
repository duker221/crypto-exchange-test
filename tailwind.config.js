/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        firs: ["TT Firs Neue", "sans-serif"],
        pirate: ["Pirata One", "sans-serif"]
      },
      fontSize: {
        "26px": "26px" // размер шрифта
      },
      lineHeight: {
        "31.2px": "31.2px" // высота строки
      },
      letterSpacing: {
        tighter: "-0.01em" // межбуквенное расстояние
      },
      colors: {
        brown: {
          500: "#773900"
        },
        cream: {
          500: "#FEEFCD"
        },
        black: {
          500: "#362A32"
        },
        secondBlack: {
          400: "#352831"
        }
      }
    }
  },
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  plugins: []
};
