// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    const backendUrl = process.env.FAST_API_URL;
    if (!backendUrl) {
      return [];
    }
    return [
      {
        source: "/fast-api/:path*",
        destination: `${backendUrl}/fast-api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
 