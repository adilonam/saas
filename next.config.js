// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
};

module.exports = nextConfig;
