/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "huddle-red": "#D93542",
        "huddle-black": "#3D3A3A",
        "huddle-app": "#1a1919",
        "play-button-overlay": "rgba(252, 165, 165, 0.4)",
        "video-ended-overlay": "rgba(0, 0, 0, 0.5)",
        option: "rgba(254, 254, 254, 0.3)",
      },
      boxShadow: {
        chat: "0 0 2rem rgba(0,0,0, 0.075), 0 1rem 1rem -1rem rgba(0,0,0, 0.1)",
        "chat-window":
          "0 0 8rem 0 rgba(0,0,0, 0.1), 0rem 2rem 4rem -3rem rgba(0,0,0, 0.5)",
      },
      borderRadius: {
        "chat-right": "1.125rem 1.125rem 0 1.125rem",
        "chat-left": "1.125rem 1.125rem 1.125rem 0",
      },
      keyframes: {
        fade: {
          "0%, 90%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        fade: "fade 1s forwards",
      },
    },
  },
  plugins: [],
};

module.exports = config;
