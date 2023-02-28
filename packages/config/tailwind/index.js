/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "huddle-red": "#D93542",
        "huddle-black": "#3D3A3A",
      },
    },
  },
  plugins: [],
};

module.exports = config;