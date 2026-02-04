import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from '../dto/document.dto';
import { UpdateDocumentDto } from '../dto/updateDoc.dto';
import { NotificationResourceType, NotificationType } from 'prisma/generated/prisma/enums';
import { NotificationGateway } from 'src/modules/notification/gateway/notification.gateway';

@Injectable()
export class DocumentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationGateway: NotificationGateway,
    ) { }

    async createDocument(dto: CreateDocumentDto, userId: string) {
        const document = await this.prisma.document.create({
            data: {
                label: dto.label,
                value: dto.value,
                category: dto.category,
                documentPhoto: dto.documentPhoto,
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

    async updateDocument(id: string, dto: UpdateDocumentDto, userId: string) {
        await this.getDocumentById(id, userId);
        const updated = await this.prisma.document.update({
            where: { id },
            data: dto,
        });
        await this.sendDocumentNotification(userId, updated.label, 'updated');
        return updated;
    }

    async deleteDocument(id: string, userId: string) {
        const document = await this.getDocumentById(id, userId);
        await this.prisma.document.delete({
            where: { id },
        });
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