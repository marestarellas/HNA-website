/**
 * Catch-all mount point for the stories API.
 *
 * Everything under /api is served by one Hono app (`src/server/app.ts`) rather
 * than by a tree of individual Next route handlers. That keeps the routing and
 * the embedding/clustering pipeline byte-identical to the standalone Worker
 * they were developed against, and means new endpoints get added in one file.
 *
 * `getCloudflareContext()` supplies the Cloudflare bindings. Passing `ctx`
 * through is not optional — POST /api/stories uses `ctx.waitUntil()` to embed,
 * project and cluster a new submission in the background after responding.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import app from "@/server/app";

// Never prerender or cache: every request needs live bindings.
export const dynamic = "force-dynamic";

function handler(request: Request): Response | Promise<Response> {
	const { env, ctx } = getCloudflareContext();
	return app.fetch(request, env, ctx);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
