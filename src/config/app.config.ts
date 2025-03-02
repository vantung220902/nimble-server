import { Inject, Injectable } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import Joi from 'joi';

export const appSchema = {
  NODE_ENV: Joi.string()
    .valid('local', 'development', 'test', 'staging', 'production')
    .default('development'),
  APP_NAME: Joi.string().default('API Service'),
  APP_PORT: Joi.number().default(5000),
  API_URL: Joi.string(),
  API_KEY: Joi.string(),
  STAGE: Joi.string().default('dev'),
  JWT_SECRET: Joi.string(),
  REDIS_HOST: Joi.string(),
  REDIS_PORT: Joi.number(),
  JWT_EXPIRES_IN: Joi.string(),
  EMAIL_FORM: Joi.string(),
  SENDGRID_API_KEY: Joi.string(),
  WEB_URL: Joi.string(),
  AWS_S3_STORAGE_BUCKET_ARN: Joi.string(),
};

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV,
  name: process.env.APP_NAME,
  port: process.env.APP_PORT,
  apiUrl: process.env.API_URL,
  apiKey: process.env.API_KEY,
  stage: process.env.STAGE,
  jwtSecret: process.env.JWT_SECRET,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  emailForm: process.env.EMAIL_FORM,
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  webUrl: process.env.WEB_URL,
  bucketS3Name: process.env.AWS_S3_STORAGE_BUCKET,
}));

export type Environment =
  | 'local'
  | 'development'
  | 'test'
  | 'staging'
  | 'production';

export type Stage =
  | 'dev'
  | 'demo'
  | 'test'
  | 'qa'
  | 'stag'
  | 'uat'
  | 'sit'
  | 'prod';

@Injectable()
export class AppConfig {
  public readonly name: string;
  public readonly port: number;
  public readonly env: Environment;
  public readonly apiUrl: string;
  public readonly apiKey: string;
  public readonly stage: Stage;
  public readonly jwtSecret: string;
  public readonly redisHost: string;
  public readonly redisPort: number;
  public readonly jwtExpiresIn: string;
  public readonly emailForm: string;
  public readonly sendGridApiKey: string;
  public readonly webUrl: string;
  public readonly bucketS3Name: string;

  public get isLocal(): boolean {
    return this.env === 'local';
  }

  public get isProduction(): boolean {
    return this.env === 'production';
  }

  constructor(
    @Inject(appConfig.KEY)
    config: ConfigType<typeof appConfig>,
  ) {
    this.name = config.name;
    this.port = Number(config.port);
    this.env = config.env as Environment;
    this.apiUrl = config.apiUrl!;
    this.apiKey = config.apiKey?.split(',')?.[0];
    this.stage = config.stage as Stage;
    this.jwtSecret = config.jwtSecret!;
    this.redisHost = config.redisHost!;
    this.redisPort = Number(config.redisPort!);
    this.jwtExpiresIn = config.jwtExpiresIn!;
    this.emailForm = config.emailForm!;
    this.sendGridApiKey = config.sendGridApiKey!;
    this.webUrl = config.webUrl!;
    this.bucketS3Name = config.bucketS3Name!;
  }
}
