import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, Default } from 'sequelize-typescript';
import { Profile } from '../profiles/profile.model';
import { Job } from '../jobs/job.model';
import { ContractStatus } from '../../constants/enums';

@Table({ tableName: 'contracts', timestamps: false })
export class Contract extends Model {
  @Column(DataType.TEXT)
  declare terms: string;

  @Default(ContractStatus.NEW)
  @Column(DataType.ENUM(...Object.values(ContractStatus)))
  declare status: ContractStatus;

  @ForeignKey(() => Profile)
  @Column
  declare clientId: number;

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
