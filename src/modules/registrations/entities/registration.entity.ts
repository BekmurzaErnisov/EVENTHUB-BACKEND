import {Column,CreateDateColumn,Entity,ManyToOne,PrimaryGeneratedColumn,} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  event!: Event;

  @Column()
  eventId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
