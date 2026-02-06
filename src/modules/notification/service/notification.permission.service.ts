import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateNotificationPermissionDto } from "../dto/update-permission.dto";

@Injectable()
export class NotificationPermissionServices {
    constructor(private readonly prisma: PrismaService) { }

    async getPermissions(userId: string) {
        const preferences = await this.prisma.notificationPreference.findUnique({
            where: { userId }
        });
        if (!preferences) throw new NotFoundException('Preferences not found');
        return preferences;
    }

    async updateNotificationPermission(userId: string, data: UpdateNotificationPermissionDto) {
        return await this.prisma.notificationPreference.update({
            where: { userId },
            data: data
        });
    }
}