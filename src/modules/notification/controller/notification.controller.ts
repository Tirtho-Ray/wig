import { Controller, Get, Patch, Delete, Param, UseGuards } from "@nestjs/common";
import { NotificationService } from "../service/notification.service";

import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger";
import { GetUser } from "src/core/jwt/get-user.decorator";

@ApiTags("Notification")
@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get('my-notification')
    @ApiOperation({ summary: 'Retrieve all active notifications' })
    @ApiResponse({ status: 200, description: 'Success' })
    async getNotifications(@GetUser('userId') userId: string) {
        const result = await this.notificationService.getAllNotification(userId);
        return {
            success: true,
            message: "Notifications retrieved successfully",
            data: result,
        };
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@GetUser('userId') userId: string) {
        const result = await this.notificationService.markAllAsRead(userId);
        return {
            success: true,
            message: `Marked ${result.count} notifications as read`,
            data: result,
        };
    }

    @Patch('read/:id')
    @ApiOperation({ summary: 'Mark a specific notification as read' })
    @ApiParam({ name: 'id', type: 'string' })
    async markAsRead(
        @GetUser('userId') userId: string,
        @Param('id') notificationId: string,
    ) {
        const result = await this.notificationService.markAsRead(userId, notificationId);
        return {
            success: true,
            message: "Notification marked as read",
            data: result,
        };
    }

    @Delete('soft-delete/:id')
    @ApiOperation({ summary: 'Soft delete notification' })
    async softDelete(
        @GetUser('userId') userId: string,
        @Param('id') notificationId: string
    ) {
        await this.notificationService.softDelete(userId, notificationId);
        return {
            success: true,
            message: "Notification soft deleted",
        };
    }

    @Delete('hard-delete/:id')
    @ApiOperation({ summary: 'Permanently delete notification' })
    async hardDelete(@Param('id') notificationId: string) {
        await this.notificationService.hardDelete(notificationId);
        return {
            success: true,
            message: "Notification permanently deleted",
        };
    }
}