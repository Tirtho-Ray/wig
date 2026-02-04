import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmContactDto, UpdateEmContactDto } from '../dto/emContact.dto';
import { NotificationResourceType, NotificationType } from 'prisma/generated/prisma/enums';
import { NotificationGateway } from 'src/modules/notification/gateway/notification.gateway';

@Injectable()
export class EmContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  async create(dto: CreateEmContactDto, userId: string) {
    const emContact = await this.prisma.emContact.create({
      data: { ...dto, userId },
    });
    await this.sendEmContactNotification(userId, emContact.name, 'added');
    return emContact;
  }

  async findAll(userId: string) {
    return this.prisma.emContact.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const contact = await this.prisma.emContact.findFirst({ where: { id, userId } });
    if (!contact) {
      throw new HttpException({ message: 'Contact not found' }, HttpStatus.NOT_FOUND);
    }
    return contact;
  }

  async update(id: string, dto: UpdateEmContactDto, userId: string) {
    await this.findOne(id, userId);
    const updated = await this.prisma.emContact.update({
      where: { id },
      data: dto,
    });
    await this.sendEmContactNotification(userId, updated.name, 'updated');
    return updated;
  }

  async remove(id: string, userId: string) {
    const contact = await this.findOne(id, userId);
    await this.prisma.emContact.delete({ where: { id } });
    await this.sendEmContactNotification(userId, contact.name, 'removed');
    return { success: true };
  }

  private async sendEmContactNotification(
    userId: string,
    contactName: string,
    action: 'added' | 'updated' | 'removed',
  ) {
    const pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref?.inApp || !pref?.systemAlerts) return;

    const title = `Emergency Contact ${action.charAt(0).toUpperCase() + action.slice(1)}`;
    const body = `Emergency contact ${contactName} was ${action} successfully.`;

    try {
      const notification = await this.prisma.notification.create({
        data: {
          title,
          body,
          type: NotificationType.SYSTEM,
          resourceType: NotificationResourceType.EMERGENCY_CONTACT,
          actorType: 'SYSTEM',
          metadata: { contactName, action, timestamp: new Date().toISOString() },
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
      console.error(`[EmContact Notification Error]`, error);
    }
  }
}