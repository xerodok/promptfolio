# Contributing

Thanks for improving Promptfolio. The short version:

1. Fork, create a branch, and run `pnpm install`.
2. Make the change. Keep it focused. Follow `AGENTS.md`.
3. Run `pnpm check` and `pnpm build`.
4. If the UI changed, include a desktop and a phone screenshot in the PR.
5. Open a pull request with the template filled in.

## Conventions

- Commit messages: imperative mood, one line of summary, details below.
  Author them as yourself: no AI co-author trailers or "Generated with" lines.
- Formatting is Prettier's; do not fight it.
- Add tests for pure logic (date formatting, terminal commands, schema).
- Do not add personal data to `content/`. The sample persona stays fictional.

## Reporting problems

Open an issue with steps to reproduce, the browser or device, and what you
expected. For security concerns, see `SECURITY.md`.
