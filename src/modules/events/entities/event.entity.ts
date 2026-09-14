import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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

  @Column('decimal', { default: 0 })
  price: number;

  @Column()
  capacity: number;

  @Column()
  image: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizerId' })
  organizer!: User;

  @ManyToOne(() => Category, (category) => category.events, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoty_id' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;
}
