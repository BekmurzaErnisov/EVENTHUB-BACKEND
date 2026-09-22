import {Column,CreateDateColumn,Entity,JoinColumn,ManyToOne,PrimaryGeneratedColumn,Unique,} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('registrations')
@Unique('UQ_registration_user_event', ['userId', 'eventId'])
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @Column()
  eventId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
