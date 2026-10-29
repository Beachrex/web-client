import { type Config } from "tailwindcss";
const flowbite = require("flowbite-react/tailwind");

export default {
  content: ["./src/**/*.tsx", flowbite.content()],
  safelist: [
    "text-[#5E1CA5]",
    "text-[#FF2877]",
    "text-[#FFC422]",
    "text-[#FF8000]",
    "text-[#DD0000]",

    "bg-[#5E1CA5]",
    "bg-[#FF2877]",
    "bg-[#FFC422]",
    "bg-[#FF8000]",
    "bg-[#DD0000]",
  ],
  theme: {
    extend: {
      fontFamily: {
        figtree: ["var(--font-figtree)", "sans-serif"],
        damion: ["var(--font-damion)", "cursive"],
      },
    },
    colors: {
      "variable-collection-bazen": "var(--variable-collection-bazen)",
      "variable-collection-bela": "var(--variable-collection-bela)",
      "variable-collection-dark-grey": "var(--variable-collection-dark-grey)",
      "variable-collection-dr-ava": "var(--variable-collection-dr-ava)",
      "variable-collection-jezero": "var(--variable-collection-jezero)",
      "variable-collection-kontinent": "var(--variable-collection-kontinent)",
      "variable-collection-light-grey": "var(--variable-collection-light-grey)",
      "variable-collection-mesto": "var(--variable-collection-mesto)",
      "variable-collection-middle-grey":
        "var(--variable-collection-middle-grey)",
      "variable-collection-morje": "var(--variable-collection-morje)",
      "variable-collection-morje-opacity":
        "var(--variable-collection-morje-opacity)",
      "variable-collection-morje-svetla":
        "var(--variable-collection-morje-svetla)",
      "variable-collection-otok": "var(--variable-collection-otok)",
      "variable-collection-regija": "var(--variable-collection-regija)",
      "variable-collection-reka": "var(--variable-collection-reka)",
      "variable-collection-semi-dark-grey":
        "var(--variable-collection-semi-dark-grey)",
      "variable-collection-temno-modro":
        "var(--variable-collection-temno-modro)",
      "variable-collection-ultra-light-grey":
        "var(--variable-collection-ultra-light-grey)",
    },
  },
  plugins: [flowbite.plugin()],
} satisfies Config;
