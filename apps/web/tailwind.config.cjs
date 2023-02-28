/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  // @ts-ignore
  presets: [require('@acme/tailwind-config')],
  plugins: [],
};
