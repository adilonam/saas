const fs = require('fs');
const path = require('path');

// Use dynamic import for ESM-only prisma client
let prisma;

async function getPrismaClient() {
  if (!prisma) {
    const { default: prismaModule } = await import('../lib/prisma.js');
    prisma = prismaModule;
  }
  return prisma;
}

async function seedBlogPosts() {
  const prismaClient = await getPrismaClient();
  
  try {
    console.log('Starting blog post seeding...');
    
    const seedDataPath = path.join(__dirname, 'seed-blog-posts.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const post of seedData.posts) {
      try {
        const existing = await prismaClient.blogPost.findUnique({
          where: { slug: post.slug },
        });
        
        if (existing) {
          // Update existing post
          await prismaClient.blogPost.update({
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
          await prismaClient.blogPost.create({
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
    console.error('❌ FATAL: Error seeding blog posts:', error);
    await prismaClient.$disconnect();
    process.exit(1); // Fail loudly so build catches it
  } finally {
    await prismaClient.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedBlogPosts().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { seedBlogPosts };
