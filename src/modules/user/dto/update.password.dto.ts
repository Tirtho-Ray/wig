import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
    @ApiProperty({
        description: 'Current password of the user',
        minLength: 8,
        example: 'OldPass123!',
    })
    @IsNotEmpty({ message: 'Current password is required' })
    currentPassword: string;

    @ApiProperty({
        description: 'New password to update',
        minLength: 8,
        example: 'NewPass456!',
    })
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(8, { message: 'New password must be at least 8 characters' })
    newPassword: string;
}
