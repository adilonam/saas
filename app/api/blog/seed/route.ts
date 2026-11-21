import { NextRequest, NextResponse } from "next/server";
import prisma from "lib/prisma";

const ADMIN_SECRET = process.env.BLOG_ADMIN_SECRET || "change-this-in-production";

interface SeedPost {
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string;
  content: string;
  coverImage?: string;
  relatedTools?: string;
  category?: string;
  publishedAt?: Date;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");

    if (providedSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { posts } = body as { posts: SeedPost[] };

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: posts array required" },
        { status: 400 }
      );
    }

    const results = [];

    for (const post of posts) {
      const existing = await prisma.blogPost.findUnique({
        where: { slug: post.slug },
      });

      if (existing) {
        const updated = await prisma.blogPost.update({
          where: { slug: post.slug },
          data: {
            title: post.title,
            metaDescription: post.metaDescription,
            keywords: post.keywords,
            content: post.content,
            coverImage: post.coverImage,
            relatedTools: post.relatedTools,
            category: post.category,
            publishedAt: post.publishedAt || new Date(),
            status: "PUBLISHED",
          },
        });
        results.push({ action: "updated", slug: post.slug, id: updated.id });
      } else {
        const created = await prisma.blogPost.create({
          data: {
            slug: post.slug,
            title: post.title,
            metaDescription: post.metaDescription,
            keywords: post.keywords,
            content: post.content,
            coverImage: post.coverImage,
            relatedTools: post.relatedTools,
            category: post.category,
            publishedAt: post.publishedAt || new Date(),
            status: "PUBLISHED",
          },
        });
        results.push({ action: "created", slug: post.slug, id: created.id });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} post(s)`,
      results,
    });
  } catch (error) {
    console.error("Blog seed error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
