import { IsNotEmpty, IsString, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SafetyStatus {
    SAFE = 'safe',
    UNSAFE = 'unsafe',
}

export class SendEmailDto {
    @ApiProperty({ description: 'IDs of the emergency contacts', isArray: true })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    contactIds: string[];

    @ApiProperty({ description: 'Safety status', enum: SafetyStatus })
    @IsNotEmpty()
    @IsEnum(SafetyStatus)
    status: SafetyStatus;

    @ApiProperty({ description: 'Optional message to include in the email' })
    @IsString()
    message?: string;
}
