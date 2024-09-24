/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brown: {
          500: '#A52A2A', // Здесь указывается коричневый цвет
        },
      },
    },
  },
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Убедитесь, что все ваши файлы покрыты
  ],
  plugins: [],
};

