// Comprehensive tools registry with search keywords
export interface Tool {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[]; // Additional search terms
}

export const TOOLS_REGISTRY: Tool[] = [
  // PDF Tools (30 tools)
  { slug: "sign-pdf", title: "Sign PDF", description: "Add digital signatures to PDF documents", category: "PDF", keywords: ["pdf", "sign", "signature", "document", "esign"] },
  { slug: "merge-pdf", title: "Merge PDF", description: "Combine multiple PDF files into one", category: "PDF", keywords: ["pdf", "merge", "combine", "join", "document"] },
  { slug: "split-pdf", title: "Split PDF", description: "Split PDF into separate files", category: "PDF", keywords: ["pdf", "split", "separate", "divide", "document"] },
  { slug: "compress-pdf", title: "Compress PDF", description: "Reduce PDF file size", category: "PDF", keywords: ["pdf", "compress", "reduce", "size", "optimize", "document"] },
  { slug: "rotate-pdf", title: "Rotate PDF", description: "Rotate PDF pages", category: "PDF", keywords: ["pdf", "rotate", "turn", "orientation", "document"] },
  { slug: "pdf-to-word", title: "PDF to Word", description: "Convert PDF to Word document", category: "PDF", keywords: ["pdf", "word", "docx", "convert", "document"] },
  { slug: "pdf-to-text", title: "PDF to Text", description: "Extract text from PDF", category: "PDF", keywords: ["pdf", "text", "extract", "convert", "document"] },
  { slug: "pdf-to-image", title: "PDF to Image", description: "Convert PDF pages to images", category: "PDF", keywords: ["pdf", "image", "png", "jpg", "convert", "document"] },
  { slug: "pdf-to-markdown", title: "PDF to Markdown", description: "Convert PDF to Markdown", category: "PDF", keywords: ["pdf", "markdown", "md", "convert", "document"] },
  { slug: "image-to-pdf", title: "Image to PDF", description: "Convert images to PDF", category: "PDF", keywords: ["pdf", "image", "jpg", "png", "convert", "document"] },
  { slug: "image-batch-to-pdf", title: "Batch Image to PDF", description: "Convert multiple images to PDF", category: "PDF", keywords: ["pdf", "image", "batch", "multiple", "convert", "document"] },
  { slug: "html-to-pdf", title: "HTML to PDF", description: "Convert HTML to PDF", category: "PDF", keywords: ["pdf", "html", "web", "convert", "document"] },
  { slug: "html-invoice-to-pdf", title: "Invoice to PDF", description: "Create PDF invoices from HTML", category: "PDF", keywords: ["pdf", "invoice", "html", "bill", "convert", "document"] },
  { slug: "markdown-to-pdf", title: "Markdown to PDF", description: "Convert Markdown to PDF", category: "PDF", keywords: ["pdf", "markdown", "md", "convert", "document"] },
  { slug: "markdown-brand-pdf", title: "Branded PDF from Markdown", description: "Create branded PDFs from Markdown", category: "PDF", keywords: ["pdf", "markdown", "brand", "template", "document"] },
  { slug: "screenshot-to-pdf-reporter", title: "Screenshot to PDF Report", description: "Create PDF reports from screenshots", category: "PDF", keywords: ["pdf", "screenshot", "report", "document"] },
  { slug: "summarize-pdf", title: "Summarize PDF", description: "AI-powered PDF summarization", category: "PDF", keywords: ["pdf", "summarize", "summary", "ai", "document"] },
  { slug: "pdf-metadata", title: "PDF Metadata Editor", description: "Edit PDF metadata", category: "PDF", keywords: ["pdf", "metadata", "properties", "edit", "document"] },
  { slug: "pdf-metadata-inspector", title: "PDF Metadata Inspector", description: "View PDF metadata", category: "PDF", keywords: ["pdf", "metadata", "properties", "inspect", "document"] },
  { slug: "pdf-extract-images", title: "Extract Images from PDF", description: "Extract all images from PDF", category: "PDF", keywords: ["pdf", "extract", "image", "photo", "document"] },
  { slug: "pdf-keyword-extractor", title: "PDF Keyword Extractor", description: "Extract keywords from PDF", category: "PDF", keywords: ["pdf", "keyword", "extract", "terms", "document"] },
  { slug: "pdf-action-items", title: "PDF Action Items", description: "Extract action items from PDF", category: "PDF", keywords: ["pdf", "action", "items", "tasks", "document"] },
  { slug: "pdf-qa-assistant", title: "PDF Q&A Assistant", description: "Ask questions about PDF content", category: "PDF", keywords: ["pdf", "qa", "question", "answer", "ai", "document"] },
  { slug: "pdf-outline-generator", title: "PDF Outline Generator", description: "Generate PDF outline/TOC", category: "PDF", keywords: ["pdf", "outline", "toc", "contents", "document"] },
  { slug: "pdf-range-splitter", title: "PDF Range Splitter", description: "Split PDF by page ranges", category: "PDF", keywords: ["pdf", "split", "range", "pages", "document"] },
  { slug: "pdf-rotate-compress", title: "PDF Rotate & Compress", description: "Rotate and compress PDF", category: "PDF", keywords: ["pdf", "rotate", "compress", "optimize", "document"] },
  { slug: "pdf-compliance-checker", title: "PDF Compliance Checker", description: "Check PDF compliance", category: "PDF", keywords: ["pdf", "compliance", "check", "validate", "document"] },
  { slug: "pdf-ocr-translate", title: "PDF OCR & Translate", description: "OCR and translate PDF", category: "PDF", keywords: ["pdf", "ocr", "translate", "language", "document"] },
  { slug: "multi-pdf-compare", title: "Compare PDFs", description: "Compare multiple PDF files", category: "PDF", keywords: ["pdf", "compare", "diff", "difference", "document"] },
  { slug: "generate-pdf", title: "Generate PDF", description: "Create custom PDF documents", category: "PDF", keywords: ["pdf", "generate", "create", "document"] },

  // Image Tools
  { slug: "compress-image", title: "Compress Image", description: "Reduce image file size", category: "Image", keywords: ["image", "compress", "reduce", "optimize", "photo", "picture"] },
  { slug: "image-convert", title: "Convert Image", description: "Convert between image formats", category: "Image", keywords: ["image", "convert", "format", "jpg", "png", "webp", "photo"] },
  { slug: "image-to-prompt", title: "Image to Prompt", description: "Generate AI prompts from images", category: "Image", keywords: ["image", "prompt", "ai", "describe", "photo"] },

  // JSON/Data Tools
  { slug: "json-to-csv", title: "JSON to CSV", description: "Convert JSON to CSV", category: "Data", keywords: ["json", "csv", "convert", "data", "format"] },
  { slug: "json-minify-beautify", title: "JSON Formatter", description: "Minify or beautify JSON", category: "Data", keywords: ["json", "format", "minify", "beautify", "data"] },
  { slug: "csv-to-json", title: "CSV to JSON", description: "Convert CSV to JSON", category: "Data", keywords: ["csv", "json", "convert", "data", "format"] },
  { slug: "xlsx-to-json", title: "Excel to JSON", description: "Convert Excel to JSON", category: "Data", keywords: ["excel", "xlsx", "json", "convert", "data"] },

  // Countdown/Time Tools
  { slug: "christmas-countdown", title: "Christmas Countdown", description: "Count down to Christmas", category: "Time", keywords: ["countdown", "christmas", "timer", "holiday", "count"] },
  { slug: "new-year-countdown", title: "New Year Countdown", description: "Count down to New Year", category: "Time", keywords: ["countdown", "new year", "timer", "count"] },
  { slug: "countdown-timer-generator", title: "Countdown Timer Generator", description: "Online countdown maker with shareable link and embed", category: "Time", keywords: ["countdown timer generator", "online countdown generator", "countdown maker", "countdown", "timer", "embed"] },
  { slug: "time-calculator", title: "Time Calculator", description: "Calculate time durations", category: "Calculator", keywords: ["time", "calculator", "duration", "hours", "minutes"] },
  { slug: "timestamp-converter", title: "Timestamp Converter", description: "Convert timestamps", category: "Time", keywords: ["timestamp", "unix", "convert", "time", "date"] },

  // Calculator Tools
  { slug: "age-calculator", title: "Age Calculator", description: "Calculate exact age", category: "Calculator", keywords: ["age", "calculator", "birthday", "years", "calculate"] },
  { slug: "bmi-calculator", title: "BMI Calculator", description: "Calculate body mass index", category: "Calculator", keywords: ["bmi", "calculator", "health", "weight", "calculate"] },
  { slug: "black-friday-discount-calculator", title: "Black Friday Calculator", description: "Calculate discounts and savings", category: "Calculator", keywords: ["black friday", "discount", "calculator", "savings", "sale", "calculate"] },
  { slug: "discount-calculator", title: "Discount Calculator", description: "Calculate discounts", category: "Calculator", keywords: ["discount", "calculator", "percentage", "savings", "calculate"] },
  { slug: "tip-split-calculator", title: "Tip Split Calculator", description: "Calculate tip and split bills", category: "Calculator", keywords: ["tip", "split", "calculator", "bill", "restaurant", "calculate"] },
  { slug: "loan-payment-calculator", title: "Loan Payment Calculator", description: "Calculate loan payments", category: "Calculator", keywords: ["loan", "payment", "calculator", "mortgage", "finance", "calculate"] },
  { slug: "roi-calculator", title: "ROI Calculator", description: "Calculate return on investment", category: "Calculator", keywords: ["roi", "calculator", "return", "investment", "calculate"] },
  { slug: "breakeven-calculator", title: "Break Even Calculator", description: "Calculate break-even point", category: "Calculator", keywords: ["break even", "breakeven", "calculator", "business", "calculate"] },

  // Share & Communication Tools
  { slug: "share", title: "Share Files Securely", description: "Send files with end-to-end encryption", category: "File", keywords: ["share", "file", "send", "transfer", "encrypt", "qr", "secure"] },
  { slug: "qr-generate", title: "QR Code Generator", description: "Create QR codes", category: "Generator", keywords: ["qr", "code", "generator", "barcode", "generate"] },
  { slug: "wifi-qr-generator", title: "WiFi QR Generator", description: "Generate WiFi QR codes", category: "Generator", keywords: ["wifi", "qr", "code", "generator", "network"] },
  { slug: "vcard-qr-generator", title: "vCard QR Generator", description: "Generate contact QR codes", category: "Generator", keywords: ["vcard", "qr", "contact", "business card", "generator"] },

  // Secret Santa & Generators
  { slug: "secret-santa-generator", title: "Secret Santa Generator", description: "Generate Secret Santa assignments", category: "Generator", keywords: ["secret santa", "generator", "christmas", "gift", "generate"] },
  { slug: "password-generator", title: "Password Generator", description: "Generate secure passwords", category: "Generator", keywords: ["password", "generator", "security", "random", "generate"] },
  { slug: "uuid-generator", title: "UUID Generator", description: "Generate UUIDs", category: "Generator", keywords: ["uuid", "generator", "unique", "id", "generate"] },

  // Calendar & Planning
  { slug: "2027-calendar", title: "2027 Calendar", description: "View full 2027 calendar", category: "Time", keywords: ["calendar", "2027", "year", "date", "schedule"] },
  { slug: "daily-planner", title: "Daily Planner", description: "Plan your day", category: "Productivity", keywords: ["planner", "daily", "schedule", "organize", "plan"] },
  { slug: "weekly-calendar-notes", title: "Weekly Calendar", description: "Weekly calendar with notes", category: "Productivity", keywords: ["calendar", "weekly", "notes", "schedule", "plan"] },

  // Text & Writing Tools
  { slug: "word-counter", title: "Word Counter", description: "Count words and characters", category: "Text", keywords: ["word", "counter", "count", "text", "characters"] },
  { slug: "text-case-converter", title: "Text Case Converter", description: "Convert text case", category: "Text", keywords: ["text", "case", "converter", "uppercase", "lowercase", "convert"] },
  { slug: "text-diff-checker", title: "Text Diff Checker", description: "Compare text differences", category: "Text", keywords: ["text", "diff", "compare", "difference", "check"] },
  { slug: "text-summarizer", title: "Text Summarizer", description: "Summarize text with AI", category: "Text", keywords: ["text", "summarize", "summary", "ai", "summarizer"] },

  // YouTube & Social Media
  { slug: "youtube-title-length-checker", title: "YouTube Title Length Checker", description: "Check YouTube title length", category: "Social", keywords: ["youtube", "title", "length", "checker", "check"] },
  { slug: "youtube-title-generator", title: "YouTube Title Generator", description: "Generate YouTube titles", category: "Social", keywords: ["youtube", "title", "generator", "generate"] },
  { slug: "hashtag-generator", title: "Hashtag Generator", description: "Generate hashtags", category: "Social", keywords: ["hashtag", "generator", "social media", "generate"] },
  { slug: "hashtag-counter", title: "Hashtag Counter", description: "Count hashtags", category: "Social", keywords: ["hashtag", "counter", "count", "social media"] },

  // AI & Content Tools
  { slug: "ai-email-subject-line", title: "AI Email Subject Line", description: "Generate email subject lines", category: "AI", keywords: ["ai", "email", "subject", "line", "generator"] },
  { slug: "ai-resume-bullet", title: "AI Resume Bullet", description: "Generate resume bullet points", category: "AI", keywords: ["ai", "resume", "bullet", "points", "generator"] },
  { slug: "acceptance-criteria-generator", title: "Acceptance Criteria Generator", description: "Generate acceptance criteria", category: "Generator", keywords: ["acceptance", "criteria", "generator", "agile", "user story"] },

  // Regex & Code Tools
  { slug: "regex-tester", title: "Regex Tester", description: "Test regular expressions", category: "Developer", keywords: ["regex", "regular expression", "test", "pattern", "match"] },
  { slug: "regex-generator", title: "Regex Generator", description: "Generate regex patterns", category: "Developer", keywords: ["regex", "regular expression", "generator", "pattern", "generate"] },
  { slug: "jwt-decoder", title: "JWT Decoder", description: "Decode JWT tokens", category: "Developer", keywords: ["jwt", "token", "decoder", "decode", "auth"] },
  { slug: "base64-encoder-decoder", title: "Base64 Encoder/Decoder", description: "Encode/decode Base64", category: "Developer", keywords: ["base64", "encoder", "decoder", "encode", "decode"] },

  // SQL & Database
  { slug: "sql-formatter", title: "SQL Formatter", description: "Format SQL queries", category: "Developer", keywords: ["sql", "formatter", "format", "query", "database"] },
  { slug: "sql-query-generator", title: "SQL Query Generator", description: "Generate SQL queries", category: "Developer", keywords: ["sql", "query", "generator", "generate", "database"] },

  // URL & Web Tools
  { slug: "url-encoder-decoder", title: "URL Encoder/Decoder", description: "Encode/decode URLs", category: "Developer", keywords: ["url", "encoder", "decoder", "encode", "decode", "uri"] },
  { slug: "utm-builder", title: "UTM Builder", description: "Build UTM parameters", category: "Marketing", keywords: ["utm", "builder", "tracking", "analytics", "campaign"] },
  { slug: "slug-generator", title: "Slug Generator", description: "Generate URL slugs", category: "Developer", keywords: ["slug", "generator", "url", "seo", "generate"] },

  // Misc Tools
  { slug: "emoji-copy-tool", title: "Emoji Copy Tool", description: "Copy emojis easily", category: "Tools", keywords: ["emoji", "copy", "emoticon", "symbol"] },
  { slug: "color-converter", title: "Color Converter", description: "Convert color formats", category: "Tools", keywords: ["color", "converter", "hex", "rgb", "hsl", "convert"] },
  { slug: "palette-generator", title: "Palette Generator", description: "Generate color palettes", category: "Tools", keywords: ["palette", "generator", "color", "scheme", "generate"] },
];
