/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   serverComponentsExternalPackages: ['@prisma/client'],
  // },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Garantir que as rotas da API sejam processadas corretamente
  async rewrites() {
    return []
  },
  // Log adicional para debug
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig