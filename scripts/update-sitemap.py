#!/usr/bin/env python3
"""Remove pages from sitemap.ts"""

import re

# Read removed pages
with open('/tmp/removed-pages.txt', 'r') as f:
    removed_pages = set(line.strip() for line in f if line.strip())

print(f"Removing {len(removed_pages)} pages from sitemap...")

# Read sitemap
with open('app/sitemap.ts', 'r') as f:
    content = f.read()

# Split into lines
lines = content.split('\n')

# Track lines to keep
new_lines = []
skip_until = -1
removed_count = 0

for i, line in enumerate(lines):
    # Check if we're in a skip block
    if i <= skip_until:
        continue
    
    # Check if this line starts a page entry
    if 'url: `${baseUrl}/' in line:
        # Extract the page path
        match = re.search(r'\$\{baseUrl\}/([^`]+)', line)
        if match:
            page_path = match.group(1)
            # Check if this page should be removed
            if page_path in removed_pages:
                # Skip this entry and the next 4 lines (lastModified, changeFrequency, priority, closing brace)
                skip_until = i + 4
                removed_count += 1
                continue
    
    new_lines.append(line)

print(f"Removed {removed_count} entries from sitemap")

# Write updated sitemap
with open('app/sitemap.ts', 'w') as f:
    f.write('\n'.join(new_lines))

print("Sitemap updated!")
