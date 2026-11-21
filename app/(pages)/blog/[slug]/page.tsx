import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getPostBySlug,
  getAllPostSlugs,
  generateBlogPostMetadata,
  generateBlogPostJsonLd,
  generateBreadcrumbJsonLd,
  parseRelatedTools,
} from "lib/blog-utils";
import ResponsiveDashboardLayout from "components/ResponsiveDashboardLayout";
import { CalendarIcon, TagIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return generateBlogPostMetadata(post);
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedTools = parseRelatedTools(post.relatedTools);
  const articleJsonLd = generateBlogPostJsonLd(post);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(post);

  return (
    <ResponsiveDashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{post.title}</span>
        </nav>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {post.title}
          </h1>
          {post.metaDescription && (
            <p className="text-lg text-muted-foreground mb-4">
              {post.metaDescription}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <time dateTime={post.publishedAt.toISOString()}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            )}
            {post.category && (
              <div className="flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                <span>{post.category}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Related Tools CTA */}
        {relatedTools.length > 0 && (
          <div className="border-t pt-12">
            <h2 className="text-2xl font-bold mb-6">Try These Free Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/${tool.slug}`}
                  className="group border rounded-lg p-6 hover:shadow-lg hover:border-primary transition-all duration-200 hover:scale-[1.02] bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <ArrowRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  {tool.description && (
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Try it free
                    <ArrowRightIcon className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            ← Back to all articles
          </Link>
        </div>
      </article>
    </ResponsiveDashboardLayout>
  );
}
