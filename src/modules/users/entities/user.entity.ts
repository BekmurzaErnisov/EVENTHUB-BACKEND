import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'user' })
  role: 'user' | 'admin';

  @Exclude()
  @Column({ select: false, default: '' })
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null

  @CreateDateColumn()
  cratedAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  delatedAt: Date;
}
