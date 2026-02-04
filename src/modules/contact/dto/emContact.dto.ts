import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateEmContactDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Brother' })
    @IsString()
    relationship: string;

    @ApiProperty({ example: '+8801700000000' })
    @IsString()
    @IsOptional()
    phoneNumber: string;
}

export class UpdateEmContactDto extends PartialType(CreateEmContactDto) {}