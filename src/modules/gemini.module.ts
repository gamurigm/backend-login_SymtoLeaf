import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiHistory } from '../entities/ai-history.entity';
import { GeminiController } from '../controllers/gemini.controller';
import { GeminiService } from '../services/gemini.service';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([AiHistory]),
    ],
    controllers: [GeminiController],
    providers: [GeminiService],
    exports: [GeminiService],
})
export class GeminiModule { }
