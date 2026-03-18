import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import { Profile } from '../profiles/profile.model';
import { ContractStatus } from '../../constants/enums';

@Table({ tableName: 'contracts', timestamps: false })
export class Contract extends Model {
  @Column(DataType.TEXT)
  terms!: string;

  @Default(ContractStatus.NEW)
  @Column(DataType.ENUM(...Object.values(ContractStatus)))
  status!: ContractStatus;

  @ForeignKey(() => Profile)
  @Column
  clientId!: number;

  @ForeignKey(() => Profile)
  @Column
  contractorId!: number;

  @BelongsTo(() => Profile, 'clientId')
  client!: Profile;

  @BelongsTo(() => Profile, 'contractorId')
  contractor!: Profile;
}

