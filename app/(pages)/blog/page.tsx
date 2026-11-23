import { Suspense } from "react";
import Link from "next/link";
import { getPublishedPosts } from "lib/blog-utils";
import UnifiedLayout from "components/UnifiedLayout";
import { CalendarIcon, TagIcon } from "@heroicons/react/24/outline";

export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  // Show enough posts that every published article appears on page 1 for crawlability
  const { posts, totalPages, totalPosts } = await getPublishedPosts(page, 24);

  return (
    <UnifiedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Productivity Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tips, guides, and insights to help you master productivity tools and get more done.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {totalPosts} {totalPosts === 1 ? "article" : "articles"}
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card"
                >
                  {post.coverImage && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.metaDescription && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.metaDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {post.publishedAt && (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <time dateTime={post.publishedAt.toISOString()}>
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        </div>
                      )}
                      {post.category && (
                        <div className="flex items-center gap-1">
                          <TagIcon className="w-4 h-4" />
                          <span>{post.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/blog?page=${page - 1}`}
                    className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    Previous
                  </Link>
                )}
                <div className="px-4 py-2 border rounded-md bg-muted">
                  Page {page} of {totalPages}
                </div>
                {page < totalPages && (
                  <Link
                    href={`/blog?page=${page + 1}`}
                    className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </UnifiedLayout>
  );
}
