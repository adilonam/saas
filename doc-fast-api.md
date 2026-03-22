# API reference (for agents)

Use this file to call the FastAPI app without guessing shapes. **Interactive OpenAPI:** `GET /docs` on the same host.

**Default base URL (local):** `http://localhost:8000` or FAST_API_URL

---

## Conventions

- **JSON errors:** FastAPI returns `{"detail": string | object}` for `4xx` / `5xx` unless noted.
- **PDF uploads:** `multipart/form-data`. Each part must use field name `file` (single) or `files` (merge / zip-create). **`UploadFile.filename` must end with `.pdf` (case-insensitive)** on PDF endpoints or the server responds **400** with `detail: "File must be a PDF"`.

---

## Health (`/health`)

| Method | Path | Request | Success response |
|--------|------|---------|------------------|
| `GET` | `/health/` | — | JSON object (see below) |
| `GET` | `/health/hello/{name}` | Path param `name`: string | JSON object (see below) |

**`GET /health/` response body**

```json
{ "message": "Hello World" }
```

**`GET /health/hello/{name}` response body**

```json
{ "message": "Hello <name>" }
```

(`<name>` is the path segment URL-decoded into the string.)

---

## PDF & LaTeX (`/fast-api/v1`)

All paths below are prefixed with `/fast-api/v1`.

### `POST /fast-api/v1/pdf-to-image`

**Request**

- **Content-Type:** `multipart/form-data`
- **Part:** `file` — one PDF file (`UploadFile`)

**Success: 200** — `application/json`

```json
{
  "filename": "string",
  "total_pages": 0,
  "pages": [
    {
      "page_number": 1,
      "image": "data:image/png;base64,<base64>",
      "width": 0,
      "height": 0
    }
  ]
}
```

- `image` is a **data URL** (`data:image/png;base64,…`), not raw base64 alone.
- `page_number` is 1-based; length of `pages` equals `total_pages`.

**Errors**

- **400** — not a `.pdf` filename (see conventions).
- **500** — `detail` like `"Error processing PDF: …"`.

---

### `POST /fast-api/v1/pdf-to-text`

**Request**

- **Content-Type:** `multipart/form-data`
- **Part:** `file` — one PDF

**Success: 200** — `application/json`

```json
{
  "filename": "string | null",
  "total_pages": 0,
  "text": "string"
}
```

- `text` is OCR output from Tesseract over rendered pages (concatenated, trimmed).

**Errors**

- **400** — invalid PDF upload (see conventions).
- **500** — `detail` like `"Error extracting text from PDF: …"`.

---

### `POST /fast-api/v1/pdf-to-docx`

**Request**

- **Content-Type:** `multipart/form-data`
- **Part:** `file` — one PDF

**Success: 200** — binary **DOCX**

- **Content-Type:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Header:** `Content-Disposition: attachment; filename="<basename>.docx"` where `<basename>` is the upload filename without extension, or `document` if missing.

**Errors**

- **400** — invalid PDF upload (see conventions).
- **500** — `detail` like `"Error converting PDF to DOCX: …"`.

---

### `POST /fast-api/v1/merge-pdfs`

**Request**

- **Content-Type:** `multipart/form-data`
- **Parts:** `files` — **one or more** PDFs (same field name repeated; order preserved = merge order)

**Success: 200** — binary **PDF**

- **Content-Type:** `application/pdf`
- **Header:** `Content-Disposition: attachment; filename=merged.pdf`

**Errors**

- **400** — empty list: `detail: "At least one PDF file is required"`, or non-PDF filename on any part.
- **500** — `detail` like `"Error merging PDFs: …"`.

---

### `POST /fast-api/v1/split-pdf`

**Request**

- **Content-Type:** `multipart/form-data`
- **Part:** `file` — one PDF

**Success: 200** — binary **ZIP** (`application/zip`) containing `page_001.pdf`, `page_002.pdf`, …

- **Header:** `Content-Disposition: attachment; filename="<basename>_pages.zip"`

**Errors**

- **400** — not a `.pdf` filename (see conventions).
- **500** — `detail` like `"Error splitting PDF: …"`.

---

### `POST /fast-api/v1/rotate-pdf`

**Request**

