import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

// @ts-check

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

// @ts-ignore
export default async (phase, { defaultConfig }) => {
  const redirects = [
    {
      source: "/web",
      destination: "/",
    },
    {
      source: "/creators",
      destination: "/creators/",
    },
    {
      source: "/contact",
      destination: "/contact/",
    },
  ];

  /** @type {import("next").NextConfig} */
  const config = {
    reactStrictMode: true,
    /** Enables hot reloading for local packages without a build step */
    transpilePackages: ["@acme/firebase"],
    /**
     * If you have the "experimental: { appDir: true }" setting enabled, then you
     * must comment the below `i18n` config out.
     *
     * @see https://github.com/vercel/next.js/issues/41980
     */
    i18n: {
      locales: ["en"],
      defaultLocale: "en",
    },
    eslint: { ignoreDuringBuilds: !!process.env.CI },
    typescript: { ignoreBuildErrors: !!process.env.CI },
    async redirects() {
      return redirects.map((redirect) => {
        const baseUrl =
          phase === PHASE_DEVELOPMENT_SERVER
            ? "http://localhost:3000"
            : "https://www.playhuddle.stream";
        return {
          ...redirect,
          destination: `${baseUrl}${redirect.destination}`,
          permanent: true,
          basePath: false,
        };
      });
    },
  };

  return config;
};
