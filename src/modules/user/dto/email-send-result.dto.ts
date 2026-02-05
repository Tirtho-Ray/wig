import { ApiProperty } from '@nestjs/swagger';

export class EmailSendResultDto {
    @ApiProperty()
    contactId: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ enum: ['success', 'failed'] })
    status: 'success' | 'failed';

    @ApiProperty({ required: false })
    reason?: string;
}
