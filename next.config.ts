import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // shortcut: redirect static .html filenames from the Figma Make bundle to their Next.js routes, remove if static HTML serving is preferred
  async redirects() {
    return [
      { source: "/parent-login.html", destination: "/parent-login", permanent: false },
      { source: "/parent-signup.html", destination: "/parent-signup", permanent: false },
      { source: "/admin-login.html", destination: "/admin-login", permanent: false },
      { source: "/index.html", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
