import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { NotificationPermissionServices } from "../service/notification.permission.service";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UpdateNotificationPermissionDto } from "../dto/update-permission.dto";
import { GetUser } from "src/core/jwt/get-user.decorator";

@ApiTags("Notification Permission")
@Controller('notification-permission')
export class NotificationPermissionController {
    constructor(private readonly permissionService: NotificationPermissionServices) { }

    @Get()
    @ApiOperation({ summary: 'Get user notification settings' })
    async getMyPermissions(@GetUser('id') userId: string) {
        const result = await this.permissionService.getPermissions(userId);
        return {
            success: true,
             data:result
        };
    }

    @Patch()
    @ApiOperation({ summary: 'Update notification settings' })
    async updatePermissions(
        @GetUser('id') userId: string,
        @Body() dto: UpdateNotificationPermissionDto
    ) {
        const result = await this.permissionService.updateNotificationPermission(userId, dto);
        return {
            success: true,
            message: "Permissions updated successfully",
            data:result
        };
    }
}