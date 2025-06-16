/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ryv0c6xml4yztloe.public.blob.vercel-storage.com", // ganti jika domain blob kamu lain
        // pathname: '/**', // opsional, allow all paths
      },
      // Tambahkan domain lain jika perlu
    ],
  },

  experimental: {
    optimizePackageImports: ["@heroicons/react"],
    // tambahkan fitur experimental Next.js 15 lain jika perlu
  },

  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "development"
                ? "*"
                : "https://yourdomain.com", // ganti dengan domain production kamu
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
