// Container health probe: exit 0 when /api/health answers 200, 1 otherwise.
// Used by the Dockerfile HEALTHCHECK and the Compose files; the distroless
// runtime has no shell or wget, so the probe is plain Node.
const port = process.env.PORT || "3000";
const url = `http://127.0.0.1:${port}/api/health`;
const timer = setTimeout(() => process.exit(1), 2500);
try {
  const res = await fetch(url);
  clearTimeout(timer);
  process.exit(res.ok ? 0 : 1);
} catch {
  process.exit(1);
}
