#!/usr/bin/env python3
"""Parse a coursicle HTML file and output a markdown doc."""
import json
import re
import sys

def parse(html_path, md_path):
    with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()

    # Extract JSON-LD (handle nested objects)
    match = re.search(
        r'<script\s+type="application/ld\+json">\s*(\{.*?\})\s*</script>',
        html, re.DOTALL
    )
    if not match:
        print(f"  WARNING: no JSON-LD found", file=sys.stderr)
        return False

    try:
        data = json.loads(match.group(1))
    except json.JSONDecodeError:
        # Try fixing truncated JSON
        raw = match.group(1)
        # Balance braces
        depth = 0
        end = 0
        for i, ch in enumerate(raw):
            if ch == '{': depth += 1
            elif ch == '}': depth -= 1
            if depth == 0:
                end = i + 1
                break
        try:
            data = json.loads(raw[:end])
        except:
            print(f"  WARNING: JSON parse failed", file=sys.stderr)
            return False

    code = data.get('courseCode', '???')
    name_full = data.get('name', '').replace(f'{code} - ', '')
    credits = data.get('numberOfCredits', '?')
    desc_raw = data.get('description', '')

    # Parse the description to split out prerequisites, notes, etc.
    # Split on sentence boundaries but be careful with abbreviations
    sentences = re.split(r'(?<=[.!])\s+', desc_raw)

    main_desc = []
    prereqs = []
    attributes = []
    grade_req = ''
    notes = []
    anti_reqs = []

    for s in sentences:
        s = s.strip()
        if not s:
            continue
        if re.search(r'[Pp]rerequisite', s):
            # Clean up "Enrollment Requirements: Prerequisite: ..."
            cleaned = re.sub(r'^Enrollment Requirements:\s*', '', s)
            prereqs.append(cleaned.rstrip('.'))
        elif re.search(r'[Cc]orequisite', s):
            prereqs.append(s.rstrip('.'))
        elif re.search(r'[Aa]dvisory', s):
            prereqs.append(s.rstrip('.'))
        elif re.search(r'Anti-requisite|May not be taken by students with credit for', s):
            anti_reqs.append(s.rstrip('.'))
        elif 'Requirement Designation' in s or 'DEC' in s:
            attributes.append(s.rstrip('.'))
        elif 'Required grade' in s:
            grade_req = s.rstrip('.')
        elif 'HD/CA' in s or 'High Demand' in s or 'Controlled Access' in s:
            notes.append(s.rstrip('.'))
        elif 'Not for credit in addition to' in s:
            anti_reqs.append(s.rstrip('.'))
        elif re.search(r'Non [A-Z]+ majors only', s):
            notes.append(s.rstrip('.'))
        else:
            main_desc.append(s.rstrip('.'))

    # Extract rating
    rating_data = data.get('aggregateRating', {})
    rating = rating_data.get('ratingValue', '')
    review_count = rating_data.get('ratingCount', '')

    # Build markdown
    md = f'# {code} - {name_full}\n\n'
    md += f'- **Credits:** {credits}\n'

    if attributes:
        md += f'- **Designation:** {"; ".join(attributes)}\n'
    if grade_req:
        md += f'- **{grade_req}**\n'
    if rating:
        md += f'- **Rating:** {rating}/100 ({review_count} reviews)\n'

    md += f'\n## Description\n\n{". ".join(main_desc)}.\n'

    if prereqs:
        md += f'\n## Prerequisites\n\n'
        for p in prereqs:
            md += f'- {p}\n'

    if anti_reqs:
        md += f'\n## Anti-requisites\n\n'
        for a in anti_reqs:
            md += f'- {a}\n'

    if notes:
        md += f'\n## Notes\n\n'
        for n in notes:
            md += f'- {n}\n'

    with open(md_path, 'w') as f:
        f.write(md)

    return True

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <html_file> <md_file>")
        sys.exit(1)
    ok = parse(sys.argv[1], sys.argv[2])
    sys.exit(0 if ok else 1)
