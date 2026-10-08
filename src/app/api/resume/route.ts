import { getResume } from "@/lib/resume/load";

/**
 * The resume as a JSON Resume document (https://jsonresume.org/schema).
 * Anything that understands the schema (themes, CLIs, ATS importers) can
 * consume this directly.
 */
export function GET() {
  return Response.json(getResume(), {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Disposition": 'inline; filename="resume.json"',
    },
  });
}
