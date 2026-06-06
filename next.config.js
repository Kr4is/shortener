/** @type {import('next').NextConfig} */
const fastApiUrl = process.env.FASTAPI_INTERNAL_URL || 'http://127.0.0.1:8000';

const nextConfig = {
  output: 'standalone',
  rewrites: async () => {
    const isDev = process.env.NODE_ENV === 'development';
    const apiBase = isDev ? 'http://127.0.0.1:8000' : fastApiUrl;

    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
      {
        source: '/s/:path*',
        destination: `${apiBase}/s/:path*`,
      },
      {
        source: '/docs',
        destination: `${apiBase}/docs`,
      },
      {
        source: '/openapi.json',
        destination: `${apiBase}/openapi.json`,
      },
    ];
  },
};

module.exports = nextConfig;
