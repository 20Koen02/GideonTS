import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('scores')
export default class ScoresModel {
  @PrimaryColumn({ type: 'varchar', length: 22 })
  user!: string;

  @Column({ type: 'varchar', length: 22 })
  guild!: string;

  @Column({ type: 'integer' })
  exp!: number;

  @Column({ type: 'integer' })
  level!: number;

  @Column({ type: 'integer' })
  total_exp!: number;

  @Column({ type: 'timestamp' })
  cooldown_till!: Date;
}
