/**
 * Build metadata, injected at image build time (see Dockerfile ARG/ENV) and
 * exposed on /api/health so a running pod can be matched to a git commit.
 */
export const BUILD_INFO = {
  version: process.env.APP_VERSION ?? "dev",
  commit: process.env.GIT_SHA ?? "unknown",
} as const;
