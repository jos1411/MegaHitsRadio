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
    },
  },
  plugins: [],
};

export default config;
