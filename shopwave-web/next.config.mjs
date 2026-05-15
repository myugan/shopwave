/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Behind HTTPS ingress: same-origin /api/orders/* as on localhost; no extra auth in the app.
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
