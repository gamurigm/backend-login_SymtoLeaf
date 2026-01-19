import { Controller, Post, Body, UseGuards, UploadedFile, UseInterceptors, Request, Get, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { GeminiService } from '../services/gemini.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('AI Analysis')
@Controller('ai')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) { }

    @Get('history')
    @ApiOperation({ summary: 'Get user AI interaction history' })
    async getHistory(@Request() req) {
        const history = await this.geminiService.getHistory(req.user.id);
        return { success: true, data: history };
    }

    @Delete('history')
    @ApiOperation({ summary: 'Clear chat history' })
    async clearHistory(@Request() req) {
        await this.geminiService.clearChatHistory(req.user.id);
        return { success: true, message: 'Chat history cleared' };
    }

    @Post('chat')
    @ApiOperation({ summary: 'Chat with the AI Assistant' })
    async chat(@Request() req, @Body('message') message: string) {
        // req.user viene del AuthGuard(jwt)
        const userId = req.user.id;
        const response = await this.geminiService.generateText(userId, message);
        return { success: true, response };
    }

    @Post('analyze-image')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Analyze an uploaded plant image' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                prompt: {
                    type: 'string',
                }
            },
        },
    })
    async analyzeImage(
        @Request() req,
        @UploadedFile() file: Express.Multer.File,
        @Body('prompt') prompt: string
    ) {
        const userId = req.user.id;
        const aiResponse = await this.geminiService.analyzeImageWithPrompt(
            userId,
            file.buffer,
            prompt || 'Analiza esta planta y detecta si tiene alguna enfermedad. Responde en español.',
            file.mimetype
        );
        return { success: true, response: aiResponse };
    }
}

