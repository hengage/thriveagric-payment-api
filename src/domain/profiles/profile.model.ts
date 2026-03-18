import { Table, Column, Model, DataType, Default } from 'sequelize-typescript';
import { ProfileType } from '../../constants/enums';

@Table({ tableName: 'profiles', timestamps: false })
export class Profile extends Model {
  @Column(DataType.STRING)
  firstName!: string;

  @Column(DataType.STRING)
  lastName!: string;

  @Column(DataType.STRING)
  profession!: string;

  @Default(0)
  @Column(DataType.BIGINT)
  balance!: bigint;

  @Column(DataType.ENUM(...Object.values(ProfileType)))
  type!: ProfileType;
}
