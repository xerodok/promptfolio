# Claude Code guidance

Read `AGENTS.md` first; it is the single source of truth for working in this
repository. Summary of what matters most:

- Run `pnpm check` before claiming anything is done. It runs lint, typecheck,
  unit tests and the Prettier check.
- Content is data: `content/resume.json` (JSON Resume) and `content/site.json`.
  Never hard-code copy in components; add a typed field with a default.
- Pages are prerendered under Next.js Cache Components. No `new Date()` or
  request APIs in Server Components; use route handlers with `await connection()`.
- Keep the sample persona fictional. Never commit real personal data.
- Check mobile (390px) for any UI change.
