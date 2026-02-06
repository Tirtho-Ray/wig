import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3Service {
    private readonly s3: S3Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        const region = this.configService.get<string>('aws.region');
        const bucketName =
            this.configService.get<string>('aws.bucketName');

        if (!region) {
            throw new Error('AWS region is missing');
        }

        if (!bucketName) {
            throw new Error('AWS S3 bucket name is missing');
        }

        this.bucketName = bucketName;

        const accessKeyId =
            this.configService.get<string>('aws.accessKeyId');
        const secretAccessKey =
            this.configService.get<string>('aws.secretAccessKey');

        const s3Config: ConstructorParameters<typeof S3Client>[0] = {
            region,
        };

        if (accessKeyId && secretAccessKey) {
            s3Config.credentials = {
                accessKeyId,
                secretAccessKey,
            };
        }

        this.s3 = new S3Client(s3Config);
    }

    async uploadSingle(
        file: Express.Multer.File,
        folder = 'uploads',
    ): Promise<string> {
        const key = `${folder}/${uuid()}${path.extname(
            file.originalname,
        )}`;

        try {
            await this.s3.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }),
            );
        } catch {
            throw new InternalServerErrorException(
                'Failed to upload file to S3',
            );
        }

        return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    }

    async uploadMultiple(
        files: Express.Multer.File[],
        folder = 'uploads',
    ): Promise<string[]> {
        return Promise.all(
            files.map((file) => this.uploadSingle(file, folder)),
        );
    }

    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;
        const urlParts = fileUrl.split('.com/');
        const key = urlParts.length > 1 ? urlParts[1] : fileUrl;

        try {
            await this.s3.send(
                new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                }),
            );
            console.log(`[S3Service] Successfully deleted: ${key}`);
        } catch (error) {
            console.error(`[S3Service] Failed to delete file from S3: ${key}`, error);
        }
    }
}
