import { PartialType } from '@nestjs/swagger'; 
import { CreateEmContactDto } from "./emContact.dto";

export class UpdateEmContactDto extends PartialType(CreateEmContactDto) {}