import { PrismaClient, Prisma } from '../generated/prisma';

const prisma = new PrismaClient();
const FALLBACK_SUBJECT_ID = 'f9215d29-cbd9-48a0-9691-4d7a50b226ac';
const FALLBACK_CHAPTER_TITLE = 'Patterns in Mathematics';
const FALLBACK_CHAPTER_ID = '2680ef06-eafb-43b8-91f1-16020a20e217';
type InputQuestion = {
  questionType: 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK';
  questionText: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: Array<{ text: string; isCorrect: boolean; explanation?: string }>;
  explanation?: string;
  subjectId: string;
  chapterId?: string;
  grade?: number;
  board?: 'CBSE' | 'ICSE' | 'IB' | 'STATE' | 'CAMBRIDGE';
  tags?: string[];
};

const INPUT: InputQuestion[] = [
  {
    questionType: 'MCQ',
    questionText: 'Which of the following number sequences consists only of square numbers?',
    difficulty: 'MEDIUM',
    options: [
      {
        text: '1, 4, 9, 16, 25',
        isCorrect: true,
        explanation: 'These numbers are perfect squares of whole numbers: 1², 2², 3², 4², and 5².'
      },
      {
        text: '1, 3, 6, 10, 15',
        isCorrect: false,
        explanation: 'These are triangular numbers, not square numbers.'
      },
      { text: '2, 4, 6, 8, 10', isCorrect: false, explanation: 'These are even numbers.' },
      { text: '1, 8, 27, 64, 125', isCorrect: false, explanation: 'These are cube numbers.' }
    ],
    explanation: 'Square numbers are formed by multiplying a number by itself. Example: 6² = 36.',
    subjectId: FALLBACK_SUBJECT_ID,
    chapterId: FALLBACK_CHAPTER_ID,
    grade: 0,
    board: 'CBSE',
    tags: ['square-numbers', 'number-patterns']
  },
  {
    questionType: 'MCQ',
    questionText: 'What is the sum of the first 5 odd numbers: 1 + 3 + 5 + 7 + 9?',
    difficulty: 'MEDIUM',
    options: [
      { text: '25', isCorrect: true, explanation: 'The sum of the first n odd numbers is n². So 5² = 25.' },
      { text: '30', isCorrect: false, explanation: 'Incorrect. 30 is not the sum of the first 5 odd numbers.' },
      { text: '15', isCorrect: false, explanation: 'This is the sum of the first 5 natural numbers, not odd numbers.' },
      { text: '45', isCorrect: false, explanation: '45 is too large. It is not the sum of the first 5 odd numbers.' }
    ],
    explanation: '1 + 3 + 5 + 7 + 9 = 25, which is 5². This is a known number pattern.',
    subjectId: FALLBACK_SUBJECT_ID,
    chapterId: FALLBACK_CHAPTER_ID,
    grade: 0,
    board: 'CBSE',
    tags: ['odd-numbers', 'square-patterns']
  },
  {
    questionType: 'MCQ',
    questionText: 'What is the next number in the sequence: 1, 3, 6, 10, 15?',
    difficulty: 'MEDIUM',
    options: [
      { text: '21', isCorrect: true, explanation: 'These are triangular numbers. Next term is 15 + 6 = 21.' },
      { text: '22', isCorrect: false, explanation: '22 does not follow the triangular number pattern.' },
      { text: '24', isCorrect: false, explanation: 'Incorrect addition. The correct next term is 21.' },
      { text: '25', isCorrect: false, explanation: '25 is a square number, not the next triangular number.' }
    ],
    explanation: 'Triangular numbers follow the pattern of adding consecutive natural numbers: 1+2+3+4+5+6 = 21.',
    subjectId: FALLBACK_SUBJECT_ID,
    chapterId: FALLBACK_CHAPTER_ID,
    grade: 0,
    board: 'CBSE',
    tags: ['triangular-numbers', 'sequences']
  },
  {
    questionType: 'MCQ',
    questionText: 'What do we call the sequence 1, 2, 4, 8, 16, 32, ...?',
    difficulty: 'MEDIUM',
    options: [
      { text: 'Powers of 2', isCorrect: true, explanation: 'Each number is 2 raised to a power: 2⁰, 2¹, 2², etc.' },
      { text: 'Powers of 3', isCorrect: false, explanation: 'Powers of 3 are 1, 3, 9, 27, etc.' },
      { text: 'Even Numbers', isCorrect: false, explanation: 'Even numbers increase by 2, not multiply by 2.' },
      { text: 'Counting Numbers', isCorrect: false, explanation: 'Counting numbers are 1, 2, 3, 4, 5...' }
    ],
    explanation: 'Each number is obtained by multiplying the previous one by 2. Hence, they are Powers of 2.',
    subjectId: FALLBACK_SUBJECT_ID,
    chapterId: FALLBACK_CHAPTER_ID,
    grade: 0,
    board: 'CBSE',
    tags: ['powers-of-2', 'number-sequences']
  },
  {
    questionType: 'MCQ',
    questionText: 'Which number is both a square number and a triangular number?',
    difficulty: 'MEDIUM',
    options: [
      { text: '36', isCorrect: true, explanation: '36 is 6² and also the 8th triangular number (sum of first 8 natural numbers).' },
      { text: '25', isCorrect: false, explanation: '25 is a square number, but not a triangular number.' },
      { text: '28', isCorrect: false, explanation: '28 is a triangular number, not a square number.' },
      { text: '49', isCorrect: false, explanation: '49 is a square number but not triangular.' }
    ],
    explanation: '36 is unique in being both a perfect square and a triangular number, as shown in the chapter.',
    subjectId: FALLBACK_SUBJECT_ID,
    chapterId: FALLBACK_CHAPTER_ID,
    grade: 0,
    board: 'CBSE',
    tags: ['triangular-numbers', 'square-numbers']
  },
];

