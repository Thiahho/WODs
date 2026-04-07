import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#c6ff3d",
          dark:    "#a3e635",
          light:   "#d4ff5c",
        },
        surface: {
          DEFAULT: "#141414",
          raised:  "#1a1a1a",
          border:  "#262626",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "Arial Narrow", "sans-serif"],
      },
      boxShadow: {
        glow:    "0 0 20px rgba(198, 255, 61, 0.35)",
        "glow-sm": "0 0 10px rgba(198, 255, 61, 0.25)",
        "glow-lg": "0 0 40px rgba(198, 255, 61, 0.4)",
      },
      backgroundImage: {
        "brand-radial": "radial-gradient(ellipse at top, rgba(198,255,61,0.12) 0%, transparent 60%)",
        "hero-gradient": "linear-gradient(160deg, rgba(198,255,61,0.15) 0%, rgba(20,20,20,0) 50%)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(198,255,61,0.35)" },
          "50%":      { boxShadow: "0 0 35px rgba(198,255,61,0.55)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.4s ease-out both",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
