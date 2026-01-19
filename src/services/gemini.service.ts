import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiHistory, AiInteractionType } from '../entities/ai-history.entity';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(
        private configService: ConfigService,
        @InjectRepository(AiHistory)
        private historyRepository: Repository<AiHistory>,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not found in environment variables');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    async generateText(userId: string, prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Guardar historial
            await this.historyRepository.save({
                userId,
                type: AiInteractionType.CHAT,
                input: prompt,
                output: text,
            });

            return text;
        } catch (error) {
            console.error('Error generating text with Gemini:', error);
            throw new InternalServerErrorException('Failed to generate AI response');
        }
    }

    async analyzeImageWithPrompt(
        userId: string,
        imageBuffer: Buffer,
        prompt: string,
        mimeType: string = 'image/jpeg'
    ): Promise<string> {
        try {
            const visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const imagePart = {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: mimeType,
                },
            };

            const result = await visionModel.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Guardar historial
            await this.historyRepository.save({
                userId,
                type: AiInteractionType.DIAGNOSIS,
                input: prompt,
                output: text,
                metadata: { hasImage: true, mimeType },
            });

            return text;
        } catch (error) {
            console.error('Error analyzing image with Gemini:', error);
            throw new InternalServerErrorException('Failed to analyze image');
        }
    }
    async getHistory(userId: string): Promise<AiHistory[]> {
        return await this.historyRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50 // Limitar a los últimos 50 mensajes
        });
    }

    async clearChatHistory(userId: string): Promise<void> {
        // Eliminar solo el historial de tipo CHAT, preservando los diagnósticos si se desea
        // O eliminar todo con delete({ userId })
        await this.historyRepository.delete({ userId, type: AiInteractionType.CHAT });
    }
}
