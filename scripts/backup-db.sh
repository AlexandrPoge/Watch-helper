#!/usr/bin/env bash
set -euo pipefail
umask 077
cd -- "$(dirname -- "$0")/.."
mkdir -p backups
archive=$(mktemp backups/watch-helper-XXXXXXXX)
trap 'rm -f -- "$archive"' EXIT
docker compose "$@" exec -T postgres pg_dump -U watch_helper -d watch_helper -Fc > "$archive"
docker compose "$@" exec -T postgres pg_restore --list < "$archive" > /dev/null
mv -- "$archive" "$archive.dump"
printf 'Backup saved to %s.dump\n' "$archive"
