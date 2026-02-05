import { Body, Controller, Get, Patch, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { RoleGuard } from 'src/core/jwt/roles.guard';
import { GetUser } from 'src/core/jwt/get-user.decorator';
import { UpdateUserDto } from '../dto/user.update.dto';
import { S3Service } from 'src/lib/file/service/s3.service';
import { MulterService } from 'src/lib/file/service/multer.service';
import { FileType } from 'src/lib/file/utils/file-type.enum';

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
}