import { NextResponse } from "next/server";
import prisma from "lib/prisma";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        title: true,
        metaDescription: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}
