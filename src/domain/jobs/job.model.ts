import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { Contract } from '../contracts/contract.model';

@Table({ tableName: 'jobs', timestamps: false })
export class Job extends Model {
  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.BIGINT)
  price!: bigint;

  @Default(false)
  @Column(DataType.BOOLEAN)
  paid!: boolean;

  @Column(DataType.DATE)
  paymentDate!: Date | null;

  @ForeignKey(() => Contract)
  @Column
  contractId!: number;

  @BelongsTo(() => Contract)
  contract!: Contract;
}

