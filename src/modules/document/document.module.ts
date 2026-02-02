import { Module } from '@nestjs/common';
import { DocumentController } from './controller/document.controller';
import { DocumentService } from './service/document.service';


@Module({
    controllers: [DocumentController],
    providers: [DocumentService],
})
export class DocumentModule { }