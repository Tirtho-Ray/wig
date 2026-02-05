import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from '../dto/document.dto';
import { UpdateDocumentDto } from '../dto/updateDoc.dto';
import { NotificationResourceType, NotificationType } from 'prisma/generated/prisma/enums';
import { NotificationGateway } from 'src/modules/notification/gateway/notification.gateway';
import { S3Service } from 'src/lib/file/service/s3.service';

@Injectable()
export class DocumentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationGateway: NotificationGateway,
        private readonly s3Service: S3Service,
    ) { }


    async createDocument(dto: CreateDocumentDto, userId: string, photoUrls: string[]) {
        const document = await this.prisma.document.create({
            data: {
                label: dto.label,
                value: dto.value,
                category: dto.category,
                documentPhoto: photoUrls,
                userId: userId,
            },
        });
        await this.sendDocumentNotification(userId, document.label, 'uploaded');
        return document;
    }



    async getAllDocuments(userId: string) {
        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }


    async getDocumentById(id: string, userId: string) {
        const document = await this.prisma.document.findFirst({
            where: { id, userId },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        return document;
    }


    async updateDocument(id: string, dto: UpdateDocumentDto, userId: string, photoUrls?: string[]) {
        const existingDoc = await this.getDocumentById(id, userId);

        const updated = await this.prisma.document.update({
            where: { id },
            data: {
                ...dto,
                ...(photoUrls && { documentPhoto: photoUrls }),
            },
        });

        if (photoUrls && existingDoc.documentPhoto.length > 0) {
            await Promise.all(existingDoc.documentPhoto.map(url => this.s3Service.deleteFile(url)));
        }

        await this.sendDocumentNotification(userId, updated.label, 'updated');
        return updated;
    }

    
    async deleteDocument(id: string, userId: string) {
        const document = await this.prisma.document.findFirst({
            where: { id, userId },
        });
        if (!document) {
            throw new NotFoundException('Document not found');
        }

        await this.prisma.document.delete({
            where: { id },
        });
        if (document.documentPhoto && document.documentPhoto.length > 0) {
            try {
                await Promise.all(
                    document.documentPhoto.map((url) => this.s3Service.deleteFile(url))
                );
            } catch (error) {
                console.error(`[S3 Cleanup Error] Failed to delete photos for doc ${id}:`, error);
            }
        }

        await this.sendDocumentNotification(userId, document.label, 'deleted');
        return { success: true };
    }

    private async sendDocumentNotification(
        userId: string,
        label: string,
        action: 'uploaded' | 'updated' | 'deleted',
    ) {
        const pref = await this.prisma.notificationPreference.findUnique({
            where: { userId },
        });

        if (!pref?.inApp || !pref?.systemAlerts) return;

        const title = `Document ${action.charAt(0).toUpperCase() + action.slice(1)}`;
        const body = `Your document ${label} has been ${action} successfully.`;

        try {
            const notification = await this.prisma.notification.create({
                data: {
                    title,
                    body,
                    type: NotificationType.SYSTEM,
                    resourceType: NotificationResourceType.DOCUMENT,
                    actorType: 'SYSTEM',
                    metadata: { label, action, timestamp: new Date().toISOString() },
                    recipients: { create: { userId, isRead: false } },
                },
            });

            this.notificationGateway.sendNotificationToUser(userId, {
                notificationId: notification.id,
                title,
                body,
                type: notification.type,
                metadata: notification.metadata,
                createdAt: notification.createdAt,
            });
        } catch (error) {
            console.error(`[Document Notification Error]`, error);
        }
    }
}