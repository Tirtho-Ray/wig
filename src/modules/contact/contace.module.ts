import { Module } from "@nestjs/common";
import { EmContactController } from "./controller/contact.controller";
import { EmContactService } from "./service/contact.service";

@Module({
    controllers:[EmContactController],
    providers:[EmContactService],
     
})

export class EmContactModule {}