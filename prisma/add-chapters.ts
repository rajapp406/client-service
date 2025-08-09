import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const subjectId = 'f9215d29-cbd9-48a0-9691-4d7a50b226ac';
const chapterTitles = [
  'Patterns in Mathematics',
  'Lines and Angles',
  'Number Play',
  'Data Handling and Presentation',
  'Prime Time',
  'Perimeter and Area',
  'Fractions',
  'Playing with Constructions',
  'Symmetry',
  'The Other Side of Zero',
];

async function main() {
  console.log('Adding chapters for subject:', subjectId);

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    throw new Error(`Subject not found: ${subjectId}`);
  }

  let created = 0;
  for (let i = 0; i < chapterTitles.length; i++) {
    const title = chapterTitles[i];

    const existing = await prisma.chapter.findFirst({
      where: { subjectId, title },
      select: { id: true },
    });

    if (existing) {
      console.log(`Skipping existing chapter: ${title}`);
      continue;
    }

    await prisma.chapter.create({
      data: {
        subject: { connect: { id: subjectId } },
        title,
        chapterNumber: i + 1,
      },
    });
    created++;
    console.log(`Created chapter #${i + 1}: ${title}`);
  }

  console.log(`Done. Chapters created: ${created}, skipped: ${chapterTitles.length - created}`);
}

main()
  .catch((e) => {
    console.error('Error adding chapters:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 