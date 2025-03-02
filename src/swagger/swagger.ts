import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfigOptions } from './swagger.interface';

const title = 'Swagger Nimble API';
const description = 'The Swagger API documents';

export const configureSwagger = (
  app: INestApplication,
  apiVersion: string,
  path: string,
  configure: (builder: DocumentBuilder) => void,
  options?: SwaggerConfigOptions,
) => {
  const builder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(apiVersion)
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'X-API-KEY')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'Bearer',
      name: 'access-token',
    });


  if (options?.disabled) {
    return;
  }

  configure(builder);

  const openApi = builder.build();
  const document = SwaggerModule.createDocument(app, openApi);

  SwaggerModule.setup(`${path}/swagger`, app, document, {
    swaggerOptions: {
      displayRequestDuration: true,
    },
  });
};

