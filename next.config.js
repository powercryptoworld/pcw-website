/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/swaplab', destination: '/token-search-test' },
      { source: '/swaplab/:path*', destination: '/token-search-test/:path*' },
    ];
  },
};
module.exports = nextConfig;
