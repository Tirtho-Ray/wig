import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from '../dto/user.update.dto';
import { UpdatePasswordDto } from '../dto/update.password.dto';
import { SecurityUtil } from 'src/modules/auth/utils/security.util';
import { SafetyStatus, SendEmailDto } from '../dto/send-email.dto';
import { EmailService } from 'src/lib/email/email.service';


interface EmailSendResult {
    contactId: string;
    name: string;
    status: 'success' | 'failed';
    reason?: string;
}

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService, private readonly emailService: EmailService) { }

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

    async updatePassword(userId: string, dto: UpdatePasswordDto, currentDeviceJti?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const isPasswordValid = await SecurityUtil.compareData(dto.currentPassword, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Current password is incorrect');

        const hashedPassword = await SecurityUtil.hashData(dto.newPassword);

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
                ...(currentDeviceJti && { jti: { not: currentDeviceJti } }),
            },
        });

        return { message: 'Password updated successfully. All other devices logged out.' };
    }



    async getAllUsers() {
        return await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                role: true,
                status: true,
                profile: true,
                createdAt: true,
            },
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getOverviewStats() {
        const totalUsers = await this.prisma.user.count({ where: { deletedAt: null } });
        const totalDocuments = await this.prisma.document.count();
        const totalContacts = await this.prisma.emContact.count();

        return {
            totalUsers,
            totalDocuments,
            totalContacts,
        };
    }





    async sendEmailToContacts(userId: string, dto: SendEmailDto): Promise<{ message: string, results: EmailSendResult[] }> {
        const contacts = await this.prisma.emContact.findMany({
            where: { id: { in: dto.contactIds }, userId },
        });

        if (!contacts.length) throw new NotFoundException('No valid contacts found');

        const results: EmailSendResult[] = [];

        for (const contact of contacts) {
            if (!contact.email) {
                results.push({
                    contactId: contact.id,
                    name: contact.name,
                    status: 'failed',
                    reason: 'Email not found',
                });
                continue;
            }

            let html = '';
            if (dto.status === SafetyStatus.SAFE) {
                html = `<h3>Hello ${contact.name}</h3>
                <p>${dto.message || 'I am safe.'}</p>
                <p>Regards,</p><p>Your App</p>`;
            } else {
                html = `<h3>Hello ${contact.name}</h3>
                <p>${dto.message || 'I am unsafe. Please take action!'}</p>
                <p>Regards,</p><p>Your App</p>`;
            }

            try {
                await this.emailService.sendEmail(contact.email, 'Emergency Status Update', html);
                results.push({ contactId: contact.id, name: contact.name, status: 'success' });
            } catch (error) {
                results.push({ contactId: contact.id, name: contact.name, status: 'failed', reason: 'Email sending failed' });
            }
        }

        return { message: 'Email sending process completed', results };
    }
}






