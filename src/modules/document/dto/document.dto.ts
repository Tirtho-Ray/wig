import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
    @ApiProperty({ example: 'Passport' })
    @IsString()
    @IsNotEmpty()
    label: string;

    @ApiProperty({ example: 'P1234567' })
    @IsString()
    @IsNotEmpty()
    value: string;

    @ApiProperty({ example: 'Identity', required: false })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, required: false })
    @IsOptional()
    documentPhoto?: any;
}
