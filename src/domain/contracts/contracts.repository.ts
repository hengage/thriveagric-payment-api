import { Op } from 'sequelize';
import { Contract } from './contract.model';
import { HandleException } from '../../utils/handleException.utils';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { MESSAGES } from '../../utils/messages';

export const contractsRepository = {
  async findByIdForProfile(id: number, profileId: number): Promise<Contract> {
    const contract = await Contract.findOne({
      where: {
        id,
        [Op.or]: [{ clientId: profileId }, { contractorId: profileId }],
      },
    });
    if (!contract) {
      throw new HandleException(
        HTTP_STATUS.NOT_FOUND.code,
        MESSAGES.CONTRACT.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND.name
      );
    }
    return contract;
  },

  async findAllForProfile(profileId: number): Promise<Contract[]> {
    return Contract.findAll({
      where: {
        [Op.or]: [{ clientId: profileId }, { contractorId: profileId }],
      },
    });
  },
};
