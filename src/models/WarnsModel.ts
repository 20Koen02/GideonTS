import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('warns')
export default class WarnsModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 22 })
  user!: string;

  @Column({ type: 'varchar', length: 22 })
  guild!: string;

  @Column({ type: 'varchar', length: 22 })
  moderator!: string;

  @Column({ type: 'text' })
  reason!: string;
}
