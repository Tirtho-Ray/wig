
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmContactDto, UpdateEmContactDto } from '../dto/emContact.dto';


@Injectable()
export class EmContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmContactDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!userExists) {
      throw new HttpException({ message: 'User does not exist' }, HttpStatus.BAD_REQUEST);
    }

    return this.prisma.emContact.create({ data: dto });
  }

  async findAll() {
    return this.prisma.emContact.findMany({
      include: { user: true }
    });
  }

  async findOne(id: string) {
    const contact = await this.prisma.emContact.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!contact) {
      throw new HttpException({ message: 'Contact not found' }, HttpStatus.NOT_FOUND);
    }
    return contact;
  }

  async update(id: string, dto: UpdateEmContactDto) {
    await this.findOne(id); 
    return this.prisma.emContact.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.emContact.delete({ where: { id } });
  }
}