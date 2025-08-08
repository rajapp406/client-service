import { PartialType } from '@nestjs/swagger';
import { CreateChapterDto } from './create-chapter.dto';

export class UpdateChapterDto extends PartialType(CreateChapterDto) {
  // We can add any chapter-specific update fields here if needed
}
