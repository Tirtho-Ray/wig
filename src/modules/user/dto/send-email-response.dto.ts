import { ApiProperty } from '@nestjs/swagger';
import { EmailSendResultDto } from './email-send-result.dto';

export class SendEmailResponseDto {
    @ApiProperty()
    message: string;

    @ApiProperty({ type: [EmailSendResultDto] })
    results: EmailSendResultDto[];
}
