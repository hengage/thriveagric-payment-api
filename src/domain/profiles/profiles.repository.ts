import { Transaction } from 'sequelize';
import { Profile } from './profile.model';
import { HandleException } from '../../utils/handleException.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';

export const profilesRepository = {
  async findByIdOrThrow(id: number): Promise<Profile> {
    const profile = await Profile.findByPk(id);
    if (!profile) {
      throw new HandleException(
        HTTP_STATUS.UNAUTHORIZED.code,
        MESSAGES.AUTH.PROFILE_NOT_FOUND,
        HTTP_STATUS.UNAUTHORIZED.name
      );
    }
    return profile;
  },

  async findByIdLockedOrThrow(id: number, t: Transaction): Promise<Profile> {
    const profile = await Profile.findOne({
      where: { id },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!profile) {
      throw new HandleException(
        HTTP_STATUS.NOT_FOUND.code,
        MESSAGES.AUTH.PROFILE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND.name
      );
    }
    return profile;
  },

  async decrementBalance(id: number, amount: number, t: Transaction): Promise<void> {
    await Profile.decrement('balance', { by: Number(amount), where: { id }, transaction: t });
  },

  async incrementBalance(id: number, amount: number, t: Transaction): Promise<void> {
    await Profile.increment('balance', { by: Number(amount), where: { id }, transaction: t });
  },
};
