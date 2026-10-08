import { connection } from "next/server";
import { loadContent } from "@/lib/resume/load";

/**
 * Readiness probe: the content validates, so pages and the JSON API will
 * render. Returns 503 if the resume document fails schema validation.
 */
export async function GET() {
  await connection();
  try {
    const { resume } = loadContent();
    return Response.json(
      { status: "ready", resumeVersion: resume.meta?.version ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { status: "not-ready", error: error instanceof Error ? error.message : String(error) },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
