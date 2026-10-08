import type { Metadata } from "next";
import { getResume, getSite } from "@/lib/resume/load";
import "./globals.css";

const resume = getResume();
const site = getSite();

export const metadata: Metadata = {
  metadataBase: resume.basics.url ? new URL(resume.basics.url) : undefined,
  title: {
    default: `${resume.basics.name} — ${resume.basics.label ?? "Resume"}`,
    template: `%s · ${resume.basics.name}`,
  },
  description: resume.basics.summary,
  openGraph: {
    title: resume.basics.name,
    description: site.tagline,
    type: "profile",
  },
  alternates: { types: { "application/json": "/api/resume" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
