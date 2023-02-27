/** @type {import('tailwindcss').Config} */
module.exports = {
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
