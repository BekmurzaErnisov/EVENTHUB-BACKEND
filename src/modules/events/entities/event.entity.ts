import {Column,Entity,JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from 'src/modules/categories/entities/category.entity';

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

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizerId' })
  organizer!: User;

  @Column()
  capacity!: number;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;
}
