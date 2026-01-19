import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { User } from './entities/user.entity';
import { AiHistory } from './entities/ai-history.entity';


import { GeminiModule } from './modules/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USER') || 'serplantas',
        password: configService.get<string>('DB_PASSWORD') || 'serplantas123',
        database: configService.get<string>('DB_NAME') || 'serplantas_db',
        entities: [User, AiHistory],
        synchronize: true, // ¡Cuidado! En producción real esto debería ser false
        logging: true,
      }),
    }),
    AuthModule,
    GeminiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