- **Content-Type:** `multipart/form-data`
- **Parts:**
  - `file` — one PDF
  - `rotation` — integer, clockwise degrees (must be a multiple of **90**, e.g. `90`, `180`, `-90`)
  - `pages` — optional string; comma-separated **1-based** page numbers (e.g. `1,3,5`). Empty or omitted = **all pages**.

**Success: 200** — binary **PDF**

- **Content-Type:** `application/pdf`
- **Header:** `Content-Disposition: attachment; filename="<basename>_rotated.pdf"`

**Errors**

- **400** — invalid PDF; invalid rotation/pages; `detail` explains validation (e.g. page out of range).
- **500** — `detail` like `"Error rotating PDF: …"`.

---

### `POST /fast-api/v1/pdf-metadata`

**Request**

- **Content-Type:** `multipart/form-data`
- **Part:** `file` — one PDF

**Success: 200** — `application/json`

```json
{
  "page_count": 0,
  "metadata": {
    "Title": "string | null",
    "Producer": "string | null"
  }
}
```

- `metadata` keys depend on the document; common keys include `Title`, `Author`, `Subject`, `Creator`, `Producer`, `CreationDate`, `ModDate`.

**Errors**

- **400** — not a `.pdf` filename (see conventions).
- **500** — `detail` like `"Error reading PDF metadata: …"`.

---

### `POST /fast-api/v1/pdf-extract-images`

**Request**

- **Content-Type:** `multipart/form-data`
- **Part:** `file` — one PDF

**Success: 200** — binary **ZIP** of embedded images (filenames like `p1_1_<name>.png`).

- **400** — `detail: "No extractable embedded images found in this PDF"` when nothing could be extracted.
- **500** — processing error.

---

### `POST /fast-api/v1/compress-pdf`

**Request**

- **Content-Type:** `multipart/form-data`
- **Parts:**
  - `file` — one PDF
  - `pdf_settings` — optional string, default `ebook`. Ghostscript `PDFSETTINGS`: `screen`, `ebook`, `printer`, `prepress`, `default`.

**Success: 200** — binary **PDF** (usually smaller than input).

**Errors**

- **400** — invalid `pdf_settings` or invalid PDF upload.
- **503** — Ghostscript (`gs`) not installed.
- **504** — compression timed out (**120s**).
- **500** — Ghostscript failure or other error (`detail` may include stderr snippet).

---

### `POST /fast-api/v1/latex-to-pdf`

**Request**

- **Content-Type:** `application/json`
- **Body:**

```json
{ "latex": "string" }
```

(`LatexBody` in code: single required field `latex`.)

**Success: 200** — binary **PDF**

- **Content-Type:** `application/pdf`
- **Header:** `Content-Disposition: attachment; filename=document.pdf`

**Errors**

- **400** — empty/whitespace-only `latex`: `detail: "LaTeX source is empty"`; or compilation failure: `detail` is a long string (stderr + log tail from `pdflatex`).
- **503** — `detail: "LaTeX (pdflatex) is not installed. Install texlive to use this endpoint."`
- **504** — `detail: "LaTeX compilation timed out."` (compile timeout **60s** per `pdflatex` run in implementation.)
- **500** — other failures: `detail` like `"Error compiling LaTeX: …"`.

---

## Tools (`/fast-api/v1`)

Same prefix as PDF routes: `/fast-api/v1`.

### `POST /fast-api/v1/image-convert`

**Request** — `multipart/form-data`

