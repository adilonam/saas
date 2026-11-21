# Blog Post Management Documentation

This document explains how to add, update, and manage blog posts on eProd.io.

## Overview

Blog posts are stored in a PostgreSQL database using Prisma ORM. The blog system includes:
- Database model (`BlogPost`)
- Public pages (`/blog` and `/blog/[slug]`)
- Protected admin API for seeding posts
- SEO optimization (JSON-LD, Open Graph, sitemap integration)
- Related tools CTA at bottom of each post

## Database Schema

```prisma
model BlogPost {
  id              String         @id @default(cuid())
  slug            String         @unique
  title           String
  metaDescription String?
  keywords        String?        // comma-separated keywords
  content         String         @db.Text // markdown/MDX content
  coverImage      String?        // optional cover image URL
  relatedTools    String?        // comma-separated tool slugs
  category        String?        // optional category/tag
  status          BlogPostStatus @default(DRAFT)
  publishedAt     DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

enum BlogPostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## Adding Blog Posts

### Method 1: API Endpoint (Recommended for Automation)

#### Endpoint

```
POST /api/blog/seed
Authorization: Bearer YOUR_BLOG_ADMIN_SECRET
Content-Type: application/json
```

#### Authentication

Set the `BLOG_ADMIN_SECRET` environment variable:

```bash
# In .env or Vercel environment variables
BLOG_ADMIN_SECRET="your-secure-secret-key-here"
```

**Default in development**: `change-this-in-production` (CHANGE THIS!)

#### Request Format

```json
{
  "posts": [
    {
      "slug": "url-friendly-slug",
      "title": "Your Blog Post Title",
      "metaDescription": "SEO-friendly description (150-160 chars)",
      "keywords": "keyword1, keyword2, keyword3",
      "content": "# Markdown content here\n\nFull article in markdown format...",
      "coverImage": "https://example.com/image.jpg",
      "relatedTools": "tool-slug-1,tool-slug-2",
      "category": "Category Name",
      "publishedAt": "2026-11-21T00:00:00Z"
    }
  ]
}
```

#### Field Descriptions

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `slug` | ✅ Yes | string | URL-safe identifier (lowercase, hyphens) |
| `title` | ✅ Yes | string | Post title (appears in h1, meta title) |
| `metaDescription` | ✅ Yes | string | SEO description (150-160 characters) |
| `keywords` | ✅ Yes | string | Comma-separated keywords for SEO |
| `content` | ✅ Yes | string | Full article in Markdown format |
| `coverImage` | ❌ No | string | URL to cover image |
| `relatedTools` | ❌ No | string | Comma-separated tool slugs for CTA |
| `category` | ❌ No | string | Category/tag for filtering |
| `publishedAt` | ❌ No | ISO date | Publish date (defaults to now) |

#### Example: Adding Single Post

```bash
curl -X POST https://www.eprod.io/api/blog/seed \
  -H "Authorization: Bearer your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "posts": [{
      "slug": "how-to-merge-pdfs",
      "title": "How to Merge PDF Files: Complete Guide",
      "metaDescription": "Learn how to combine multiple PDF files into one document. Free methods for desktop, mobile, and online.",
      "keywords": "merge pdf, combine pdf, pdf merger, how to merge pdfs",
      "content": "# How to Merge PDF Files\n\nMerging PDFs is simple...",
      "relatedTools": "merge-pdf,sign-pdf",
      "category": "PDF Tools"
    }]
  }'
```

#### Example: Bulk Import from JSON File

```bash
curl -X POST https://www.eprod.io/api/blog/seed \
  -H "Authorization: Bearer your-admin-secret" \
  -H "Content-Type: application/json" \
  -d @scripts/seed-blog-posts.json
```

#### Response

**Success (200)**:
```json
{
  "success": true,
  "message": "Processed 3 post(s)",
  "results": [
    { "action": "created", "slug": "post-1", "id": "abc123" },
    { "action": "updated", "slug": "post-2", "id": "def456" },
    { "action": "created", "slug": "post-3", "id": "ghi789" }
  ]
}
```

**Error (401)**: Unauthorized
```json
{ "error": "Unauthorized" }
```

**Error (400)**: Bad request
```json
{ "error": "Invalid request: posts array required" }
```

### Method 2: Direct Database (For One-Offs)

Use Prisma Studio or SQL:

```typescript
// Using Prisma Client
import { prisma } from 'lib/prisma'

