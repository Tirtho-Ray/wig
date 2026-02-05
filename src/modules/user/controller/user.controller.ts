import { Body, Controller, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { RoleGuard } from 'src/core/jwt/roles.guard';
import { GetUser } from 'src/core/jwt/get-user.decorator';
import { UpdateUserDto } from '../dto/user.update.dto';
import { S3Service } from 'src/lib/file/service/s3.service';
import { MulterService } from 'src/lib/file/service/multer.service';
import { FileType } from 'src/lib/file/utils/file-type.enum';
import { UpdatePasswordDto } from '../dto/update.password.dto';
import { Roles } from 'src/core/jwt/roles.decorator';
import { UserRole } from 'prisma/generated/prisma/enums';
import { SendEmailDto } from '../dto/send-email.dto';
import { SendEmailResponseDto } from '../dto/send-email-response.dto';

@ApiTags('User Information')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly s3Service: S3Service,
        private readonly multerService: MulterService
    ) { }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('me')
    async getMe(@GetUser('id') userId: string) {
        const result = await this.userService.getMe(userId);
        return {
            message: "User data retrieved successfully",
            data: result
        };
    }

    @Patch('update-me')
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('profile', new MulterService().singleUpload(FileType.image)))
    async updateMe(
        @GetUser('id') userId: string,
        @Body() updateUserDto: UpdateUserDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        let profileUrl: string | undefined;

        try {
            if (file) {
                profileUrl = await this.s3Service.uploadSingle(file, 'profiles');
            }
            const result = await this.userService.updateMe(userId, updateUserDto, profileUrl);

            return {
                message: "Profile updated successfully",
                data: result
            };

        } catch (error) {
            if (profileUrl) {
                await this.s3Service.deleteFile(profileUrl);
            }
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.ADMIN)
    @Patch('update-password')
    @ApiOperation({ summary: 'Update user password & logout other devices' })
    @ApiBody({ type: UpdatePasswordDto })
    async updatePassword(
        @GetUser('id') userId: string,
        @GetUser('jti') jti: string,
        @Body() dto: UpdatePasswordDto
    ) {
        return await this.userService.updatePassword(userId, dto, jti);
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('all')
    @ApiOperation({ summary: 'Get all users' })
    async getAllUsers() {
        const users = await this.userService.getAllUsers();
        return { message: 'All users retrieved', data: users };
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.ADMIN)
    @Get('overview')
    @ApiOperation({ summary: 'Overview: total users, documents, contacts' })
    async getOverview() {
        const stats = await this.userService.getOverviewStats();
        return { message: 'Overview stats', data: stats };
    }

    @ApiTags('User Actions')
    @UseGuards(JwtAuthGuard)
    @Post('contact/send-email')
    @ApiOperation({ summary: 'Send email to one or multiple emergency contacts' })
    @ApiBody({ type: SendEmailDto })
    @ApiResponse({ type: SendEmailResponseDto })
    async sendEmailToContacts(
        @GetUser('id') userId: string,
        @Body() dto: SendEmailDto
    ): Promise<SendEmailResponseDto> {
        const data = await this.userService.sendEmailToContacts(userId, dto);
        return {
            message: data.message,
            results: data.results,
        };
    }
}