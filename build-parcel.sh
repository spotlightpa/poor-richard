#!/bin/bash

set -eux -o pipefail

# Get the directory that this script file is in
THIS_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

cd "$THIS_DIR"


if [[ -n "${NETLIFY_BUILD_BASE:-}" ]]; then
  PARCEL_CACHE_DIR=$NETLIFY_BUILD_BASE/cache/parcel
  mkdir -p "$PARCEL_CACHE_DIR"
  ls "$PARCEL_CACHE_DIR" | wc
else
  PARCEL_CACHE_DIR=$(pwd)/.cache
fi

PATH="$THIS_DIR/node_modules/.bin:$PATH"

parcel build src/entrypoints/* \
    --experimental-scope-hoisting \
    --public-url /@src \
    --cache-dir "$PARCEL_CACHE_DIR"
