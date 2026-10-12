# Security

Promptfolio serves static, prerendered pages plus three read-only JSON routes.
It has no authentication, no database and no secrets at runtime.

- Report vulnerabilities privately to the repository owner via GitHub's
  "Report a vulnerability" button rather than a public issue.
- The container runs as a non-root user with a read-only root filesystem in
  the provided compose and Kubernetes manifests.
- Security headers are set in `next.config.ts`. A Content Security Policy is a
  known follow-up; nonce-based CSP would force per-request rendering.
- CI runs gitleaks on every push. Keep real resumes, photos and tokens out of
  the public template.
