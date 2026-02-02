import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from '../dto/document.dto';
import { UpdateDocumentDto } from '../dto/updateDoc.dto';


@Injectable()
export class DocumentService {
    constructor(private readonly prisma: PrismaService) { }

    async createDocument(dto: CreateDocumentDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });

        if (!userExists) {
            throw new BadRequestException('User does not exist');
        }

        return this.prisma.document.create({
            data: {
                label: dto.label,
                value: dto.value,
                category: dto.category,
                documentPhoto: dto.documentPhoto,
                userId: dto.userId,
            },
        });
    }

    async getAllDocuments() {
        return this.prisma.document.findMany({
            include: {
                user: true,
            },
        });
    }

    async getDocumentById(id: string) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        return document;
    }


    async updateDocument(id: string, dto: UpdateDocumentDto) {
        await this.getDocumentById(id);

        return this.prisma.document.update({
            where: { id },
            data: dto,
        });
    }


    async deleteDocument(id: string) {
        await this.getDocumentById(id);

        return this.prisma.document.delete({
            where: { id },
        });
    }
}
