import { Difficulty, QuestionType } from '../../../../generated/prisma';

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export class Question {
  id: string;
  subjectId: string;
  chapterId?: string | null;
  questionText: string;
  options: QuestionOption[];
  explanation?: string | null;
  difficulty: Difficulty;
  questionType: QuestionType;
  marks: number;
  isActive: boolean;
  board: string;
  grade: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Question>) {
    Object.assign(this, partial);
  }

  static fromPrisma(prismaQuestion: any): Question {
    return new Question({
      id: prismaQuestion.id,
      subjectId: prismaQuestion.subjectId,
      chapterId: prismaQuestion.chapterId,
      questionText: prismaQuestion.questionText,
      options: prismaQuestion.options,
      explanation: prismaQuestion.explanation,
      difficulty: prismaQuestion.difficulty,
      questionType: prismaQuestion.questionType,
      marks: prismaQuestion.marks,
      isActive: prismaQuestion.isActive,
      board: prismaQuestion.board,
      grade: prismaQuestion.grade,
      createdAt: prismaQuestion.createdAt,
      updatedAt: prismaQuestion.updatedAt,
    });
  }

  toPrisma() {
    return {
      subjectId: this.subjectId,
      chapterId: this.chapterId,
      questionText: this.questionText,
      options: this.options,
      explanation: this.explanation,
      difficulty: this.difficulty,
      questionType: this.questionType,
      marks: this.marks,
      isActive: this.isActive,
      board: this.board,
      grade: this.grade,
    };
  }
}
