#!/usr/bin/env bash

set -euo pipefail

usage() {
  printf 'Usage: %s [target-directory] [--force]\n' "$0"
  printf "\nCopies this repository's AGENTS.md into another project.\n"
  printf 'Existing files are preserved unless --force is provided.\n'
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

target_dir="${1:-.}"
force=false

if [[ "$target_dir" == "--force" ]]; then
  target_dir="."
  force=true
fi

if [[ "${2:-}" == "--force" || "$target_dir" == "--force" ]]; then
  force=true
fi

if [[ "$target_dir" == -* ]]; then
  printf 'Unknown option: %s\n' "$target_dir" >&2
  usage >&2
  exit 2
fi

if [[ ! -d "$target_dir" ]]; then
  printf 'Target directory does not exist: %s\n' "$target_dir" >&2
  exit 1
fi

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
source_file="$script_dir/../AGENTS.md"
target_file="$target_dir/AGENTS.md"

if [[ -e "$target_file" && "$force" != true ]]; then
  printf 'Refusing to overwrite existing file: %s\n' "$target_file" >&2
  printf 'Use --force to replace it.\n' >&2
  exit 1
fi

cp "$source_file" "$target_file"
printf 'Initialized %s\n' "$target_file"
