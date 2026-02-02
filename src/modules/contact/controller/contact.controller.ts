// emContact.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmContactService } from '../service/contact.service';
import { CreateEmContactDto, UpdateEmContactDto } from '../dto/emContact.dto';


@ApiTags('Emergency Contacts')
@Controller('emergency-contact')
export class EmContactController {
  constructor(private readonly emContactService: EmContactService) {}

  @Post()
  @ApiOperation({ summary: 'Add emergency contact' })
  async create(@Body() dto: CreateEmContactDto) {
    const result = await this.emContactService.create(dto);
    return { message: "Contact added successfully", data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  async findAll() {
    const result = await this.emContactService.findAll();
    return { message: "All contacts fetched", data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  async findOne(@Param('id') id: string) {
    const result = await this.emContactService.findOne(id);
    return { message: "Contact details fetched", data: result };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contact' })
  async update(@Param('id') id: string, @Body() dto: UpdateEmContactDto) {
    const result = await this.emContactService.update(id, dto);
    return { message: "Contact updated successfully", data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  async remove(@Param('id') id: string) {
    const result = await this.emContactService.remove(id);
    return { message: "Contact deleted successfully", data: result };
  }
}