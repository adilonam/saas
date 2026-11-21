import { NextResponse } from "next/server";
import prisma from "lib/prisma";
import seedData from "scripts/seed-blog-posts.json";

// Auto-seed endpoint - no auth required, idempotent
export async function POST() {
  try {
    const results = [];
    
    for (const post of seedData.posts) {
      try {
        const existing = await prisma.blogPost.findUnique({
          where: { slug: post.slug },
        });
        
        if (existing) {
          await prisma.blogPost.update({
            where: { slug: post.slug },
            data: {
              title: post.title,
              metaDescription: post.metaDescription,
              keywords: post.keywords,
              content: post.content,
              coverImage: post.coverImage || null,
              relatedTools: post.relatedTools || null,
              category: post.category || null,
              publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
              status: "PUBLISHED",
            },
          });
          results.push({ action: "updated", slug: post.slug });
        } else {
          await prisma.blogPost.create({
            data: {
              slug: post.slug,
              title: post.title,
              metaDescription: post.metaDescription,
              keywords: post.keywords,
              content: post.content,
              coverImage: post.coverImage || null,
              relatedTools: post.relatedTools || null,
              category: post.category || null,
              publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
              status: "PUBLISHED",
            },
          });
          results.push({ action: "created", slug: post.slug });
        }
      } catch (error: any) {
        results.push({ action: "error", slug: post.slug, error: error.message });
      }
    }
    
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Also allow GET for easy browser testing
export async function GET() {
  return POST();
}
