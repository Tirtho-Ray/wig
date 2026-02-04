import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentService } from '../service/document.service';
import { CreateDocumentDto } from '../dto/document.dto';
import { UpdateDocumentDto } from '../dto/updateDoc.dto';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { GetUser } from 'src/core/jwt/get-user.decorator';
import { RoleGuard } from 'src/core/jwt/roles.guard';
import { Roles } from 'src/core/jwt/roles.decorator';
import { UserRole } from 'prisma/generated/prisma/enums';

@ApiTags('Documents')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('document')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) { }

    @Post('create-document')
    @Roles(UserRole.USER)
    @ApiOperation({ summary: 'Create document' })
    async create(
        @Body() dto: CreateDocumentDto,
        @GetUser('id') userId: string
    ) {
        const result = await this.documentService.createDocument(dto, userId);
        return {
            message: "Document created successfully",
            data: result
        };
    }

    @Get()
    @Roles(UserRole.USER)
    @ApiOperation({ summary: 'Get current user documents' })
    async findAll(@GetUser('id') userId: string) {
        const result = await this.documentService.getAllDocuments(userId);
        return {
            message: "Your documents fetched successfully",
            data: result
        }
    }

    @Get(':id')
    @Roles(UserRole.USER)
    @ApiOperation({ summary: 'Get document by ID' })
    async findOne(
        @Param('id') id: string,
        @GetUser('id') userId: string
    ) {
        const result = await this.documentService.getDocumentById(id, userId);
        return {
            message: "Document fetched successfully",
            data: result
        }
    }

    @Patch(':id')
    @Roles(UserRole.USER)
    @ApiOperation({ summary: 'Update document' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateDocumentDto,
        @GetUser('id') userId: string
    ) {
        const result = await this.documentService.updateDocument(id, dto, userId);
        return {
            message: "Document updated successfully",
            data: result
        }
    }

    @Delete(':id')
    @Roles(UserRole.USER)
    @ApiOperation({ summary: 'Delete document' })
    async remove(
        @Param('id') id: string,
        @GetUser('id') userId: string
    ) {
        await this.documentService.deleteDocument(id, userId);
        return {
            message: "Document deleted successfully"
        }
    }
}