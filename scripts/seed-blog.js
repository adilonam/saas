const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function seedBlogPosts() {
  try {
    console.log('Starting blog post seeding...');
    
    const seedDataPath = path.join(__dirname, 'seed-blog-posts.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    
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
        console.error(`✗ Error processing ${post.slug}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\nSeeding complete:`);
    console.log(`  Created: ${created}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Total: ${seedData.posts.length}`);
    
  } catch (error) {
    console.error('Error seeding blog posts:', error);
    // Don't fail the build if seeding fails
    console.log('Continuing despite seeding errors...');
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedBlogPosts();
}

module.exports = { seedBlogPosts };
