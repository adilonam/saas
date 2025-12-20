// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    console.log("rewrites");
    const backendUrl = process.env.FAST_API_URL;
    console.log("backendUrl", backendUrl);
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
 