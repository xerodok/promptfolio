import { ImageResponse } from "next/og";
import { getResume, getSite } from "@/lib/resume/load";

/**
 * The link-preview card (Open Graph / Twitter) rendered at build time from the
 * resume: a prompt line, the name, the tagline and the site's host. Social
 * networks fetch /opengraph-image when someone shares the URL.
 */
export const alt = getResume().basics.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const { basics } = getResume();
  const site = getSite();
  const subtitle = site.tagline || basics.label || "";
  const host = basics.url ? new URL(basics.url).host : "";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #0c131b 0%, #111a24 60%, #0f2238 100%)",
        color: "#e9eef3",
        fontFamily: "ui-monospace, Menlo, Consolas, monospace",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#8696a7" }}>
        <span style={{ color: "#3b8ff2" }}>{site.prompt}</span>
        <span>:~$ whoami</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05 }}>{basics.name}</div>
        {subtitle && (
          <div style={{ fontSize: 36, color: "#ccd6df", lineHeight: 1.3 }}>{subtitle}</div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 28,
          color: "#8696a7",
        }}
      >
        <span>{host}</span>
        <span>a resume that boots to a terminal</span>
      </div>
    </div>,
    size,
  );
}
