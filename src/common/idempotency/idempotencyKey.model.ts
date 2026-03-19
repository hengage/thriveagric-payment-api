import { Table, Column, Model, DataType, PrimaryKey, Index } from 'sequelize-typescript';

@Table({ tableName: 'idempotency_keys', timestamps: true, updatedAt: false })
export class IdempotencyKey extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  declare key: string;

  @Index
  @Column(DataType.STRING)
  declare resource: string;

  @Index
  @Column(DataType.INTEGER)
  declare resourceId: number;

  @Column(DataType.JSONB)
  declare response: object;

  @Column(DataType.DATE)
  declare createdAt: Date;
}
