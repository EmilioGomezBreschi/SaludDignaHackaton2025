import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  webpack: (config: { experiments: { asyncWebAssembly: boolean; layers: boolean; }; module: { rules: { test: RegExp; type: string; generator: { filename: string; }; }[]; }; resolve: { fallback: any; }; }) => {
    config.experiments = { 
      asyncWebAssembly: true,
      layers: true 
    };
    
    // Configurar carga de WASM
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[name][ext]'
      }
    });

    // Polyfills para Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false
    };

    return config;
  }
};