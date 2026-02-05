import { IsOptional, IsString, IsEnum } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Language } from 'prisma/generated/prisma/enums';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+123456789', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ enum: Language, default: Language.English, required: false })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Profile picture file' })
  @IsOptional()
  profile?: any;
}