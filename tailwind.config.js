/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F8FA",
        ink: {
          DEFAULT: "#0A0D14",
          soft: "#12172A",
          line: "#232A40",
        },
        signal: {
          teal: "#1FCBA0",
          "teal-soft": "#E4FBF3",
          indigo: "#6C5CE7",
          "indigo-soft": "#EFECFE",
          amber: "#F5A524",
          red: "#F2545B",
        },
        ash: {
          50: "#F7F8FA",
          100: "#EEF0F4",
          200: "#DEE2E9",
          300: "#C3C9D4",
          400: "#8D95A6",
          500: "#636B7C",
          600: "#454D5E",
          700: "#2C3241",
          800: "#191E2B",
          900: "#0F1320",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,13,20,0.04), 0 8px 24px -12px rgba(10,13,20,0.12)",
        "card-hover": "0 4px 12px rgba(10,13,20,0.06), 0 16px 40px -12px rgba(10,13,20,0.18)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        dash: {
          "0%": { strokeDashoffset: "251" },
          "100%": { strokeDashoffset: "var(--score-offset, 60)" },
        },
      },
      animation: {
        scanline: "scanline 2.4s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out forwards",
        dash: "dash 1.4s cubic-bezier(0.65,0,0.35,1) forwards",
      },
    },
  },
  plugins: [],
};
