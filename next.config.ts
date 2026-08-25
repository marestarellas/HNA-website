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
//
// Guarded to development on purpose. Called unconditionally, this opens a
// remote proxy session for the bindings that cannot be emulated locally (AI,
// and Vectorize when bound) — during `next build` as well as `next dev`. That
// makes a *build* fail with "you must be logged in" whenever the Wrangler token
// has expired, which is confusing (the error names `wrangler dev`) and means
// nobody can compile the site without Cloudflare account access, CI included.
// Nothing in the build needs live bindings: no page reads them at build time,
// and the /api route is force-dynamic.
if (process.env.NODE_ENV === "development") {
	initOpenNextCloudflareForDev();
}

export default nextConfig;
