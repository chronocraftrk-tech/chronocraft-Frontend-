/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,jsx,mdx}",
    "./components/**/*.{js,jsx,mdx}",
    "./app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C9A84C",
          light: "#F5E6C3",
        },
        black: {
          DEFAULT: "#0A0A0A",
        },
        dark: {
          DEFAULT: "#1A1A1A",
        },
        surface: "#111111",
      },
      fontFamily: {
        display: ["var(--font-display)", "Playfair Display", "serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

module.exports = config;
