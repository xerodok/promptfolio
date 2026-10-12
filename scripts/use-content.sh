#!/usr/bin/env sh
# Swap the content/ directory between the committed sample and a private set.
#
#   scripts/use-content.sh private      # copy private/resume.json + site.json into content/
#   scripts/use-content.sh sample       # restore the committed sample content
#
# private/ is gitignored. Keep your real resume there (or anywhere outside the
# repo) and run `private` before `pnpm dev` or `pnpm build`.
set -eu
case "${1:-}" in
  private)
    [ -f private/resume.json ] || { echo "private/resume.json not found" >&2; exit 1; }
    cp private/resume.json content/resume.json
    [ -f private/site.json ] && cp private/site.json content/site.json
    [ -f private/photo.jpg ] && cp private/photo.jpg public/photo.jpg
    echo "content/ now uses private/. Do not commit content/ in this state." ;;
  sample)
    git checkout -- content
    rm -f public/photo.jpg
    echo "content/ restored to the committed sample." ;;
  *) echo "usage: $0 private|sample" >&2; exit 2 ;;
esac
