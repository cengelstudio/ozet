const {withBlitz} = require("@blitzjs/next")

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cnnturk.com' },
      { protocol: 'https', hostname: '**.hurriyet.com.tr' },
      { protocol: 'https', hostname: '**.haberturk.com' },
      { protocol: 'https', hostname: '**.sabah.com.tr' },
      { protocol: 'https', hostname: '**.sozcu.com.tr' },
      { protocol: 'https', hostname: '**.cumhuriyet.com.tr' },
      { protocol: 'https', hostname: '**.t24.com.tr' },
      { protocol: 'https', hostname: '**.ahaber.com.tr' },
      { protocol: 'https', hostname: '**.haberglobal.com.tr' },
      { protocol: 'https', hostname: '**.trthaber.com' },
      { protocol: 'https', hostname: '**.bianet.org' },
      { protocol: 'https', hostname: '**.bbci.co.uk' },
      { protocol: 'https', hostname: '**.dw.com' },
      { protocol: 'https', hostname: '**.aa.com.tr' },
      { protocol: 'https', hostname: '**' },
    ],
  }
}

module.exports = withBlitz(nextConfig)