await prisma.blogPost.create({
  data: {
    slug: 'my-post',
    title: 'My Post Title',
    metaDescription: 'Description here',
    keywords: 'keyword1, keyword2',
    content: '# Markdown content',
    status: 'PUBLISHED',
    publishedAt: new Date(),
  },
})
```

## Related Tools Configuration

The `relatedTools` field shows a CTA at the bottom of each blog post.

### Available Tool Slugs

Configure tools in `lib/blog-utils.ts` in the `TOOL_MAP` object:

```typescript
const TOOL_MAP: Record<string, RelatedTool> = {
  "youtube-title-length-checker": {
    slug: "youtube-title-length-checker",
    title: "YouTube Title Length Checker",
    description: "Check if your YouTube title fits within the optimal character limit"
  },
  // Add more tools here
}
```

### Adding New Tool to Map

1. Open `lib/blog-utils.ts`
2. Add entry to `TOOL_MAP`:
```typescript
"your-tool-slug": {
  slug: "your-tool-slug",
  title: "Tool Display Name",
  description: "Brief description for CTA"
}
```
3. Commit and deploy

### Using in Posts

In your post's `relatedTools` field:
```
"relatedTools": "tool-slug-1,tool-slug-2,tool-slug-3"
```

Multiple tools are shown as cards at bottom of article.

## Content Guidelines

### Markdown Format

Blog content supports full Markdown with GitHub Flavored Markdown (GFM):

```markdown
# Main Heading (H1)

## Section Heading (H2)

### Subsection (H3)

**Bold text**
*Italic text*

- Bullet list
- Item 2

1. Numbered list
2. Item 2

