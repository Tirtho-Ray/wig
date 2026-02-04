import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmContactDto, UpdateEmContactDto } from '../dto/emContact.dto';

@Injectable()
export class EmContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmContactDto, userId: string) {
    return this.prisma.emContact.create({
      data: {
        ...dto,
        userId: userId
      }
    });
  }

  async findAll(userId: string) {
    return this.prisma.emContact.findMany({
      where: { userId }
    });
  }

  async findOne(id: string, userId: string) {
    const contact = await this.prisma.emContact.findFirst({
      where: { id, userId }
    });

    if (!contact) {
      throw new HttpException({ message: 'Contact not found or access denied' }, HttpStatus.NOT_FOUND);
    }
    return contact;
  }

  async update(id: string, dto: UpdateEmContactDto, userId: string) {
    await this.findOne(id, userId); 
    return this.prisma.emContact.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.emContact.delete({ where: { id } });
  }
}