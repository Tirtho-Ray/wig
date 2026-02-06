import { Global, Module } from "@nestjs/common";
import { NotificationService } from "./service/notification.service";
import { NotificationController } from "./controller/notification.controller";
import { NotificationGateway } from "./gateway/notification.gateway";
import { NotificationPermissionController } from "./controller/notification.permission.controller";
import { NotificationPermissionServices } from "./service/notification.permission.service";
import { RedisModule } from "src/common/redis/redis.module";
import { WsAuthService } from "./utils/authenticate.helper";
import { JwtService } from "@nestjs/jwt";
;


@Global()
@Module({
    imports:[RedisModule],
    controllers: [
        NotificationController, 
        NotificationPermissionController
    ],
    providers: [
        NotificationService, 
        NotificationGateway, 
        NotificationPermissionServices, 
        WsAuthService, 
        JwtService
        
    ],
    exports: [
        NotificationService, 
        NotificationGateway, 
        NotificationPermissionServices
    ]
})
export class NotificationModule {}
