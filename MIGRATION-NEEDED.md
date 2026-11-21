# ⚠️ Database Migration Required

This PR adds blog functionality which requires a database migration.

## Required Steps After Merge

### 1. Run Migration

```bash
# Connect to production database and run:
npx prisma migrate deploy
```

Or via Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### 2. Set Environment Variable

Add to Vercel environment variables (Production):
```
BLOG_ADMIN_SECRET=your-secure-secret-here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. Seed Blog Posts

After migration, seed the initial blog posts:

```bash
curl -X POST https://www.eprod.io/api/blog/seed \
  -H "Authorization: Bearer YOUR_BLOG_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d @scripts/seed-blog-posts.json
```

This will create 8 SEO-optimized blog posts covering:
- YouTube title length guide
- How to sign PDFs
- Age calculation guide
- Merging PDF files
- AI writing tools
- Productivity tools overview
- Acceptance criteria guide

### 4. Verify

- Check https://www.eprod.io/blog
- Check sitemap: https://www.eprod.io/sitemap.xml
- Submit sitemap to Google Search Console

## Migration Details

The migration adds a new `BlogPost` table with:
- SEO fields (title, meta description, keywords)
- Markdown content
- Related tools integration
- Publishing workflow (DRAFT/PUBLISHED/ARCHIVED)

See `docs/blog.md` for full documentation on managing blog posts.
