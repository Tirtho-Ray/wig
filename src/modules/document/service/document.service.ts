import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from '../dto/document.dto';
import { UpdateDocumentDto } from '../dto/updateDoc.dto';

@Injectable()
export class DocumentService {
    constructor(private readonly prisma: PrismaService) { }

    async createDocument(dto: CreateDocumentDto, userId: string) {
        return this.prisma.document.create({
            data: {
                label: dto.label,
                value: dto.value,
                category: dto.category,
                documentPhoto: dto.documentPhoto,
                userId: userId, 
            },
        });
    }

    async getAllDocuments(userId: string) {
        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getDocumentById(id: string, userId: string) {
        const document = await this.prisma.document.findFirst({
            where: { id, userId }, 
        });

        if (!document) {
            throw new NotFoundException('Document not found or you do not have access');
        }

        return document;
    }

    async updateDocument(id: string, dto: UpdateDocumentDto, userId: string) {
        await this.getDocumentById(id, userId);

        return this.prisma.document.update({
            where: { id },
            data: dto,
        });
    }

    async deleteDocument(id: string, userId: string) {
        await this.getDocumentById(id, userId);

        return this.prisma.document.delete({
            where: { id },
        });
    }
}