import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './setup';

async function bootstrap() {
  const app = setupApp(await NestFactory.create(AppModule));
  const port = Number(process.env.PORT) || 3066;
  await app.listen(port);
  console.log(`To-Do API em http://localhost:${port}/api/todos`);
}
bootstrap();
