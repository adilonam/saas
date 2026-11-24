import { Suspense } from "react";
import HomePage from "components/HomePage";
import { getPublishedPosts } from "lib/blog-utils";

export default async function Page() {
  const { posts } = await getPublishedPosts(1, 6);
  const guides = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    metaDescription: p.metaDescription,
    category: p.category,
  }));

  return (
    <Suspense fallback={null}>
      <HomePage guides={guides} />
    </Suspense>
  );
}
