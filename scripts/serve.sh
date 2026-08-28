#!/usr/bin/env bash
# Local preview server for neural-interfaces26.github.io
# Usage: ./scripts/serve.sh [port]
#
# Static site, no build step. Python 3's http.server is enough.
set -euo pipefail
PORT="${1:-8080}"
cd "$(dirname "$0")/.."
echo "Serving on http://localhost:$PORT ..."
echo "Pages:"
echo "  /                /index.html"
echo "  /organizers.html /leaderboard.html"
echo "  /awards.html     /startkit.html"
echo "  /ethics.html     /track-record.html"
echo "  /faq.html"
exec python3 -m http.server "$PORT"
