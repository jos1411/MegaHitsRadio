import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0f0f23",
        surface: "#1a1a2e",
        accent: "#e84545",
        "accent-hover": "#c93636",
        foreground: "#ececf4",
        muted: "#9a9ab5",
      },
      // Material weight encodes hierarchy (apple-design): heavier surfaces
      // cast deeper shadows than light chips.
      boxShadow: {
        chip: "0 1px 2px rgb(0 0 0 / 0.3)",
        material: "0 -8px 24px -12px rgb(0 0 0 / 0.55)",
        "material-lg": "0 24px 48px -12px rgb(0 0 0 / 0.6)",
      },
      // Spring-like easing tokens. CSS approximates a spring; true
      // interruptible springs need `motion` (not installed).
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
