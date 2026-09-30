#!/usr/bin/env bash
# Install the Stripe CLI for macOS into ~/.local/bin without Homebrew.
# Usage: bash scripts/demo/install-stripe-cli.sh
set -euo pipefail

case "$(uname -s)" in
  Darwin) ;;
  *) echo "This installer targets macOS only (uname -s = $(uname -s))." >&2; exit 1 ;;
esac

ARCH="$(uname -m)"
case "$ARCH" in
  arm64|x86_64) ;;
  *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;;
esac

RELEASE_API="https://api.github.com/repos/stripe/stripe-cli/releases/latest"
PATTERN="mac-os_${ARCH}.tar.gz"

echo "Looking up the latest Stripe CLI release for macOS ${ARCH}..."
RELEASE_JSON="$(curl -fsSL -H 'Accept: application/vnd.github+json' "$RELEASE_API")"

# Primary: grep/sed the browser_download_url for our asset. Fallback: python3.
URL="$(printf '%s' "$RELEASE_JSON" \
  | grep -o '"browser_download_url": *"[^"]*'"$PATTERN"'"' \
  | head -n1 \
  | sed -E 's/.*"browser_download_url": *"([^"]*)"/\1/' || true)"

if [ -z "$URL" ]; then
  URL="$(printf '%s' "$RELEASE_JSON" | python3 -c '
import json, sys
pattern = sys.argv[1]
data = json.load(sys.stdin)
for asset in data.get("assets", []):
    if asset.get("name", "").endswith(pattern):
        print(asset["browser_download_url"])
        break
' "$PATTERN" || true)"
fi

if [ -z "$URL" ]; then
  echo "Could not find an asset matching *${PATTERN} in the latest release." >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Downloading $URL"
curl -fsSL "$URL" -o "$TMP/stripe.tar.gz"
tar -xzf "$TMP/stripe.tar.gz" -C "$TMP"

if [ ! -f "$TMP/stripe" ]; then
  echo "Archive did not contain a 'stripe' binary." >&2
  exit 1
fi

mkdir -p "$HOME/.local/bin"
install -m 755 "$TMP/stripe" "$HOME/.local/bin/stripe"
xattr -d com.apple.quarantine "$HOME/.local/bin/stripe" 2>/dev/null || true

echo
echo "Installed: $HOME/.local/bin/stripe"
"$HOME/.local/bin/stripe" version
echo
case ":$PATH:" in
  *":$HOME/.local/bin:"*) ;;
  *)
    echo "Reminder: ~/.local/bin is not on your PATH. Add this to ~/.zshrc:"
    echo '  export PATH="$HOME/.local/bin:$PATH"'
    ;;
esac
echo "Next: stripe login, then: stripe listen --forward-to localhost:3000/api/stripe/webhook"
