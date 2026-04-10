import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedPosts = [
  {
    name: 'Getting Started with TypeScript',
    description:
      'An introduction to TypeScript, covering type annotations, interfaces, and how to integrate it into an existing JavaScript project.',
  },
  {
    name: 'Domain-Driven Design Fundamentals',
    description:
      'Exploring core DDD concepts including bounded contexts, aggregates, entities, and value objects with practical examples.',
  },
  {
    name: 'Building REST APIs with Express',
    description:
      'A step-by-step guide to creating a production-ready REST API using Express.js, including middleware, error handling, and validation.',
  },
  {
    name: 'Prisma ORM Deep Dive',
    description:
      'Understanding Prisma schema design, migrations, relations, and advanced query patterns for PostgreSQL applications.',
  },
  {
    name: 'Testing Strategies for Node.js',
    description:
      'Best practices for unit testing, integration testing, and end-to-end testing in Node.js with Jest and Supertest.',
  },
];

async function main(): Promise<void> {
  console.log('Seeding database...');

  for (const post of seedPosts) {
    const result = await prisma.post.upsert({
      where: { name: post.name },
      update: { description: post.description },
      create: { name: post.name, description: post.description },
    });

    console.log(`Upserted post: "${result.name}" (id: ${result.id})`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
