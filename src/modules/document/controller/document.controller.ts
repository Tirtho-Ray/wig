import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { DocumentService } from '../service/document.service';
import { CreateDocumentDto } from '../dto/document.dto';
import { UpdateDocumentDto } from '../dto/updateDoc.dto';


@ApiTags('Documents')
@Controller('document')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) { }

    @Post('create-document')
    @ApiOperation({ summary: 'Create document' })
    async create(@Body() dto: CreateDocumentDto) {
        const result = await this.documentService.createDocument(dto);
        return {
            message: "Document create successfully",
            data: result
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all documents' })
    async findAll() {
        const result = await this.documentService.getAllDocuments();
        return {
            message: "All Document get successfully",
            data: result
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get document by ID' })
    @ApiParam({ name: 'id', example: 'doc_ulid_here' })
    async findOne(@Param('id') id: string) {
        const result = await this.documentService.getDocumentById(id);
        return {
            message: "Single Doc get successfully",
            data: result
        }
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update document' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateDocumentDto,
    ) {
        const result = await this.documentService.updateDocument(id, dto);
        return {
            message: "Document update successfully",
            data: result
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete document' })

    async remove(@Param('id') id: string) {
        const result = await this.documentService.deleteDocument(id);
        return {
            message: "Document delete successfully",
            data: result
        }
    }
}
