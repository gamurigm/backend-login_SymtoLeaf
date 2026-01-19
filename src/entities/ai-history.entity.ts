import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AiInteractionType {
    DIAGNOSIS = 'DIAGNOSIS',
    CHAT = 'CHAT',
}

@Entity('ai_history')
export class AiHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: AiInteractionType,
        default: AiInteractionType.CHAT
    })
    type: AiInteractionType;

    @Column({ type: 'text' })
    input: string; // Prompt del usuario o mensaje

    @Column({ type: 'text' })
    output: string; // Respuesta de la IA

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>; // JSON flexible para guardar detalles extra (confianza, url imagen, etc)

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.history, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;
}
