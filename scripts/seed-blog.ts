import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

interface BlogPostData {
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string;
  content: string;
  coverImage?: string;
  relatedTools?: string;
  category?: string;
  publishedAt?: string;
}

async function seedBlogPosts() {
  try {
    console.log('Starting blog post seeding...');
    
    const seedDataPath = path.join(__dirname, 'seed-blog-posts.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8')) as { posts: BlogPostData[] };
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const post of seedData.posts) {
      try {
        const existing = await prisma.blogPost.findUnique({
          where: { slug: post.slug },
        });
        
        if (existing) {
          // Update existing post
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
              status: 'PUBLISHED',
            },
          });
          updated++;
          console.log(`✓ Updated: ${post.slug}`);
        } else {
          // Create new post
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
              status: 'PUBLISHED',
            },
          });
          created++;
          console.log(`✓ Created: ${post.slug}`);
        }
      } catch (error) {
        console.error(`✗ Error processing ${post.slug}:`, error instanceof Error ? error.message : error);
        skipped++;
      }
    }
    
    console.log(`\nSeeding complete:`);
    console.log(`  Created: ${created}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Total: ${seedData.posts.length}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ FATAL: Error seeding blog posts:', error);
    await prisma.$disconnect();
    process.exit(1); // Fail loudly so build catches it
  }
}

// Run if called directly
seedBlogPosts().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
