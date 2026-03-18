import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default, Index } from 'sequelize-typescript';
import { Contract } from '../contracts/contract.model';

@Table({ tableName: 'jobs', timestamps: false })
export class Job extends Model {
  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.BIGINT)
  declare price: number;

  @Default(false)
  @Index
  @Column(DataType.BOOLEAN)
  declare paid: boolean;

  @Index
  @Column(DataType.DATE)
  declare paymentDate: Date | null;

  @ForeignKey(() => Contract)
  @Column
  declare contractId: number;

  @BelongsTo(() => Contract)
  declare contract: Contract;
}
