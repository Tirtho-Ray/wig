import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Aadhar Card' })
  @IsString()
  label: string;

  @ApiProperty({ example: '1234-5678-9012' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ example: 'IDENTITY' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: ['https://image1.jpg', 'https://image2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  documentPhoto: string[];

  @ApiProperty({ example: 'user_ulid_here' })
  @IsString()
  userId: string;
}
