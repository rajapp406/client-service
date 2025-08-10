const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function checkQuestionsByDifficulty() {
  console.log('🔍 Analyzing Questions by Difficulty\n');

  try {
    // Get overall stats
    const totalQuestions = await prisma.quizQuestion.count();
    console.log(`📊 Total Questions: ${totalQuestions}\n`);

    if (totalQuestions === 0) {
      console.log('❌ No questions found in database.');
      console.log('💡 You may need to seed questions first.\n');
      return;
    }

    // Get detailed breakdown by difficulty
    console.log('📋 Breakdown by Difficulty:');
    console.log('=' .repeat(40));

    const difficulties = ['EASY', 'MEDIUM', 'HARD'];
    
    for (const difficulty of difficulties) {
      const count = await prisma.quizQuestion.count({
        where: { difficulty }
      });
      
      const percentage = totalQuestions > 0 ? ((count / totalQuestions) * 100).toFixed(1) : '0.0';
      console.log(`${difficulty.padEnd(8)}: ${count.toString().padStart(3)} questions (${percentage}%)`);
    }

    // Get sample questions for each difficulty
    console.log('\n📝 Sample Questions:');
    console.log('=' .repeat(40));

    for (const difficulty of difficulties) {
      console.log(`\n🎯 ${difficulty} Questions:`);
      
      const sampleQuestions = await prisma.quizQuestion.findMany({
        where: { difficulty },
        take: 3,
        include: {
          subject: true,
          chapter: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (sampleQuestions.length === 0) {
        console.log('   ❌ No questions found');
        continue;
      }

      sampleQuestions.forEach((question, index) => {
        const questionPreview = question.questionText.length > 60 
          ? question.questionText.substring(0, 60) + '...'
          : question.questionText;
        
        console.log(`   ${index + 1}. ${questionPreview}`);
        console.log(`      Subject: ${question.subject.name} | Grade: ${question.grade} | Board: ${question.board}`);
        if (question.chapter) {
          console.log(`      Chapter: ${question.chapter.title}`);
        }
      });
    }

    // Get distribution by grade and board
    console.log('\n📊 Distribution by Grade:');
    console.log('=' .repeat(30));
    
    const gradeStats = await prisma.quizQuestion.groupBy({
      by: ['grade'],
      _count: { grade: true },
      orderBy: { grade: 'asc' }
    });

    gradeStats.forEach(stat => {
      console.log(`Grade ${stat.grade}: ${stat._count.grade} questions`);
    });

    console.log('\n📚 Distribution by Board:');
    console.log('=' .repeat(30));
    
    const boardStats = await prisma.quizQuestion.groupBy({
      by: ['board'],
      _count: { board: true },
      orderBy: { board: 'asc' }
    });

    boardStats.forEach(stat => {
      console.log(`${stat.board}: ${stat._count.board} questions`);
    });

    // Check if we have enough questions for quiz creation
    console.log('\n✅ Quiz Creation Readiness:');
    console.log('=' .repeat(35));
    
    const easyCount = await prisma.quizQuestion.count({ where: { difficulty: 'EASY' } });
    const mediumCount = await prisma.quizQuestion.count({ where: { difficulty: 'MEDIUM' } });
    const hardCount = await prisma.quizQuestion.count({ where: { difficulty: 'HARD' } });

    const recommendations = [
      { difficulty: 'EASY', available: easyCount, needed: 10 },
      { difficulty: 'MEDIUM', available: mediumCount, needed: 8 },
      { difficulty: 'HARD', available: hardCount, needed: 6 }
    ];

    recommendations.forEach(rec => {
      const status = rec.available >= rec.needed ? '✅' : '⚠️';
      const message = rec.available >= rec.needed 
        ? `Ready (${rec.available}/${rec.needed})`
        : `Need more (${rec.available}/${rec.needed})`;
      
      console.log(`${status} ${rec.difficulty} Quiz: ${message}`);
    });

    const canCreateAll = recommendations.every(rec => rec.available >= rec.needed);
    
    if (canCreateAll) {
      console.log('\n🎉 Ready to create all difficulty-based quizzes!');
      console.log('💡 Run: node scripts/create-difficulty-based-quizzes.js');
    } else {
      console.log('\n⚠️ Some quizzes may have fewer questions than planned.');
      console.log('💡 The script will adapt and create quizzes with available questions.');
    }

  } catch (error) {
    console.error('❌ Error analyzing questions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  checkQuestionsByDifficulty()
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkQuestionsByDifficulty };