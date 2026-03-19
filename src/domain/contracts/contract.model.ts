import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, Default, Index } from 'sequelize-typescript';
import { Profile } from '../profiles/profile.model';
import { Job } from '../jobs/job.model';
import { ContractStatus } from '../../constants/enums';

@Table({ tableName: 'contracts', timestamps: false })
export class Contract extends Model {
  @Column(DataType.TEXT)
  declare terms: string;

  @Index
  @Default(ContractStatus.NEW)
  @Column(DataType.ENUM(...Object.values(ContractStatus)))
  declare status: ContractStatus;

  @Index
  @ForeignKey(() => Profile)
  @Column
  declare clientId: number;

  @Index
  @ForeignKey(() => Profile)
  @Column
  declare contractorId: number;

  @BelongsTo(() => Profile, 'clientId')
  declare client: Profile;

  @BelongsTo(() => Profile, 'contractorId')
  declare contractor: Profile;
  
  @HasMany(() => Job)
  declare jobs: Job[];
}
