import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from '../dto/user.update.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                faceBiometric: true,
                emergencyContact: true,
                document: true,
            }
        });

        if (!user) {
            throw new Error('User not found');
        }
        const { password, ...result } = user;
        return result;
    }
    async updateMe(userId: string, data: UpdateUserDto, profilePath?: string) {
        return await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                mobile: data.mobile,
                language: data.language,
                ...(profilePath && { profile: profilePath }),
            },
            select: {
                id: true,
                name: true,
                profile: true,
                mobile: true,
                language: true,
            }
        });
    }
}