#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  source "$PROJECT_ROOT/.env"
  set +a
fi

: "${ANDROID_KEY_PASSWORD:?ANDROID_KEY_PASSWORD is not set}"
: "${ANDROID_KEY_ALIAS:?ANDROID_KEY_ALIAS is not set}"
: "${ANDROID_KEYSTORE_PASSWORD:?ANDROID_KEYSTORE_PASSWORD is not set}"

exec "$SCRIPT_DIR/gradlew" assembleRelease \
  -Pandroid.injected.signing.store.file="$SCRIPT_DIR/phosphor-cam-release.jks" \
  -Pandroid.injected.signing.store.password="$ANDROID_KEYSTORE_PASSWORD" \
  -Pandroid.injected.signing.key.alias="$ANDROID_KEY_ALIAS" \
  -Pandroid.injected.signing.key.password="$ANDROID_KEY_PASSWORD"
