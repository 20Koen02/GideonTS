import {
  Entity, Column, PrimaryGeneratedColumn, Index,
} from 'typeorm';

@Entity('cards')
export default class CardsModel {
  @PrimaryGeneratedColumn('increment')
  id!: string;

  @Column()
  @Index({ unique: true })
  text!: string;

  @Column()
  white!: boolean;
}
