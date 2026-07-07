#!/bin/bash
# Crawl course details from coursicle.com and generate markdown docs
# Usage: ./scripts/crawl-courses.sh
# Output: docs/ directory with markdown files per course

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCS_DIR="$SCRIPT_DIR/../docs"
RAW_DIR="$DOCS_DIR/.raw"
mkdir -p "$DOCS_DIR" "$RAW_DIR"

# AMS undergraduate courses
AMS_COURSES=(102 103 110 151 161 210 261 300 301 303 310 311 313 315 316 317 318 320 325 326 332 333 335 341 342 345 351 361 380 394 412 441 475 476 487 488 492)

# MAT undergraduate courses
MAT_COURSES=(118 119 122 123 125 126 127 131 132 141 200 203 211 250 303 307 308 310 311 312 313 314 315 319 320 322 324 331 336 341 342 344 351 360 362 364 371 373 401 475 487)

# Extra courses
PHI_COURSES=(220)

DELAY=2  # seconds between requests

fetch_and_parse() {
  local dept=$1
  local num=$2
  local mdfile="$DOCS_DIR/${dept}${num}.md"
  local rawfile="$RAW_DIR/${dept}${num}.html"

  if [ -f "$mdfile" ]; then
    echo "SKIP $dept $num (md already exists)"
    return
  fi

  echo -n "Fetching $dept $num... "

  curl -s -o "$rawfile" \
    -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    "https://www.coursicle.com/stonybrook/courses/${dept}/${num}/"

  local size=$(wc -c < "$rawfile")
  if [ "$size" -lt 500 ]; then
    echo "WARNING: too small ($size bytes), may be blocked"
    return
  fi

  if python3 "$SCRIPT_DIR/parse-course.py" "$rawfile" "$mdfile" 2>&1; then
    echo "OK"
  else
    echo "PARSE FAILED"
  fi

  sleep $DELAY
}

echo "=== Crawling PHI courses ==="
for num in "${PHI_COURSES[@]}"; do
  fetch_and_parse "PHI" "$num"
done

echo ""
echo "=== Crawling AMS courses (${#AMS_COURSES[@]} courses) ==="
for num in "${AMS_COURSES[@]}"; do
  fetch_and_parse "AMS" "$num"
done

echo ""
echo "=== Crawling MAT courses (${#MAT_COURSES[@]} courses) ==="
for num in "${MAT_COURSES[@]}"; do
  fetch_and_parse "MAT" "$num"
done

echo ""
echo "Done! Markdown files saved to $DOCS_DIR/"
echo "Total md files: $(ls "$DOCS_DIR"/*.md 2>/dev/null | wc -l)"

# Cleanup raw HTML
rm -rf "$RAW_DIR"
