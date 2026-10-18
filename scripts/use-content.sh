#!/usr/bin/env sh
# Swap the content/ directory between the committed sample and a private set.
#
#   scripts/use-content.sh private      # copy private/{resume,site,about}.json into content/,
#                                       # private/photo.jpg and private/logos/ into public/
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
    [ -f private/about.json ] && cp private/about.json content/about.json
    [ -f private/photo.jpg ] && cp private/photo.jpg public/photo.jpg
    [ -d private/logos ] && mkdir -p public/logos && cp private/logos/* public/logos/
    echo "content/ now uses private/. Do not commit content/ in this state." ;;
  sample)
    # Restores from the index, so sample edits staged with `git add` survive a swap.
    git checkout -- content
    rm -f public/photo.jpg
    # Only the logos that came from private/; the committed sample logos stay.
    for f in private/logos/*; do [ -f "$f" ] && rm -f "public/logos/$(basename "$f")"; done
    echo "content/ restored to the committed sample." ;;
  *) echo "usage: $0 private|sample" >&2; exit 2 ;;
esac