- `file` — image (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`, `.tif`, `.tiff`)
- `output_format` — required: `png`, `jpeg`, or `webp`
- `max_width`, `max_height` — optional positive integers (max **8192** each)
- `quality` — optional **1–100** (default **85**), used for JPEG/WebP
- `strip_metadata` — optional string: `true` / `false` / `1` / `0` (default `true`) — strips EXIF/metadata via re-decode when true

**Success: 200** — image bytes (`image/png`, `image/jpeg`, or `image/webp`).

**Errors**

- **400** — unsupported image type or invalid parameters.
- **500** — conversion error.

---

### `POST /fast-api/v1/qr-generate`

**Request** — `application/json`

```json
{
  "text": "string",
  "box_size": 8,
  "border": 2
}
```

- `text` — required, non-empty
- `box_size` — optional **1–40** (default **8**)
- `border` — optional **0–20** (default **2**)

**Success: 200** — binary **PNG** (`image/png`), `Content-Disposition: attachment; filename="qrcode.png"`.

---

### `POST /fast-api/v1/zip-create`

**Request** — `multipart/form-data`

- **Parts:** `files` — one or more files (repeat the same field name; max **100** files, total uncompressed size limit **80 MB**)

**Success: 200** — `application/zip`, `filename=archive.zip`

**Errors**

- **400** — no files, too many files, or size over limit (`detail` explains).
- **500** — ZIP build error.

---

### `POST /fast-api/v1/xlsx-to-json`

**Request** — `multipart/form-data`

- `file` — `.xlsx` workbook
- `max_rows` — optional integer, default **10000**; use **0** for no row limit

**Success: 200** — `application/json`

```json
{ "rows": [["A1", "B1"], [1, 2]] }
```

- First sheet only; cell values are strings, numbers, or JSON `null`.

**Errors**

- **400** — not `.xlsx`.
- **500** — read error.

---

### `POST /fast-api/v1/csv-to-json`

**Request** — `multipart/form-data`

- `file` — `.csv` (UTF-8, BOM allowed)
- `delimiter` — optional single character (default `,`)
- `max_rows` — optional, default **10000**; **0** = no limit

**Success: 200** — `application/json` `{ "rows": [ ["col1","col2"], … ] }` (all cell values strings).

**Errors**

- **400** — not `.csv`, delimiter not one character, or invalid UTF-8.
- **500** — read error.

---

### `POST /fast-api/v1/markdown-to-pdf`

**Request** — `application/json`

```json
{ "markdown": "string" }
```

- Must not be empty/whitespace-only.

**Success: 200** — binary **PDF** (`application/pdf`).

**Errors**

- **400** — empty markdown.
- **503** — WeasyPrint / system libraries unavailable.
- **500** — render error.

---

### `POST /fast-api/v1/html-to-pdf`

**Request** — `application/json`

```json
{ "html": "string" }
```

- Must not be empty/whitespace-only.

**Success: 200** — binary **PDF**.

**Errors**

- **400** — empty HTML.
- **503** — WeasyPrint / system libraries unavailable.
- **500** — render error.

---

## Quick index

| Endpoint | Input | Output |
|----------|-------|--------|
| `GET /health/` | — | `{ message }` |
| `GET /health/hello/{name}` | path `name` | `{ message }` |
| `POST /fast-api/v1/pdf-to-image` | form `file` | JSON pages + PNG data URLs |
| `POST /fast-api/v1/pdf-to-text` | form `file` | JSON `filename`, `total_pages`, `text` |
| `POST /fast-api/v1/pdf-to-docx` | form `file` | DOCX bytes |
| `POST /fast-api/v1/merge-pdfs` | form `files[]` | PDF bytes |
| `POST /fast-api/v1/split-pdf` | form `file` | ZIP of one PDF per page |
| `POST /fast-api/v1/rotate-pdf` | form `file`, `rotation`, optional `pages` | PDF bytes |
| `POST /fast-api/v1/pdf-metadata` | form `file` | JSON `page_count`, `metadata` |
| `POST /fast-api/v1/pdf-extract-images` | form `file` | ZIP of images |
| `POST /fast-api/v1/compress-pdf` | form `file`, optional `pdf_settings` | PDF bytes |
| `POST /fast-api/v1/latex-to-pdf` | JSON `{ latex }` | PDF bytes |
| `POST /fast-api/v1/image-convert` | form `file`, `output_format`, optional size/quality | Image bytes |
| `POST /fast-api/v1/qr-generate` | JSON `{ text, box_size?, border? }` | PNG bytes |
| `POST /fast-api/v1/zip-create` | form `files[]` | ZIP bytes |
| `POST /fast-api/v1/xlsx-to-json` | form `file`, optional `max_rows` | JSON `{ rows }` |
| `POST /fast-api/v1/csv-to-json` | form `file`, optional `delimiter`, `max_rows` | JSON `{ rows }` |
| `POST /fast-api/v1/markdown-to-pdf` | JSON `{ markdown }` | PDF bytes |
| `POST /fast-api/v1/html-to-pdf` | JSON `{ html }` | PDF bytes |
