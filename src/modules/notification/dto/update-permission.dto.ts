import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPermissionDto {
    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional()
    inApp?: boolean;

    @IsOptional() 
    @IsBoolean() 
    @ApiPropertyOptional() 
    email?: boolean;

    @IsOptional() 
    @IsBoolean() 
    @ApiPropertyOptional() 
    push?: boolean;

    @IsOptional() 
    @IsBoolean() 
    @ApiPropertyOptional() 
    deviceAlerts?: boolean;

    @IsOptional() 
    @IsBoolean() 
    @ApiPropertyOptional() 
    videoUpload?: boolean;

    @IsOptional() 
    @IsBoolean() 
    @ApiPropertyOptional() 
    scheduleUpdates?: boolean;

    @IsOptional() 
    @IsBoolean() 
    @ApiPropertyOptional() 
    systemAlerts?: boolean;
    
    @IsOptional() 
    @IsBoolean() 
    @ApiPropertyOptional() 
    promotions?: boolean;
}