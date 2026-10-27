import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "rgb(var(--c-navy) / <alpha-value>)", teal: "rgb(var(--c-teal) / <alpha-value>)", amber: "rgb(var(--c-accent) / <alpha-value>)",
        ink: "#182532", mist: "#F5F8FA",
      },
      fontFamily: { display: ["var(--font-display)", "system-ui", "sans-serif"], sans: ["var(--font-body)", "system-ui", "sans-serif"] },
      maxWidth: { wrap: "1320px" },
      keyframes: { float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } }, zoom: { "0%": { transform: "scale(1)" }, "100%": { transform: "scale(1.08)" } } },
      animation: { zoom: "zoom 9s ease-out forwards" },
    },
  },
  plugins: [],
} satisfies Config;
