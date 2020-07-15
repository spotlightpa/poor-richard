#!/bin/bash

set -euo pipefail

# Get the directory that this script file is in
THIS_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

cd "$THIS_DIR"

go version
set -x
GOPKG="github.com/spotlightpa/poor-richard/pkg/api"
BUILD_VERSION="$(git rev-parse --short HEAD)"
LDFLAGS="-X '$GOPKG.BuildVersion=$BUILD_VERSION'"

GOBIN=$THIS_DIR/functions go install -ldflags "$LDFLAGS" ./cmd/...
