import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter;

    constructor(private config: ConfigService) {
        const smtpConfig = this.config.get('smtp');

        this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.port === 465,
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendEmail(to: string, subject: string, html: string) {
        const smtpConfig = this.config.get('smtp');

        return this.transporter.sendMail({
            from: smtpConfig.from,
            to,
            subject,
            html,
        });
    }
}


