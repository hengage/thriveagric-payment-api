import { sequelize } from '../../config/db';
import { profilesRepository } from './profiles.repository';
import { jobsService } from '../jobs/jobs.service';
import { idempotencyRepository } from '../../common/idempotency';
import { HandleException } from '../../utils/handleException.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';
import { ProfileType } from '../../constants/enums';
import { Profile } from './profile.model';
import { toMajorUnits } from '../../utils/money.utils';

const validateClientType = (profile: Profile) => {
  if (profile.type !== ProfileType.CLIENT) {
    throw new HandleException(
      HTTP_STATUS.FORBIDDEN.code,
      'Only clients can make deposits',
      HTTP_STATUS.FORBIDDEN.name
    );
  }
};

const validateDepositLimit = (amount: number, maxDeposit: number) => {
  if (amount > maxDeposit) {
    throw new HandleException(
      HTTP_STATUS.BAD_REQUEST.code,
      MESSAGES.DEPOSIT.LIMIT_EXCEEDED(maxDeposit),
      HTTP_STATUS.BAD_REQUEST.name
    );
  }
};

export const profilesService = {
  async deposit(userId: number, amount: number, idempotencyKey: string) {
    return sequelize.transaction(async (t) => {
      const profile = await profilesRepository.findByIdLockedOrThrow(userId, t);
      validateClientType(profile);

      const totalUnpaid = await jobsService.getTotalUnpaidForClient(userId);
      const maxDeposit = Math.floor((totalUnpaid * 25) / 100);
      validateDepositLimit(amount, maxDeposit);

      await profilesRepository.incrementBalance(userId, amount, t);
      await profile.reload({ transaction: t });

      const result = { balance: toMajorUnits(profile.balance) };

      await idempotencyRepository.create(
        idempotencyKey,
        'deposit',
        userId,
        { status: 'success', data: result },
        t
      );

      return result;
    });
  },
};
