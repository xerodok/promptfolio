import { connection } from "next/server";
import { BUILD_INFO } from "@/lib/build-info";

/** Liveness probe: the process is up and can serve a request. */
export async function GET() {
  // Opt into request-time rendering so uptime is live, not frozen at build time.
  await connection();
  return Response.json(
    { status: "ok", uptimeSeconds: Math.round(process.uptime()), ...BUILD_INFO },
    { headers: { "Cache-Control": "no-store" } },
  );
}
