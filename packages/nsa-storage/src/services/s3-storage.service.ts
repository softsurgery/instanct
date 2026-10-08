import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { StorageRepository } from '../repositories/storage.repository';
import { StorageEntity } from '../entities/storage.entity';
import { StorageBadRequestException } from '../errors/storage.bad-request.error';
import { FileNotFoundException } from '../errors/file.not-found.error';
import { StorageService } from './storage.service';
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ReadStream } from 'typeorm/platform/PlatformTools';

@Injectable()
export class S3StorageService extends StorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(
    readonly storageRepository: StorageRepository,
    readonly configService: ConfigService,
  ) {
    super(storageRepository);

    this.bucket = this.configService.get<string>('s3.bucket') || 'uploads';

    const endpoint =
      this.configService.get<string>('s3.endpoint') || 'localhost';
    const port = this.configService.get<number>('s3.port') || 9000;
    const useSSL = this.configService.get<boolean>('s3.useSSL') || false;
    const protocol = useSSL ? 'https' : 'http';
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${protocol}://${endpoint}:${port}`;

    this.s3Client = new S3Client({
      endpoint: url,
      region: 'us-east-1',
      credentials: {
        accessKeyId:
          this.configService.get<string>('s3.accessKey') || 's3admin',
        secretAccessKey:
          this.configService.get<string>('s3.secretKey') || 's3admin',
      },
      forcePathStyle: true,
    });

    void this.ensureBucketExists();
  }

  getStorageType(): string {
    return 's3';
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        try {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: this.bucket }),
          );
          console.log(`Bucket ${this.bucket} created successfully`);
        } catch (createErr) {
          console.error('Error creating bucket', createErr);
          throw createErr;
        }
      } else {
        console.error('Error ensuring bucket exists', err);
        throw err;
      }
    }
  }

  private bufferToStream(buffer: Buffer): Readable {
    return Readable.from(buffer);
  }

  async loadResource(
    slug: string,
    start?: number,
    end?: number,
  ): Promise<ReadStream> {
    const upload = await this.findBySlug(slug);

    try {
      let range: string | undefined;
      if (start !== undefined || end !== undefined) {
        range = `bytes=${start !== undefined ? start : 0}-${end !== undefined ? end : ''}`;
      }

      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: upload.relativePath,
          Range: range,
        }),
      );

      return response.Body as unknown as ReadStream;
    } catch (error) {
      throw new FileNotFoundException(error);
    }
  }

  async store(
    file: Express.Multer.File,
    isTemporary = true,
    isPrivate = true,
    systematicName?: string,
  ): Promise<StorageEntity> {
    const slug = uuidv4();
    const filename = file.originalname;
    const mimetype = file.mimetype;
    const size = file.size;
    const extension = mime.extension(mimetype) || '';
    const key = extension ? `${slug}.${extension}` : slug;

    const upload = await this.storageRepository.save({
      slug,
      filename,
      mimetype,
      size,
      relativePath: key,
      isTemporary,
      isPrivate,
      systematicName,
    });

    try {
      if (!file.buffer || file.buffer.length === 0) {
        throw new StorageBadRequestException('Failed to store empty file.');
      }

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentLength: size,
          ContentType: mimetype,
        }),
      );
    } catch (error) {
      throw new StorageBadRequestException(`Failed to store file: ${error}`);
    }

    return upload;
  }

  async delete(id: number): Promise<StorageEntity> {
    const upload = await this.findOneById(id);

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: upload.relativePath,
        }),
      );
      await this.storageRepository.softDelete(upload.id);
      return upload;
    } catch (error) {
      throw new StorageBadRequestException(
        `Failed to delete file: ${upload.slug} ${error}`,
      );
    }
  }

  // Store multiple files
  async storeMultipleFiles(
    files: Express.Multer.File[],
    isTemporary = true,
    isPrivate = true,
  ): Promise<StorageEntity[]> {
    return Promise.all(
      files.map((file) => this.store(file, isTemporary, isPrivate, undefined)),
    );
  }

  // Duplicate many files by IDs
  async duplicateMany(ids: number[]): Promise<StorageEntity[]> {
    return Promise.all(ids.map((id) => this.duplicate(id)));
  }

  // Delete a file by slug
  async deleteBySlug(slug: string): Promise<StorageEntity> {
    const upload = await this.findBySlug(slug);
    return this.delete(upload.id);
  }

  // Delete many files by IDs
  async deleteMany(ids: number[]): Promise<void> {
    await Promise.all(ids.map((id) => this.delete(id)));
  }

  async duplicate(id: number): Promise<StorageEntity> {
    const original = await this.findOneById(id);
    const newSlug = uuidv4();
    const extension = mime.extension(original.mimetype) || '';
    const newKey = extension ? `${newSlug}.${extension}` : newSlug;

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: original.relativePath,
        }),
      );

      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(chunk as Buffer);
      const buffer = Buffer.concat(chunks);

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: newKey,
          Body: buffer,
          ContentLength: buffer.length,
          ContentType: original.mimetype,
        }),
      );
    } catch (err) {
      throw new StorageBadRequestException(`Failed to duplicate file: ${err}`);
    }

    return this.storageRepository.save({
      slug: newSlug,
      filename: original.filename,
      mimetype: original.mimetype,
      size: original.size,
      relativePath: newKey,
    });
  }
}
