import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Keep raw 127.0.0.1 origins on Windows: normalizing to localhost turns an
  // internal locale rewrite into an external proxy and re-runs middleware.
  skipMiddlewareUrlNormalize: true,
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
