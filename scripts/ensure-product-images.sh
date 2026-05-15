#!/usr/bin/env bash
# Ensures shopwave-web/public/products/*.jpg exist (required for product cards).
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)/shopwave-web/public/products"
mkdir -p "$DIR"

need=0
for id in prod_001 prod_002 prod_003 prod_004 prod_005 prod_006; do
  if [[ ! -s "$DIR/${id}.jpg" ]]; then
    need=1
    break
  fi
done

if [[ "$need" -eq 0 ]]; then
  echo "Product images OK ($DIR)"
  exit 0
fi

echo "Downloading missing product images to $DIR …"
pairs="prod_001:60 prod_002:26 prod_003:180 prod_004:39 prod_005:61 prod_006:96"
for pair in $pairs; do
  id="${pair%%:*}"
  pid="${pair##*:}"
  curl -fsSL "https://picsum.photos/id/${pid}/800/600.jpg" -o "$DIR/${id}.jpg"
  echo "  $id.jpg"
done
echo "Done."