[Link text](https://example.com)

![Image alt text](https://example.com/image.jpg)

> Blockquote

`inline code`

\`\`\`javascript
// Code block
function example() {
  return true;
}
\`\`\`

| Table | Header |
|-------|--------|
| Cell  | Cell   |
```

### SEO Best Practices

1. **Title** (50-60 characters)
   - Include primary keyword
   - Clear value proposition
   - No clickbait

2. **Meta Description** (150-160 characters)
   - Summarize article
   - Include CTA
   - Primary keyword near start

3. **Keywords** (5-10 keywords)
   - Primary keyword
   - 2-3 secondary keywords
   - Long-tail variations
   - Separate with commas

4. **Content**
   - Use headings (H2, H3)
   - 1500+ words for depth
   - Include examples
   - Link to related tools
   - Add lists and tables
   - Use short paragraphs (2-3 sentences)

5. **URL Slug**
   - Lowercase only
   - Hyphens not underscores
   - Include primary keyword
   - Keep under 5 words
   - Examples: `merge-pdf-guide`, `youtube-title-length`

### Content Quality

✅ **Do**:
- Write original content
- Include practical examples
- Link to related tools
- Use clear headings
- Add actionable tips
- Cite sources when needed
- Include visuals (via markdown images)

❌ **Don't**:
- Copy content from other sites
- Make up statistics
- Quote fake studies
- Use clickbait titles
- Keyword stuff
- Write generic fluff

## Updating Posts

### Update via API

Same endpoint, same slug → updates existing post:

```bash
curl -X POST https://www.eprod.io/api/blog/seed \
  -H "Authorization: Bearer your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "posts": [{
      "slug": "existing-post-slug",
      "title": "Updated Title",
      "content": "Updated content..."
    }]
  }'
```

### Update via Database

```typescript
await prisma.blogPost.update({
  where: { slug: 'post-slug' },
  data: {
    title: 'New Title',
    content: 'Updated content',
    updatedAt: new Date(),
  },
})
```

## Unpublishing Posts

### Set to DRAFT

```typescript
await prisma.blogPost.update({
  where: { slug: 'post-slug' },
  data: { status: 'DRAFT' },
})
```

Draft posts:
- Not visible on `/blog` index
- Not accessible at `/blog/[slug]`
- Not in sitemap
- Not in search results

### Archive

```typescript
await prisma.blogPost.update({
  where: { slug: 'post-slug' },
  data: { status: 'ARCHIVED' },
})
```

### Delete

```typescript
await prisma.blogPost.delete({
  where: { slug: 'post-slug' },
})
```

**Note**: Deleting removes post permanently. Consider DRAFT or ARCHIVED instead.

## SEO Integration

Blog posts are automatically integrated with:

### 1. Sitemap (sitemap.xml)

All published posts added automatically:
```xml
<url>
  <loc>https://www.eprod.io/blog/post-slug</loc>
  <lastmod>2026-11-21</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

Sitemap regenerates every hour (revalidate: 3600).

### 2. JSON-LD Schema

Each post includes:
- **BlogPosting** schema
- **BreadcrumbList** schema

### 3. Open Graph Tags

Automatic OG tags:
- og:title
- og:description
- og:url
- og:type (article)
- og:image (if coverImage provided)
- article:published_time

### 4. Twitter Cards

- twitter:card (summary_large_image)
- twitter:title
- twitter:description
- twitter:image

### 5. Canonical URLs

All posts have canonical URLs:
```html
<link rel="canonical" href="https://www.eprod.io/blog/post-slug" />
```

### 6. llms.txt

Blog section added to llms.txt for AI search engines.

## Monitoring & Analytics

### Page Views

Track with existing analytics:
- Google Analytics (if configured)
- Meta Pixel (if configured)
- TikTok Pixel (if configured)

### SEO Performance

Monitor in Google Search Console:
- Impressions
- Clicks
- CTR
- Position
- Top queries

### Engagement

Track:
- Time on page
- Bounce rate
- Related tool clicks
- Newsletter signups (if added)

## Deployment

### Adding Posts to Production

1. **Prepare content** in JSON format
2. **Test locally** (optional):
   ```bash
   curl -X POST http://localhost:3000/api/blog/seed \
     -H "Authorization: Bearer your-secret" \
     -d @your-posts.json
   ```
3. **Deploy to production**:
   ```bash
   curl -X POST https://www.eprod.io/api/blog/seed \
     -H "Authorization: Bearer $BLOG_ADMIN_SECRET" \
     -d @your-posts.json
   ```
4. **Verify**:
   - Check https://www.eprod.io/blog
   - Check individual post URLs
   - Verify sitemap: https://www.eprod.io/sitemap.xml
   - Check Google Search Console (submit sitemap if first time)

### Environment Variables

Required in production:
```
BLOG_ADMIN_SECRET=your-production-secret
```

Set in Vercel dashboard:
1. Go to project settings
2. Environment Variables
3. Add `BLOG_ADMIN_SECRET`
4. Scope: Production, Preview, Development (as needed)

## Automation Ideas

### Daily Blog Post (Hypothetical Workflow)

1. **Content creation**:
   - Write in Google Docs
   - Export to Markdown
   - Add to JSON file

2. **Automated posting**:
   ```bash
   # GitHub Action or cron job
   curl -X POST https://www.eprod.io/api/blog/seed \
     -H "Authorization: Bearer $BLOG_ADMIN_SECRET" \
     -d @daily-post.json
   ```

3. **Social sharing**:
   - Auto-tweet new posts
   - Share to LinkedIn
   - Add to newsletter

### Bulk Import

For migrating from another platform:

1. Export existing posts
2. Convert to JSON format
3. Map fields to schema
4. Bulk import via API

Example converter script:
```typescript
// wordpress-to-eprod.ts
const posts = wordpressExport.map(wp => ({
  slug: wp.slug,
  title: wp.title,
  metaDescription: wp.excerpt.slice(0, 160),
  keywords: wp.tags.join(', '),
  content: wp.content,
  publishedAt: wp.date,
  category: wp.categories[0],
}))

await fetch('/api/blog/seed', {
  method: 'POST',
  headers: { Authorization: `Bearer ${secret}` },
  body: JSON.stringify({ posts }),
})
```

## Troubleshooting

### Post Not Showing on /blog

**Check**:
- Status is `PUBLISHED` (not DRAFT or ARCHIVED)
- publishedAt is in the past (not future)
- Slug is unique
- Wait for revalidation (up to 1 hour)

**Solution**: Force revalidation by redeploying or visiting the page.

### Related Tools Not Showing

**Check**:
- Tool slugs in `relatedTools` field match `TOOL_MAP` keys
- Slugs comma-separated (no spaces)
- Tools exist in `/app/(pages)/[tool-slug]/`

**Solution**: Add missing tools to `TOOL_MAP` in `lib/blog-utils.ts`.

### Images Not Loading

**Check**:
- Image URLs are absolute (https://)
- Images are publicly accessible
- Markdown syntax correct: `![alt](url)`

**Solution**: Use external image host (Cloudinary, Imgur, etc.) or add to `/public/images/blog/`.

### Sitemap Not Updating

**Check**:
- Posts are PUBLISHED status
- Wait for revalidation (3600 seconds = 1 hour)

**Solution**: Force regeneration by deploying or using ISR revalidation.

## Future Enhancements

Potential additions:
- Admin UI for post management
- Image upload/hosting
- Comments section
- Newsletter integration
- Reading time estimate
- Table of contents
- Social share buttons
- Related posts (auto-suggested)
- Author profiles (multi-author)
- Post series/collections
- Draft previews with unique URLs

## Support

For questions or issues:
- Check this documentation
- Review existing posts in database
- Test with a single post first
- Contact: via website contact form