async function resolveSubjectAndChapter(input: InputQuestion) {
  let subject = await prisma.subject.findUnique({ where: { id: input.subjectId } });
  let subjectId = input.subjectId;
  if (!subject) {
    console.warn(`Subject ${input.subjectId} not found. Falling back to ${FALLBACK_SUBJECT_ID}`);
    subjectId = FALLBACK_SUBJECT_ID;
    subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new Error(`Fallback subject ${FALLBACK_SUBJECT_ID} not found.`);
  }

  let chapterId = input.chapterId;
  if (chapterId) {
    const ch = await prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!ch) {
      console.warn(`Chapter ${chapterId} not found. Will try fallback by title.`);
      chapterId = undefined;
    }
  }

  if (!chapterId) {
    const fallbackChapter = await prisma.chapter.findFirst({
      where: { subjectId: subject.id, title: FALLBACK_CHAPTER_TITLE },
      select: { id: true },
    });
    if (fallbackChapter) {
      chapterId = fallbackChapter.id;
    } else {
      const firstChapter = await prisma.chapter.findFirst({
        where: { subjectId: subject.id },
        orderBy: { chapterNumber: 'asc' },
        select: { id: true },
      });
      if (!firstChapter) throw new Error(`No chapters found for subject ${subject.id}`);
      chapterId = firstChapter.id;
    }
  }

  return { subject, subjectId, chapterId };
}

async function main() {
  let created = 0;

  for (const q of INPUT) {
    const { subject, subjectId, chapterId } = await resolveSubjectAndChapter(q);

    const duplicate = await prisma.quizQuestion.findFirst({
      where: { questionText: q.questionText, subjectId: subjectId, chapterId: chapterId },
      select: { id: true },
    });
    if (duplicate) {
      console.log(`Skipping existing question: ${q.questionText}`);
      continue;
    }

    const data: Prisma.QuizQuestionCreateInput = {
      subject: { connect: { id: subjectId } },
      chapter: { connect: { id: chapterId } },
      grade: subject.grade,
      board: subject.board,
      questionType: q.questionType,
      questionText: q.questionText,
      options: q.options as any,
      explanation: q.explanation,
      difficulty: q.difficulty,
    } as any;

    await prisma.quizQuestion.create({ data });
    created++;
    console.log(`Created question: ${q.questionText} (subject ${subjectId}, chapter ${chapterId})`);
  }

  console.log(`Done. Questions created: ${created}, skipped: ${INPUT.length - created}`);
}

main()
  .catch((e) => {
    console.error('Error adding questions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 