import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-color)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
