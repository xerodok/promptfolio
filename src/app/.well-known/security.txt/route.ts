import { connection } from "next/server";
import { getResume } from "@/lib/resume/load";

/**
 * /.well-known/security.txt (RFC 9116): how to report a problem with this
 * deployment. Built from `basics.email`; 404 when the resume has no email.
 * Dynamic because `Expires` is computed from the clock at request time.
 */
export async function GET() {
  await connection();
  const { basics } = getResume();
  if (!basics.email) return new Response("Not Found", { status: 404 });
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const lines = [
    `Contact: mailto:${basics.email}`,
    `Expires: ${expires}`,
    "Preferred-Languages: en",
  ];
  if (basics.url) lines.push(`Canonical: ${new URL("/.well-known/security.txt", basics.url).href}`);
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}
