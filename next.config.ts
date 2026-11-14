import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  typescript: { tsconfigPath: "tsconfig.app.json" },
  webpack(config, { webpack }) {
    // Next.js runs on Node on Vercel; Sites-only bindings do not exist there.
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(
      /^cloudflare:workers$/,
      path.resolve(process.cwd(), "lib/vercel-cloudflare.ts"),
    ));
    return config;
  },
};

export default nextConfig;
