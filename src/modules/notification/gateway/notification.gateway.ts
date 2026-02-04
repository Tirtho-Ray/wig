import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters } from '@nestjs/common';
import { WsAuthService } from '../utils/authenticate.helper';
import { RedisService } from 'src/common/redis/services/redis.service';


interface AuthenticatedSocket extends Socket {
    user: { id: string; role: string };
}
@WebSocketGateway({
    namespace: 'notification',
    cors: {
        origin: '*',
        credentials: true
    },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationGateway.name);

    constructor(
        private readonly wsAuth: WsAuthService,
        private readonly redisService: RedisService,
    ) { }

    async handleConnection(client: AuthenticatedSocket) {
        const user = await this.wsAuth.authenticate(client);

        if (!user) {
            this.logger.warn(`Unauthorized connection attempt: ${client.id}`);
            client.emit('error', { message: 'Unauthorized' });
            client.disconnect();
            return;
        }


        client.user = user;


        await client.join(`user_${user.id}`);
        await client.join(`role_${user.role}`);

        await this.redisService.hSet('userSocketMap', user.id, client.id);

        this.logger.log(`Client Connected: ${user.id} (Socket: ${client.id})`);
        client.emit('connectionSuccess', { userId: user.id });
    }

    async handleDisconnect(client: AuthenticatedSocket) {
        if (client.user) {
            const { id } = client.user;
            await this.redisService.hDel('userSocketMap', id);
            await this.redisService.hDel('userActiveChatMap', id);
            this.logger.log(`Client Disconnected: ${id}`);
        }
    }

    sendNotificationToUser(userId: string, payload: any) {
        this.server.to(`user_${userId}`).emit('notification', payload);
    }

    sendNotificationByRole(role: string, payload: any) {
        this.server.to(`role_${role}`).emit('role_notification', payload);
    }

    sendGlobalNotification(payload: any) {
        this.server.emit('global_notification', payload);
    }
}