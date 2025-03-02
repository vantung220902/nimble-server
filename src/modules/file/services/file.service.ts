import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { normalizeFileName } from '@common/utils';
import { AppConfig } from '@config';
import { Injectable } from '@nestjs/common';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { GetPrivateWriteUrlRequestQuery } from '../application/queries/get-private-write-url/get-private-write-url.request-query';
import { GetPrivateReadUrlDto } from '../dtos';
import { PRE_SIGN_URL_EXPIRES_IN_SECONDS } from '../file.enum';

@Injectable()
export class FileService {
  private readonly s3Client = new S3Client({});

  constructor(private readonly appConfig: AppConfig) {}

  public async getContentFromUrl(url: string): Promise<string[]> {
    const { bucket, key } = this.getParamFromUrl(url);

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const { Body } = await this.s3Client.send(getObjectCommand);
    const stream = Body as Readable;

    const keywords: string[] = [];

    return new Promise<string[]>((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row: string) => {
          const keyword = Object.values(row).pop()?.toString().trim();
          if (keyword) {
            keywords.push(keyword);
          }
        })
        .on('end', () => resolve(keywords))
        .on('error', (error) => reject(error));
    });
  }

  public async getPrivateReadUrl(
    option: GetPrivateReadUrlDto,
  ): Promise<string> {
    const { filePath } = option;
    const { bucket, key } = this.getParamFromUrl(filePath);

    const url = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      {
        expiresIn: PRE_SIGN_URL_EXPIRES_IN_SECONDS,
      },
    );

    return url;
  }

  public async getPrivateWriteUrl(
    userId: string,
    query: GetPrivateWriteUrlRequestQuery,
  ): Promise<string> {
    const { type, contentType, fileName, customKey } = query;

    const key =
      customKey ||
      `${type}/${userId}/${uuidv4()}_${normalizeFileName(fileName)}`;

    const url = await getSignedUrl(
      this.s3Client,
      new PutObjectCommand({
        Bucket: this.appConfig.bucketS3Name,
        Key: key,
        ContentType: contentType,
      }),
      {
        expiresIn: PRE_SIGN_URL_EXPIRES_IN_SECONDS,
      },
    );

    return url;
  }

  private getParamFromUrl(url: string) {
    const { hostname, pathname } = new URL(url);
    const bucket = hostname.split('.')[0];
    const key = pathname.slice(1);

    return { bucket, key };
  }
}
