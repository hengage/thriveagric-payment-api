import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { Contract } from '../contracts/contract.model';

@Table({ tableName: 'jobs', timestamps: false })
export class Job extends Model {
  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.BIGINT)
  declare price: bigint;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare paid: boolean;

  @Column(DataType.DATE)
  declare paymentDate: Date | null;

  @ForeignKey(() => Contract)
  @Column
  declare contractId: number;

  @BelongsTo(() => Contract)
  declare contract: Contract;
}
