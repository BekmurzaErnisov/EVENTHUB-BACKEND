import { Event } from 'src/modules/events/entities/event.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Event, (event) => event.category)
  events: Event[];
}
