import {Column,CreateDateColumn,DeleteDateColumn,Entity,JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Registration } from 'src/modules/registrations/entities/registration.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'timestamp with time zone' })
  date!: Date;

  @Column()
  location!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  capacity!: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizerId' })
  organizer!: User;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @OneToMany(() => Registration, (registration) => registration.event)
  registrations?: Registration[];

  registeredCount?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletadAt!: Date;
}
