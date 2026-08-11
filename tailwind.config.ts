import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "hh-green": "#0F5C3F",
        "hh-dark-green": "#0A3D2A",
        "hh-yellow": "#FFD93D",
        "hh-pink": "#FF3399",
        "hh-mint": "#8FC9A9",
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
        display: ["Impact", "'Arial Black'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
