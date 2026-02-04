import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmContactService } from '../service/contact.service';
import { CreateEmContactDto, UpdateEmContactDto } from '../dto/emContact.dto';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';

import { GetUser } from 'src/core/jwt/get-user.decorator';
import { UserRole } from 'prisma/generated/prisma/enums';
import { RoleGuard } from 'src/core/jwt/roles.guard';
import { Roles } from 'src/core/jwt/roles.decorator';


@ApiTags('Emergency Contacts')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('emergency-contact')
export class EmContactController {
  constructor(private readonly emContactService: EmContactService) {}

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Add emergency contact' })
  async create(@Body() dto: CreateEmContactDto, @GetUser('id') userId: string) {
    const result = await this.emContactService.create(dto, userId);
    return { message: "Contact added successfully", data: result };
  }

  @Get()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get all contacts' })
  async findAll(@GetUser('id') userId: string) {
    const result = await this.emContactService.findAll(userId);
    return { message: "All contacts fetched", data: result };
  }

  @Get(':id')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get contact by ID' })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    const result = await this.emContactService.findOne(id, userId);
    return { message: "Contact details fetched", data: result };
  }

  @Patch(':id')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Update contact' })
  async update(
    @Param('id') id: string, 
    @Body() dto: UpdateEmContactDto, 
    @GetUser('id') userId: string
  ) {
    const result = await this.emContactService.update(id, dto, userId);
    return { message: "Contact updated successfully", data: result };
  }

  @Delete(':id')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Delete contact' })
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    await this.emContactService.remove(id, userId);
    return { message: "Contact deleted successfully" };
  }
}