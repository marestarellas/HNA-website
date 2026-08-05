import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "images.unsplash.com" },
		],
	},
};

// Make Cloudflare bindings (D1, R2, etc.) available inside `next dev`.
// In production they are injected automatically by the Worker runtime.
initOpenNextCloudflareForDev();

export default nextConfig;
