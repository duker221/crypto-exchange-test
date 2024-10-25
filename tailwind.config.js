/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        firs: ["TT Firs Neue", "sans-serif"],
        pirate: ["Pirata One", "sans-serif"]
      },
      fontSize: {
        "32px": "32px",
        "28px": "28px",
        "26px": "26px",
        "22px": "22px"
      },
      lineHeight: {
        // высота строки
        "31.2px": "31.2px",
        "26.5px": "26.5px"
      },
      letterSpacing: {
        tighter: "-0.01em"
      },
      colors: {
        error: {
          500: "#c00000"
        },
        pink: {
          500: "#fed2cd"
        },
        brown: {
          500: "#773900"
        },
        cream: {
          500: "#feefcd"
        },
        black: {
          500: "#362A32"
        },
        secondBlack: {
          400: "#352831"
        },
        sand: {
          500: "#f1deb9"
        },
        disabled: {
          500: "#ba9467"
        }
      },
      borderRadius: {
        "custom-40": "40px",
        "custom-20": "20px"
      }
    }
  },
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  plugins: []
};
