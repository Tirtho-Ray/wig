import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDto } from "../dto/register.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {}

    async register(payload: RegisterDto) {
        const { name, email, password } = payload;
        const isExistingUser = await this.prisma.user.findUnique({ where: { email } });
        if (isExistingUser) throw new ConflictException('Email already in use');


        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);

        return this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                status: 'ACTIVE', 
            },
            select: { id: true, email: true, name: true } 
        });
    }
}