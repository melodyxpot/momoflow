/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@momoflow/ui", "@momoflow/lib", "@heroui/react"],
  experimental: {
    optimizePackageImports: ["@heroui/react", "recharts"],
  },
};

export default nextConfig;
