import { Table, Column, Model, DataType, Default } from 'sequelize-typescript';
import { ProfileType } from '../../constants/enums';

@Table({ tableName: 'profiles', timestamps: false })
export class Profile extends Model {
  @Column(DataType.STRING)
  declare firstName: string;

  @Column(DataType.STRING)
  declare lastName: string;

  @Column(DataType.STRING)
  declare profession: string;

  @Default(0)
  @Column(DataType.BIGINT)
  declare balance: bigint;

  @Column(DataType.ENUM(...Object.values(ProfileType)))
  declare type: ProfileType;
}
