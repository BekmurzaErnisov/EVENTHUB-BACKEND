import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column()
  passwordHash: string

  @CreateDateColumn()
  cratedAt: Date

  @UpdateDateColumn()
  updateAt: Date
}
