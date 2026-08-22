#!/usr/bin/env python3
"""Download IQ test images from img.testlibrary.com CDN into public/images/iq-test/."""

from __future__ import annotations

import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE_URLS = (
    "https://img.testlibrary.com/cdn-cgi/image/{filename}",
    "https://img.testlibrary.com/cdn-cgi/image//{filename}",
)

REPO_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = REPO_ROOT / "public" / "images" / "iq-test"

# Unique filenames to download (order preserved; later duplicates ignored).
FILENAMES: list[str] = [
    "harvard.png",
    "berkeley.png",
    "oxford.png",
    *[f"iq-q{n}-question.png" for n in range(11, 35)],
    *[f"transition-window-{n}.png" for n in range(1, 5)],
    "test-guidelines.png",
]

# Option images: most questions have opt-1..opt-6
for q in (
    *range(11, 28),  # q11–q27
    29,
    30,
    33,
    34,
    38,
):
    for opt in range(1, 7):
        FILENAMES.append(f"iq-q{q}-opt-{opt}.png")

# q31 special: opt-2 is opt-2-v2
FILENAMES.extend(
    [
        "iq-q31-opt-1.png",
        "iq-q31-opt-2-v2.png",
        "iq-q31-opt-3.png",
        "iq-q31-opt-4.png",
        "iq-q31-opt-5.png",
        "iq-q31-opt-6.png",
    ]
)


def unique_filenames(names: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for name in names:
        if name not in seen:
            seen.add(name)
            out.append(name)
    return out


def download_one(filename: str, dest: Path) -> str:
    """Download a single file. Returns 'downloaded', 'skipped', or 'failed'."""
    if dest.exists() and dest.stat().st_size > 0:
        print(f"SKIP  {filename} (already exists, {dest.stat().st_size} bytes)")
        return "skipped"

    last_error: Exception | None = None
    for pattern in BASE_URLS:
        url = pattern.format(filename=filename)
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; iq-test-image-downloader/1.0)"},
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            if not data:
                last_error = ValueError("empty response body")
                continue
            dest.write_bytes(data)
            print(f"OK    {filename} ({len(data)} bytes) <- {url}")
            return "downloaded"
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError, OSError) as exc:
            last_error = exc
            continue

    print(f"FAIL  {filename}: {last_error}")
    return "failed"


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    names = unique_filenames(FILENAMES)

    downloaded = skipped = failed = 0
    failed_names: list[str] = []

    print(f"Output directory: {OUT_DIR}")
    print(f"Files to fetch: {len(names)}")
    print("-" * 60)

    for name in names:
        status = download_one(name, OUT_DIR / name)
        if status == "downloaded":
            downloaded += 1
        elif status == "skipped":
            skipped += 1
        else:
            failed += 1
            failed_names.append(name)

    print("-" * 60)
    print(
        f"Summary: downloaded={downloaded}  skipped={skipped}  failed={failed}  total={len(names)}"
    )
    if failed_names:
        print("Failed filenames:")
        for name in failed_names:
            print(f"  - {name}")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
